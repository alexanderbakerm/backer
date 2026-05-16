import { NextResponse } from "next/server";
import {
	buildThesisEvaluationPrompt,
	butterbaseUpsertLeadPlaceholder,
	isolatedMemoryFounderDedupeLookup,
	logTargetedDiscoveryDomSession,
	resendQueuePersonalizedOutreach,
	triggerBrightDataGithubScraper,
	triggerBrightDataXTrendsScraper,
} from "@/lib/shadow-partner/service";
import type { ShadowPartnerStatusPayload } from "@/lib/shadow-partner/types";

export const runtime = "nodejs";

/**
 * GET — mock "stack status" for dashboards & future polling.
 */
export async function GET(): Promise<NextResponse<ShadowPartnerStatusPayload>> {
	const payload: ShadowPartnerStatusPayload = {
		agentActive: true,
		metrics: {
			foundersScanned: 12840,
			foundersScannedWeekDeltaPct: 12.4,
			thesisMatches: 186,
			outreachQueued: 24,
			responseRatePct: 31.2,
			responseRateWeekDeltaPct: 4.1,
		},
		memory: {
			vectorCount: 842_900,
			capacity: 1_000_000,
			lastCompactAt: new Date().toISOString(),
		},
		integrations: {
			brightData: "idle",
			targetedDiscovery: "idle",
			isolatedMemory: "ready",
			ollama: "idle",
			butterbase: "connected",
			resend: "configured",
		},
	};

	return NextResponse.json(payload);
}

type PostBody = {
	action?: "manual-scan";
	thesisSnippet?: string;
};

/**
 * POST — skeleton orchestration hook (extend with auth + org scope).
 */
export async function POST(
	req: Request,
): Promise<NextResponse<{ ok: boolean; steps: string[] }>> {
	let body: PostBody = {};
	try {
		body = (await req.json()) as PostBody;
	} catch {
		body = {};
	}

	const steps: string[] = [];

	if (body.action === "manual-scan") {
		const gh = await triggerBrightDataGithubScraper({
			seedQuery: "infra",
			maxResults: 50,
		});
		steps.push(`bright_data.github job ${gh.jobId}`);

		const x = await triggerBrightDataXTrendsScraper({
			keywords: ["devtools", "agent", "infra"],
		});
		steps.push(`bright_data.x job ${x.jobId}`);

		await logTargetedDiscoveryDomSession({
			target: "linkedin",
			sessionId: "mock-session",
			event: "scroll_founders_feed",
		});
		steps.push("targeted_discovery.linkedin session logged");

		const dedupe = await isolatedMemoryFounderDedupeLookup("founder_mock_01");
		steps.push(
			dedupe.known
				? "isolated_memory: duplicate cluster detected"
				: "isolated_memory: novel founder_id",
		);

		const prompt = buildThesisEvaluationPrompt({
			thesis: body.thesisSnippet ?? "(default thesis)",
			lead: {
				founderId: "founder_mock_01",
				founderName: "Alex Mercer",
				startupName: "LatticeRun",
				platform: "product_hunt",
			},
			scrapedEvidence: "Launch: AI SRE copilot for Kubernetes...",
		});
		steps.push(`ollama_prompt_bytes=${prompt.length}`);

		await butterbaseUpsertLeadPlaceholder({
			founderId: "founder_mock_01",
			organizationId: "org_mock",
			status: "sourced",
			rawPayloadRef: "s3://mock-bucket/payload.json",
		});
		steps.push("butterbase lead upserted");

		await resendQueuePersonalizedOutreach({
			to: "founder@example.com",
			subject: "Re: LatticeRun + thesis fit",
			html: "<p>Mock draft</p>",
			idempotencyKey: "shadow-partner-manual-scan",
		});
		steps.push("resend queue acknowledged (dry-run in service stub)");
	}

	return NextResponse.json({ ok: true, steps });
}
