import { createOpenAI } from "@ai-sdk/openai";
import { stepCountIs, streamText, tool } from "ai";
import { z } from "zod/v4";
import {
	type ChatModelId,
	chatModels,
	DEFAULT_CHAT_MODEL,
} from "@/config/billing.config";
import { assertUserIsOrgMember, getSession } from "@/lib/auth/server";
import {
	CreditError,
	calculateCreditCost,
	consumeCredits,
	estimateCreditCost,
	getCreditBalance,
	InsufficientCreditsError,
	logFailedDeduction,
} from "@/lib/billing/credits";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export const maxDuration = 30;

const tokenRouter = createOpenAI({
	apiKey: env.TOKENROUTER_API_KEY,
	baseURL: env.TOKENROUTER_BASE_URL,
});

const ALLOWED_MODEL_IDS = chatModels.map((m) => m.id);

function isAllowedModel(model: string): model is ChatModelId {
	return ALLOWED_MODEL_IDS.includes(model as ChatModelId);
}

const chatRequestSchema = z.object({
	messages: z.array(
		z
			.object({
				role: z.enum(["user", "assistant", "system"]),
				content: z.string().optional(),
			})
			.passthrough(),
	),
	model: z.string().optional(),
	chatId: z.string().uuid().optional(),
	organizationId: z.string().uuid().optional(),
});

function errorResponse(
	error: string,
	message: string,
	status: number,
	details?: Record<string, unknown>,
) {
	return Response.json(
		{ error, message, ...(details && { details }) },
		{ status },
	);
}

/**
 * This is a separate route handler instead of a tRPC procedure because tRPC
 * doesn't support streaming responses. The Vercel AI SDK's `streamText()`
 * returns chunks over time as the LLM generates tokens, which requires raw
 * HTTP streaming (ReadableStream + chunked transfer encoding). tRPC's
 * request/response model and JSON serialization would break this.
 */

export async function POST(req: Request) {
	const session = await getSession();

	if (!session) {
		return errorResponse("unauthorized", "Authentication required", 401);
	}

	let messages: { role: "user" | "assistant" | "system"; content: string }[];
	let chatId: string | undefined;
	let organizationId: string | undefined;
	let selectedModel: ChatModelId = DEFAULT_CHAT_MODEL;

	try {
		const body = await req.json();
		const parsed = chatRequestSchema.parse(body);

		chatId = parsed.chatId;
		organizationId = parsed.organizationId;

		messages = parsed.messages.map((msg) => {
			let content = msg.content ?? "";

			if (!content) {
				const msgAny = msg as unknown as {
					parts?: { type: string; text?: string }[];
				};
				if (Array.isArray(msgAny.parts)) {
					const textPart = msgAny.parts.find((p) => p.type === "text");
					if (textPart?.text) {
						content = textPart.text;
					}
				}
			}

			return { role: msg.role, content };
		});

		if (parsed.model) {
			if (!isAllowedModel(parsed.model)) {
				return errorResponse(
					"invalid_model",
					`Model '${parsed.model}' is not supported. Allowed models: ${ALLOWED_MODEL_IDS.join(", ")}`,
					400,
					{ allowedModels: ALLOWED_MODEL_IDS },
				);
			}
			selectedModel = parsed.model;
		}
	} catch (error) {
		logger.warn({ error }, "Invalid chat request body");
		return errorResponse("invalid_request", "Invalid request body", 400);
	}

	if (organizationId) {
		try {
			await assertUserIsOrgMember(organizationId, session.user.id);
		} catch (error) {
			logger.debug(
				{ error, organizationId, userId: session.user.id },
				"AI chat access denied - user not member of organization",
			);
			return errorResponse("forbidden", "Access denied", 403);
		}
	}

	if (chatId && organizationId) {
		const chat = await prisma.aiChat.findFirst({
			where: { id: chatId, organizationId },
			select: { id: true },
		});

		if (!chat) {
			return errorResponse("not_found", "Chat not found", 404);
		}
	}

	if (chatId && !organizationId) {
		const chat = await prisma.aiChat.findFirst({
			where: { id: chatId, userId: session.user.id, organizationId: null },
			select: { id: true },
		});

		if (!chat) {
			return errorResponse("not_found", "Chat not found", 404);
		}
	}

	if (organizationId) {
		const estimatedCost = estimateCreditCost(selectedModel, messages);

		try {
			const balance = await getCreditBalance(organizationId);

			if (balance.balance < estimatedCost) {
				return errorResponse(
					"insufficient_credits",
					"Not enough credits to send this message",
					402,
					{
						balance: balance.balance,
						estimated: estimatedCost,
						model: selectedModel,
					},
				);
			}
		} catch (error) {
			logger.error({ error, organizationId }, "Failed to check credit balance");
			return errorResponse(
				"internal_error",
				"Failed to check credit balance",
				500,
			);
		}
	}

	// Build startup database tools scoped to the org (only available for org chats)
	const startupTools = organizationId
		? {
				listStartups: tool({
					description:
						"List startups from the organization's pipeline. Use when the user asks about companies, founders, deal pipeline, or wants to browse the startup database. Returns name, founder, email, source, confidence score, pipeline status, description, and thesis reasoning.",
					inputSchema: z.object({
						status: z
							.enum(["SCANNED", "EVALUATED", "QUEUED", "OUTREACHED", "IGNORED"])
							.optional()
							.describe("Filter by pipeline stage"),
						source: z
							.enum(["GITHUB", "PRODUCT_HUNT", "TWITTER", "OTHER"])
							.optional()
							.describe("Filter by discovery source"),
						limit: z
							.number()
							.min(1)
							.max(50)
							.default(20)
							.describe("Maximum number of results to return"),
						sortBy: z
							.enum(["confidenceScore", "scrapedAt", "name"])
							.default("confidenceScore")
							.describe("Sort order"),
					}),
					execute: async ({ status, source, limit, sortBy }) => {
						const where: Record<string, unknown> = { organizationId };
						if (status) where.status = status;
						if (source) where.source = source;

						const orderBy =
							sortBy === "name"
								? { name: "asc" as const }
								: sortBy === "scrapedAt"
									? { scrapedAt: "desc" as const }
									: { confidenceScore: "desc" as const };

						const startups = await prisma.startup.findMany({
							where,
							take: limit,
							orderBy,
							select: {
								name: true,
								founderName: true,
								founderLinkedIn: true,
								email: true,
								source: true,
								sourceUrl: true,
								confidenceScore: true,
								status: true,
								description: true,
								thesisReasoning: true,
								scrapedAt: true,
								sentAt: true,
								draftedEmail: true,
							},
						});

						return {
							count: startups.length,
							startups: startups.map((s) => ({
								...s,
								confidenceScore: `${Math.round(s.confidenceScore * 100)}%`,
								scrapedAt: s.scrapedAt.toISOString().split("T")[0],
								sentAt: s.sentAt?.toISOString().split("T")[0] ?? null,
							})),
						};
					},
				}),

				searchStartups: tool({
					description:
						"Search startups by name, founder name, description, or thesis reasoning. Use when the user is looking for a specific company or person by keyword.",
					inputSchema: z.object({
						query: z.string().describe("Search term to look for"),
					}),
					execute: async ({ query }) => {
						const startups = await prisma.startup.findMany({
							where: {
								organizationId,
								OR: [
									{ name: { contains: query, mode: "insensitive" } },
									{ founderName: { contains: query, mode: "insensitive" } },
									{ email: { contains: query, mode: "insensitive" } },
									{ description: { contains: query, mode: "insensitive" } },
									{ thesisReasoning: { contains: query, mode: "insensitive" } },
								],
							},
							take: 15,
							orderBy: { confidenceScore: "desc" },
							select: {
								name: true,
								founderName: true,
								founderLinkedIn: true,
								email: true,
								source: true,
								sourceUrl: true,
								confidenceScore: true,
								status: true,
								description: true,
								thesisReasoning: true,
								scrapedAt: true,
								sentAt: true,
								draftedEmail: true,
							},
						});

						return {
							query,
							count: startups.length,
							startups: startups.map((s) => ({
								...s,
								confidenceScore: `${Math.round(s.confidenceScore * 100)}%`,
								scrapedAt: s.scrapedAt.toISOString().split("T")[0],
								sentAt: s.sentAt?.toISOString().split("T")[0] ?? null,
							})),
						};
					},
				}),

				getStartupStats: tool({
					description:
						"Get summary statistics about the startup pipeline: total count, breakdown by pipeline status, breakdown by discovery source, and average confidence score. Use when the user asks for an overview or summary of the pipeline.",
					inputSchema: z.object({}),
					execute: async () => {
						const [byStatus, bySource, agg] = await Promise.all([
							prisma.startup.groupBy({
								by: ["status"],
								where: { organizationId },
								_count: { _all: true },
							}),
							prisma.startup.groupBy({
								by: ["source"],
								where: { organizationId },
								_count: { _all: true },
							}),
							prisma.startup.aggregate({
								where: { organizationId },
								_count: { _all: true },
								_avg: { confidenceScore: true },
							}),
						]);

						return {
							total: agg._count._all,
							avgConfidenceScore: `${Math.round((agg._avg.confidenceScore ?? 0) * 100)}%`,
							byStatus: byStatus.map((r) => ({
								status: r.status,
								count: r._count._all,
							})),
							bySource: bySource.map((r) => ({
								source: r.source,
								count: r._count._all,
							})),
						};
					},
				}),
		  }
		: undefined;

	const systemPrompt = organizationId
		? `You are an AI assistant embedded in a venture capital CRM. You have real-time access to the organization's startup intelligence database via tools.

When users ask about startups, founders, companies, the deal pipeline, outreach status, or investment opportunities, always use the available tools to retrieve live data before answering. Do not guess or make up startup details — always look them up.

Tools available:
- listStartups: Browse all startups with optional filters (pipeline stage, source, sort order)
- searchStartups: Find specific startups by keyword (name, founder, description)
- getStartupStats: Get a summary overview of the entire pipeline

Format startup data clearly in your responses. Show confidence scores as percentages, highlight pipeline status, and include founder contact info when relevant.`
		: "You are a helpful AI assistant.";

	const result = streamText({
		model: tokenRouter(selectedModel),
		system: systemPrompt,
		messages,
		tools: startupTools,
		stopWhen: stepCountIs(5),
		async onFinish({ text, usage }) {
			const inputTokens = usage?.inputTokens ?? 0;
			const outputTokens = usage?.outputTokens ?? 0;

			if (organizationId) {
				const actualCost = calculateCreditCost(
					selectedModel,
					inputTokens,
					outputTokens,
				);

				try {
					await consumeCredits({
						organizationId,
						amount: actualCost,
						description: `AI Chat (${selectedModel})`,
						model: selectedModel,
						inputTokens,
						outputTokens,
						referenceType: "ai_chat",
						referenceId: chatId,
						createdBy: session.user.id,
					});
				} catch (error) {
					const errorCode =
						error instanceof InsufficientCreditsError
							? "INSUFFICIENT_CREDITS"
							: error instanceof CreditError
								? error.code
								: "UNKNOWN_ERROR";

					const errorMessage =
						error instanceof Error ? error.message : "Unknown error";

					await logFailedDeduction({
						organizationId,
						amount: actualCost,
						errorCode,
						errorMessage,
						model: selectedModel,
						inputTokens,
						outputTokens,
						referenceType: "ai_chat",
						referenceId: chatId,
						userId: session.user.id,
					});

					if (error instanceof InsufficientCreditsError) {
						logger.warn(
							{
								organizationId,
								model: selectedModel,
								required: actualCost,
								available: error.available,
							},
							"Insufficient credits during streaming - logged for reconciliation",
						);
					} else {
						logger.error(
							{ error, organizationId, model: selectedModel },
							"Failed to deduct credits - logged for reconciliation",
						);
					}
				}
			}

			if (chatId) {
				const updatedMessages = [
					...messages,
					{ role: "assistant", content: text },
				];

				const where = organizationId
					? { id: chatId, organizationId }
					: { id: chatId, userId: session.user.id, organizationId: null };

				const updated = await prisma.aiChat.updateMany({
					where,
					data: { messages: JSON.stringify(updatedMessages) },
				});

				if (updated.count === 0) {
					logger.warn(
						{ chatId, organizationId, userId: session.user.id },
						"Failed to persist AI chat messages - chat not found or not owned by user/org",
					);
				}
			}
		},
	});

	return result.toTextStreamResponse();
}
