import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { appendAnd, prisma } from "@/lib/db";
import { getStartupsPlaceholder } from "@/lib/shadow-partner/startups-placeholder";
import {
	bulkDeleteStartupsSchema,
	bulkUpdateStartupStatusSchema,
	createStartupSchema,
	deleteStartupSchema,
	exportStartupsSchema,
	listStartupsSchema,
	updateStartupSchema,
} from "@/schemas/organization-startup-schemas";
import { createTRPCRouter, protectedOrganizationProcedure } from "@/trpc/init";

export const organizationStartupRouter = createTRPCRouter({
	list: protectedOrganizationProcedure
		.input(listStartupsSchema)
		.query(async ({ ctx, input }) => {
			const where: Prisma.StartupWhereInput = {
				organizationId: ctx.organization.id,
			};

			if (input.query) {
				const q = input.query;
				where.OR = [
					{ name: { contains: q, mode: "insensitive" } },
					{ founderName: { contains: q, mode: "insensitive" } },
					{ email: { contains: q, mode: "insensitive" } },
					{ description: { contains: q, mode: "insensitive" } },
					{ thesisReasoning: { contains: q, mode: "insensitive" } },
					{ sourceUrl: { contains: q, mode: "insensitive" } },
				];
			}

			if (input.filters?.status && input.filters.status.length > 0) {
				where.status = { in: input.filters.status };
			}

			if (input.filters?.source && input.filters.source.length > 0) {
				where.source = { in: input.filters.source };
			}

			if (input.filters?.createdAt && input.filters.createdAt.length > 0) {
				const now = new Date();
				const dateOr: Prisma.StartupWhereInput[] = [];

				for (const range of input.filters.createdAt) {
					switch (range) {
						case "today": {
							const start = new Date(
								now.getFullYear(),
								now.getMonth(),
								now.getDate(),
							);
							const end = new Date(
								now.getFullYear(),
								now.getMonth(),
								now.getDate() + 1,
							);
							dateOr.push({ createdAt: { gte: start, lt: end } });
							break;
						}
						case "this-week": {
							const weekStart = new Date(
								now.getFullYear(),
								now.getMonth(),
								now.getDate() - now.getDay(),
							);
							dateOr.push({ createdAt: { gte: weekStart } });
							break;
						}
						case "this-month": {
							const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
							dateOr.push({ createdAt: { gte: monthStart } });
							break;
						}
						case "older": {
							const monthAgo = new Date(
								now.getFullYear(),
								now.getMonth() - 1,
								now.getDate(),
							);
							dateOr.push({ createdAt: { lte: monthAgo } });
							break;
						}
					}
				}

				if (dateOr.length > 0) {
					appendAnd(where, { OR: dateOr });
				}
			}

			const sortOrder = input.sortOrder === "desc" ? "desc" : "asc";
			const orderBy: Prisma.StartupOrderByWithRelationInput =
				input.sortBy === "name"
					? { name: sortOrder }
					: input.sortBy === "founderName"
						? { founderName: sortOrder }
						: input.sortBy === "email"
							? { email: sortOrder }
							: input.sortBy === "confidenceScore"
								? { confidenceScore: sortOrder }
								: input.sortBy === "status"
									? { status: sortOrder }
									: input.sortBy === "source"
										? { source: sortOrder }
										: input.sortBy === "scrapedAt"
											? { scrapedAt: sortOrder }
											: { createdAt: sortOrder };

			const [startups, total] = await Promise.all([
				prisma.startup.findMany({
					where,
					take: input.limit,
					skip: input.offset,
					orderBy,
				}),
				prisma.startup.count({ where }),
			]);

			// Return placeholder data when the org has no real records and no
			// active search/filter — gives the page a populated look out of the box.
			const hasFilters =
				input.query ||
				input.filters?.status?.length ||
				input.filters?.source?.length ||
				input.filters?.createdAt?.length;

			if (total === 0 && !hasFilters) {
				const all = getStartupsPlaceholder(ctx.organization.id);
				return {
					startups: all.slice(input.offset, input.offset + input.limit),
					total: all.length,
					isPlaceholder: true,
				};
			}

			return { startups, total, isPlaceholder: false };
		}),

	get: protectedOrganizationProcedure
		.input(deleteStartupSchema)
		.query(async ({ ctx, input }) => {
			const startup = await prisma.startup.findFirst({
				where: { id: input.id, organizationId: ctx.organization.id },
			});

			if (!startup) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Startup not found",
				});
			}

			return startup;
		}),

	create: protectedOrganizationProcedure
		.input(createStartupSchema)
		.mutation(async ({ ctx, input }) => {
			const { sentAt, ...rest } = input;
			return prisma.startup.create({
				data: {
					...rest,
					organizationId: ctx.organization.id,
					sentAt: sentAt ?? undefined,
				},
			});
		}),

	update: protectedOrganizationProcedure
		.input(updateStartupSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;

			return prisma.$transaction(async (tx) => {
				const result = await tx.startup.updateMany({
					where: { id, organizationId: ctx.organization.id },
					data,
				});

				if (result.count === 0) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Startup not found",
					});
				}

				const updated = await tx.startup.findUnique({ where: { id } });
				if (!updated) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to load updated startup",
					});
				}
				return updated;
			});
		}),

	delete: protectedOrganizationProcedure
		.input(deleteStartupSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await prisma.startup.deleteMany({
				where: { id: input.id, organizationId: ctx.organization.id },
			});

			if (result.count === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Startup not found",
				});
			}

			return { success: true };
		}),

	bulkDelete: protectedOrganizationProcedure
		.input(bulkDeleteStartupsSchema)
		.mutation(async ({ ctx, input }) => {
			const deleted = await prisma.startup.deleteMany({
				where: { id: { in: input.ids }, organizationId: ctx.organization.id },
			});

			return { success: true, count: deleted.count };
		}),

	bulkUpdateStatus: protectedOrganizationProcedure
		.input(bulkUpdateStartupStatusSchema)
		.mutation(async ({ ctx, input }) => {
			const updated = await prisma.startup.updateMany({
				where: { id: { in: input.ids }, organizationId: ctx.organization.id },
				data: { status: input.status },
			});

			return { success: true, count: updated.count };
		}),

	exportSelectedToCsv: protectedOrganizationProcedure
		.input(exportStartupsSchema)
		.mutation(async ({ ctx, input }) => {
			const startups = await prisma.startup.findMany({
				where: {
					id: { in: input.startupIds },
					organizationId: ctx.organization.id,
				},
				select: {
					id: true,
					name: true,
					founderName: true,
					founderLinkedIn: true,
					email: true,
					description: true,
					source: true,
					sourceUrl: true,
					scrapedAt: true,
					confidenceScore: true,
					thesisReasoning: true,
					status: true,
					draftedEmail: true,
					sentAt: true,
					createdAt: true,
					updatedAt: true,
				},
			});
			const Papa = await import("papaparse");
			return Papa.unparse(startups);
		}),

	stats: protectedOrganizationProcedure.query(async ({ ctx }) => {
		const orgId = ctx.organization.id;
		const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

		const [byStatus, bySource, agg, thisWeek] = await Promise.all([
			prisma.startup.groupBy({
				by: ["status"],
				where: { organizationId: orgId },
				_count: { _all: true },
			}),
			prisma.startup.groupBy({
				by: ["source"],
				where: { organizationId: orgId },
				_count: { _all: true },
			}),
			prisma.startup.aggregate({
				where: { organizationId: orgId },
				_count: { _all: true },
				_avg: { confidenceScore: true },
			}),
			prisma.startup.count({
				where: { organizationId: orgId, scrapedAt: { gte: sevenDaysAgo } },
			}),
		]);

		if (agg._count._all === 0) {
			const placeholder = getStartupsPlaceholder(orgId);
			const sevenDaysAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
			const statusCounts = new Map<string, number>();
			const sourceCounts = new Map<string, number>();
			let sumConfidence = 0;
			let thisWeekCount = 0;
			for (const s of placeholder) {
				statusCounts.set(s.status, (statusCounts.get(s.status) ?? 0) + 1);
				sourceCounts.set(s.source, (sourceCounts.get(s.source) ?? 0) + 1);
				sumConfidence += s.confidenceScore;
				if (s.scrapedAt.getTime() >= sevenDaysAgoMs) thisWeekCount++;
			}
			return {
				total: placeholder.length,
				avgConfidence: sumConfidence / placeholder.length,
				thisWeek: thisWeekCount,
				isPlaceholder: true,
				byStatus: Array.from(statusCounts, ([status, count]) => ({
					status: status as (typeof placeholder)[0]["status"],
					count,
				})),
				bySource: Array.from(sourceCounts, ([source, count]) => ({
					source: source as (typeof placeholder)[0]["source"],
					count,
				})),
			};
		}

		return {
			total: agg._count._all,
			avgConfidence: agg._avg.confidenceScore ?? 0,
			thisWeek,
			isPlaceholder: false,
			byStatus: byStatus.map((r) => ({
				status: r.status,
				count: r._count._all,
			})),
			bySource: bySource.map((r) => ({
				source: r.source,
				count: r._count._all,
			})),
		};
	}),

	exportSelectedToExcel: protectedOrganizationProcedure
		.input(exportStartupsSchema)
		.mutation(async ({ ctx, input }) => {
			const startups = await prisma.startup.findMany({
				where: {
					id: { in: input.startupIds },
					organizationId: ctx.organization.id,
				},
				select: {
					id: true,
					name: true,
					founderName: true,
					founderLinkedIn: true,
					email: true,
					description: true,
					source: true,
					sourceUrl: true,
					scrapedAt: true,
					confidenceScore: true,
					thesisReasoning: true,
					status: true,
					draftedEmail: true,
					sentAt: true,
					createdAt: true,
					updatedAt: true,
				},
			});
			const ExcelJS = await import("exceljs");
			const workbook = new ExcelJS.Workbook();
			const worksheet = workbook.addWorksheet("Startups");

			if (startups.length > 0) {
				worksheet.columns = [
					{ header: "ID", key: "id", width: 28 },
					{ header: "Startup", key: "name", width: 24 },
					{ header: "Founder", key: "founderName", width: 20 },
					{ header: "LinkedIn", key: "founderLinkedIn", width: 28 },
					{ header: "Email", key: "email", width: 30 },
					{ header: "Description", key: "description", width: 40 },
					{ header: "Source", key: "source", width: 14 },
					{ header: "Source URL", key: "sourceUrl", width: 36 },
					{ header: "Scraped At", key: "scrapedAt", width: 22 },
					{ header: "Confidence", key: "confidenceScore", width: 12 },
					{ header: "Thesis reasoning", key: "thesisReasoning", width: 44 },
					{ header: "Status", key: "status", width: 14 },
					{ header: "Draft email", key: "draftedEmail", width: 44 },
					{ header: "Sent At", key: "sentAt", width: 22 },
					{ header: "Created At", key: "createdAt", width: 22 },
					{ header: "Updated At", key: "updatedAt", width: 22 },
				];
				for (const s of startups) {
					worksheet.addRow(s);
				}
			}

			const buffer = await workbook.xlsx.writeBuffer();
			return Buffer.from(buffer).toString("base64");
		}),
});
