/**
 * Integration outline for Shadow Partner — replace bodies with real SDK calls.
 */

import type { ShadowPartnerLead } from "./types";

/** Bright Data: enqueue GitHub trend / profile scrapes */
export async function triggerBrightDataGithubScraper(params: {
	seedQuery: string;
	maxResults: number;
}): Promise<{ jobId: string }> {
	return Promise.resolve({
		jobId: `bd-github-${params.seedQuery}-${params.maxResults}`,
	});
}

/** Bright Data: X/Twitter discovery scrape */
export async function triggerBrightDataXTrendsScraper(params: {
	keywords: string[];
}): Promise<{ jobId: string }> {
	return Promise.resolve({
		jobId: `bd-x-${params.keywords.join("-")}`,
	});
}

/** Targeted discovery lanes: headless DOM traces (LinkedIn / Crunchbase) — emit structured logs */
export async function logTargetedDiscoveryDomSession(params: {
	target: "linkedin" | "crunchbase";
	sessionId: string;
	event: string;
}): Promise<void> {
	void params;
	await Promise.resolve();
}

/** Isolated state layers: vector dedupe — ensure founder_id not double-contacted */
export async function isolatedMemoryFounderDedupeLookup(
	founderId: string,
): Promise<{
	known: boolean;
	closestClusterId?: string;
}> {
	void founderId;
	return { known: false };
}

/**
 * Ollama / Z.ai GLM-5.1: deep reasoning against thesis + scraped evidence
 */
export function buildThesisEvaluationPrompt(input: {
	thesis: string;
	lead: Pick<
		ShadowPartnerLead,
		"founderName" | "startupName" | "platform" | "founderId"
	>;
	scrapedEvidence: string;
}): string {
	return [
		"You are Z.ai GLM-5.1 running in deep-reasoning mode.",
		"Evaluate whether this founder is a strong fit for the thesis. Output: fit_score 0-100, rationale, red_flags[], signal_strength.",
		"",
		"THESIS:",
		input.thesis,
		"",
		"LEAD:",
		`${input.lead.founderName} @ ${input.lead.startupName} (${input.lead.platform}) founder_id=${input.lead.founderId}`,
		"",
		"SCRAPED_EVIDENCE:",
		input.scrapedEvidence,
	].join("\n");
}

/** Butterbase: persisted lead graph — placeholder row shape */
export type ButterbaseLeadRow = {
	founderId: string;
	organizationId: string;
	status: "sourced" | "queued" | "sent";
	rawPayloadRef: string;
};

export async function butterbaseUpsertLeadPlaceholder(
	row: ButterbaseLeadRow,
): Promise<{ id: string }> {
	return Promise.resolve({ id: `bb-${row.founderId}` });
}

/** Resend (+ Slack/Gmail queue): stage outbound after manual approval */
export async function resendQueuePersonalizedOutreach(params: {
	to: string;
	subject: string;
	html: string;
	idempotencyKey: string;
}): Promise<{ queued: boolean }> {
	void params;
	return { queued: true };
}
