/**
 * Shared types for the AI Shadow Partner CRM surface & integration mocks.
 */

export type LeadPlatform =
	| "github"
	| "product_hunt"
	| "x"
	| "linkedin"
	| "crunchbase";

export type LeadApprovalStatus = "pending" | "approved" | "rejected";

export type ShadowAgentLogLevel = "info" | "think" | "warn" | "success";

export type ShadowAgentLogEntry = {
	id: string;
	ts: number;
	level: ShadowAgentLogLevel;
	message: string;
};

export type ShadowPartnerLead = {
	id: string;
	founderId: string;
	founderName: string;
	startupName: string;
	platform: LeadPlatform;
	confidence: number;
	emailDraftSubject: string;
	emailDraftBody: string;
};

export type ShadowPartnerMetrics = {
	foundersScanned: number;
	foundersScannedWeekDeltaPct: number;
	thesisMatches: number;
	outreachQueued: number;
	responseRatePct: number;
	responseRateWeekDeltaPct: number;
};

export type ShadowDataSourcesConfig = {
	github: boolean;
	productHunt: boolean;
	xTwitter: boolean;
};

export type IsolatedMemoryStatus = {
	vectorCount: number;
	capacity: number;
	lastCompactAt: string | null;
};

export type ShadowPartnerStatusPayload = {
	agentActive: boolean;
	metrics: ShadowPartnerMetrics;
	memory: IsolatedMemoryStatus;
	integrations: {
		brightData: "idle" | "busy" | "error";
		/** Targeted discovery lanes — headless enrichment sessions */
		targetedDiscovery: "idle" | "busy";
		/** Isolated state layers — vector dedupe & contact memory */
		isolatedMemory: "ready";
		ollama: "idle" | "thinking";
		butterbase: "connected";
		resend: "configured" | "mock";
	};
};

/** ——— VC dashboard (Shadow Partner main view) ——— */

export type VcLeadStatus =
	| "new"
	| "researched"
	| "drafted"
	| "approved"
	| "sent"
	| "replied";

export type VcLeadSource = "github" | "product-hunt" | "x" | "crunchbase";

export interface VcFounder {
	id: string;
	name: string;
	role: string;
	avatarUrl?: string;
	bio: string;
}

/** Primary row shape for the Hot Leads table & review sheet (spec: `Lead`). */
export interface ShadowPartnerSourcedLead {
	id: string;
	name: string;
	tagline: string;
	sector: string;
	source: VcLeadSource;
	fitScore: number;
	fitBreakdown: { founder: number; market: number; traction: number };
	signal: { metric: string; value: number; velocity: number };
	discoveredAt: string;
	status: VcLeadStatus;
	founders: VcFounder[];
	draft?: { to: string; subject: string; body: string };
}

export type Lead = ShadowPartnerSourcedLead;

export type StreamEventTone =
	| "discovered"
	| "scoring"
	| "drafting"
	| "researching"
	| "scanning"
	| "neutral";

export interface StreamEvent {
	id: string;
	ts: number;
	stepType: StreamEventTone;
	sourceEmoji: string;
	stepLabel: string;
	detail: string;
}

export type KpiDeltaKind = "percent" | "points" | "na";

export interface KpiMetric {
	id: string;
	label: string;
	valueLabel: string;
	deltaKind: KpiDeltaKind;
	deltaUp: boolean | null;
	deltaText: string;
	sparkline: { x: number; y: number }[];
	accent: "chart1" | "chart2" | "chart3";
}

export interface FunnelStage {
	key: string;
	label: string;
	count: number;
}

export interface TrendingSignal {
	phrase: string;
	growthPct: number;
}

export type ContactThreadStatus = "no-reply" | "replied" | "meeting";

export interface ContactedLead {
	id: string;
	founderName: string;
	startupName: string;
	contactedAt: string;
	threadStatus: ContactThreadStatus;
	avatarSeed: string;
}

export interface ShadowPartnerDashboardSnapshot {
	fundName: string;
	kpis: KpiMetric[];
	funnel: FunnelStage[];
	sourceBreakdown: { source: VcLeadSource; count: number; fillVar: string }[];
	sectorDistribution: { sector: string; count: number }[];
	trendingSignals: TrendingSignal[];
	contacted: ContactedLead[];
	initialStream: StreamEvent[];
	leads: ShadowPartnerSourcedLead[];
}
