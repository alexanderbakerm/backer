import { PipelineStatus, SourceType } from "@prisma/client";
import { z } from "zod/v4";

export const StartupSortField = z.enum([
	"name",
	"founderName",
	"email",
	"confidenceScore",
	"status",
	"source",
	"scrapedAt",
	"createdAt",
]);
export type StartupSortField = z.infer<typeof StartupSortField>;

export const listStartupsSchema = z.object({
	limit: z.number().min(1).max(100).default(50),
	offset: z.number().min(0).default(0),
	query: z.string().optional(),
	sortBy: StartupSortField.default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
	filters: z
		.object({
			status: z.array(z.nativeEnum(PipelineStatus)).optional(),
			source: z.array(z.nativeEnum(SourceType)).optional(),
			createdAt: z
				.array(z.enum(["today", "this-week", "this-month", "older"]))
				.optional(),
		})
		.optional(),
});

export const createStartupSchema = z.object({
	name: z.string().trim().min(1, "Startup name is required").max(200),
	founderName: z.string().trim().min(1, "Founder name is required").max(200),
	founderLinkedIn: z.preprocess(
		(v) => (v === "" || v === undefined || v === null ? undefined : v),
		z.string().url("Invalid URL").max(500).optional(),
	),
	email: z.string().trim().email("Invalid email").max(255),
	description: z.preprocess(
		(v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
		z.string().trim().max(20_000).optional(),
	),
	source: z.nativeEnum(SourceType).default(SourceType.OTHER),
	sourceUrl: z.preprocess(
		(v) => (v === "" || v === undefined || v === null ? undefined : v),
		z.string().url("Invalid URL").max(2000).optional(),
	),
	confidenceScore: z.number().min(0).max(1).default(0),
	thesisReasoning: z.preprocess(
		(v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
		z.string().trim().max(50_000).optional(),
	),
	status: z.nativeEnum(PipelineStatus).default(PipelineStatus.SCANNED),
	draftedEmail: z.preprocess(
		(v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
		z.string().trim().max(100_000).optional(),
	),
	sentAt: z.coerce.date().optional().nullable(),
});

export const updateStartupSchema = z.object({
	id: z.string().min(1, "Invalid id"),
	name: z.string().trim().min(1).max(200).optional(),
	founderName: z.string().trim().min(1).max(200).optional(),
	founderLinkedIn: z
		.union([
			z.string().trim().url("Invalid URL").max(500),
			z.literal(""),
			z.null(),
		])
		.optional()
		.transform((v) => (v === "" ? null : v)),
	email: z.string().trim().email().max(255).optional(),
	description: z.string().trim().max(20_000).optional().nullable(),
	source: z.nativeEnum(SourceType).optional(),
	sourceUrl: z
		.union([
			z.string().trim().url("Invalid URL").max(2000),
			z.literal(""),
			z.null(),
		])
		.optional()
		.transform((v) => (v === "" ? null : v)),
	scrapedAt: z.coerce.date().optional(),
	confidenceScore: z.number().min(0).max(1).optional(),
	thesisReasoning: z.string().trim().max(50_000).optional().nullable(),
	status: z.nativeEnum(PipelineStatus).optional(),
	draftedEmail: z.string().trim().max(100_000).optional().nullable(),
	sentAt: z.coerce.date().optional().nullable(),
});

export const deleteStartupSchema = z.object({
	id: z.string().min(1),
});

export const bulkDeleteStartupsSchema = z.object({
	ids: z.array(z.string().min(1)).min(1),
});

export const bulkUpdateStartupStatusSchema = z.object({
	ids: z.array(z.string().min(1)).min(1),
	status: z.nativeEnum(PipelineStatus),
});

export const exportStartupsSchema = z.object({
	startupIds: z.array(z.string().min(1)).min(1),
});

export type ListStartupsInput = z.infer<typeof listStartupsSchema>;
export type CreateStartupInput = z.infer<typeof createStartupSchema>;
export type UpdateStartupInput = z.infer<typeof updateStartupSchema>;
export type DeleteStartupInput = z.infer<typeof deleteStartupSchema>;
export type BulkDeleteStartupsInput = z.infer<typeof bulkDeleteStartupsSchema>;
export type BulkUpdateStartupStatusInput = z.infer<
	typeof bulkUpdateStartupStatusSchema
>;
export type ExportStartupsInput = z.infer<typeof exportStartupsSchema>;
