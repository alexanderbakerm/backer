import type {
	ContactedLead,
	FunnelStage,
	KpiMetric,
	ShadowPartnerDashboardSnapshot,
	ShadowPartnerSourcedLead,
	StreamEvent,
	TrendingSignal,
	VcLeadSource,
} from "./types";

export const FUND_NAME = "Northline Ventures";

function spark(
	base: number,
	variance: number,
	len = 14,
): { x: number; y: number }[] {
	return Array.from({ length: len }, (_, i) => ({
		x: i,
		y: Math.round(base + Math.sin(i * 0.45) * variance + i * (variance / 20)),
	}));
}

const KPI_MOCK: KpiMetric[] = [
	{
		id: "new-leads",
		label: "New Leads Sourced",
		valueLabel: "247",
		deltaKind: "percent",
		deltaUp: true,
		deltaText: "+18%",
		sparkline: spark(40, 12),
		accent: "chart1",
	},
	{
		id: "thesis-fit",
		label: "Avg Thesis Fit Score",
		valueLabel: "73 / 100",
		deltaKind: "points",
		deltaUp: true,
		deltaText: "+2.3",
		sparkline: spark(62, 6),
		accent: "chart2",
	},
	{
		id: "pending",
		label: "Pending Approval",
		valueLabel: "12",
		deltaKind: "na",
		deltaUp: null,
		deltaText: "",
		sparkline: spark(8, 3),
		accent: "chart3",
	},
	{
		id: "reply-rate",
		label: "Reply Rate",
		valueLabel: "11.4%",
		deltaKind: "percent",
		deltaUp: false,
		deltaText: "−0.8%",
		sparkline: spark(18, 5),
		accent: "chart1",
	},
];

function isoDaysAgo(days: number): string {
	const d = new Date();
	d.setUTCHours(12, 0, 0, 0);
	d.setUTCDate(d.getUTCDate() - days);
	return d.toISOString();
}

function draftFor(
	to: string,
	startup: string,
	founder: string,
): { to: string; subject: string; body: string } {
	return {
		to,
		subject: `${startup} + fit for our infra / agentic thesis`,
		body: `Hi ${founder.split(" ")[0]},\n\nWe’ve been tracking ${startup} — the velocity on ${startup.toLowerCase()} is exactly the kind of technical wedge we get excited about. I’d love to share how we partner with founders at the pre-seed/seed stage and compare notes on your roadmap.\n\nWould a short call next week work?\n\nBest,\nPartner`,
	};
}

const LEADS: ShadowPartnerSourcedLead[] = [
	{
		id: "l1",
		name: "NeuroLoop",
		tagline: "Memory substrate for agentic runtimes.",
		sector: "agentic",
		source: "github",
		fitScore: 87,
		fitBreakdown: { founder: 92, market: 84, traction: 81 },
		signal: { metric: "Stars", value: 432, velocity: 18 },
		discoveredAt: isoDaysAgo(0),
		status: "drafted",
		founders: [
			{
				id: "f1",
				name: "Sarah Chen",
				role: "CEO",
				bio: "Ex-Anthropic; shipped eval infra; Stanford CS; focused on reliable tool use at scale.",
			},
		],
		draft: draftFor("sarah@neuroloop.dev", "NeuroLoop", "Sarah Chen"),
	},
	{
		id: "l2",
		name: "Lattice AI",
		tagline: "Deterministic orchestration for multi-agent SWE teams.",
		sector: "infra",
		source: "product-hunt",
		fitScore: 76,
		fitBreakdown: { founder: 78, market: 80, traction: 71 },
		signal: { metric: "Upvotes", value: 612, velocity: 12 },
		discoveredAt: isoDaysAgo(1),
		status: "researched",
		founders: [
			{
				id: "f2",
				name: "Morgan Patel",
				role: "Co-founder",
				bio: "Former AWS Lambda; opinionated on state machines and durable execution.",
			},
		],
	},
	{
		id: "l3",
		name: "Voltage",
		tagline: "Edge inference for low-latency copilots.",
		sector: "devtools",
		source: "x",
		fitScore: 71,
		fitBreakdown: { founder: 74, market: 68, traction: 72 },
		signal: { metric: "Followers", value: 8900, velocity: 7 },
		discoveredAt: isoDaysAgo(2),
		status: "new",
		founders: [
			{
				id: "f3",
				name: "Jordan Lee",
				role: "Founder",
				bio: "Built real-time ML at Uber; now chasing sub-100ms agent loops.",
			},
		],
	},
	{
		id: "l4",
		name: "Subroutine",
		tagline: "Typed contracts between MCP servers and hosts.",
		sector: "devtools",
		source: "github",
		fitScore: 82,
		fitBreakdown: { founder: 85, market: 77, traction: 79 },
		signal: { metric: "Stars", value: 289, velocity: 22 },
		discoveredAt: isoDaysAgo(1),
		status: "drafted",
		founders: [
			{
				id: "f4",
				name: "Alex Rivera",
				role: "CTO",
				bio: "Rust/open-source maintainer; previously Figma infra.",
			},
		],
		draft: draftFor("alex@subroutine.dev", "Subroutine", "Alex Rivera"),
	},
	{
		id: "l5",
		name: "Resonant",
		tagline: "Online evals for long-horizon agents.",
		sector: "agentic",
		source: "crunchbase",
		fitScore: 69,
		fitBreakdown: { founder: 72, market: 66, traction: 66 },
		signal: { metric: "CB rank", value: 89012, velocity: -2 },
		discoveredAt: isoDaysAgo(3),
		status: "approved",
		founders: [
			{
				id: "f5",
				name: "Casey Ng",
				role: "CEO",
				bio: "PhD RL; sold prior startup to major cloud; advisor to two unicorns.",
			},
		],
		draft: draftFor("casey@resonant.ai", "Resonant", "Casey Ng"),
	},
	{
		id: "l6",
		name: "Kernel",
		tagline: "Filesystem for agent memory and tool results.",
		sector: "infra",
		source: "github",
		fitScore: 91,
		fitBreakdown: { founder: 94, market: 88, traction: 86 },
		signal: { metric: "Stars", value: 1204, velocity: 31 },
		discoveredAt: isoDaysAgo(0),
		status: "replied",
		founders: [
			{
				id: "f6",
				name: "Riley Park",
				role: "Founder",
				bio: "Ex-Databricks; obsessed with reproducible agent traces.",
			},
		],
	},
	{
		id: "l7",
		name: "Mirrored",
		tagline: "Shadow environments for safe agent rollouts.",
		sector: "infra",
		source: "product-hunt",
		fitScore: 58,
		fitBreakdown: { founder: 60, market: 55, traction: 58 },
		signal: { metric: "Upvotes", value: 210, velocity: 4 },
		discoveredAt: isoDaysAgo(4),
		status: "new",
		founders: [
			{
				id: "f7",
				name: "Taylor Brooks",
				role: "CEO",
				bio: "Second-time founder; enterprise GTM background.",
			},
		],
	},
	{
		id: "l8",
		name: "Cohere Graph",
		tagline: "GraphRAG without the graph headaches.",
		sector: "agentic",
		source: "x",
		fitScore: 74,
		fitBreakdown: { founder: 76, market: 72, traction: 74 },
		signal: { metric: "Followers", value: 5400, velocity: 9 },
		discoveredAt: isoDaysAgo(2),
		status: "sent",
		founders: [
			{
				id: "f8",
				name: "Sam Okonkwo",
				role: "Co-founder",
				bio: "NLP lead from big-tech R&D; published on retrieval durability.",
			},
		],
	},
	{
		id: "l9",
		name: "Packetwerk",
		tagline: "Wire-format observability for agent tool calls.",
		sector: "devtools",
		source: "github",
		fitScore: 79,
		fitBreakdown: { founder: 81, market: 76, traction: 78 },
		signal: { metric: "Stars", value: 356, velocity: 14 },
		discoveredAt: isoDaysAgo(5),
		status: "drafted",
		founders: [
			{
				id: "f9",
				name: "Jamie Frost",
				role: "CTO",
				bio: "Distributed systems at scale; OpenTelemetry contributor.",
			},
		],
		draft: draftFor("jamie@packetwerk.io", "Packetwerk", "Jamie Frost"),
	},
	{
		id: "l10",
		name: "Helixbyte",
		tagline: "Policy sandboxes for autonomous browsing agents.",
		sector: "agentic",
		source: "crunchbase",
		fitScore: 66,
		fitBreakdown: { founder: 68, market: 64, traction: 63 },
		signal: { metric: "Employees", value: 12, velocity: 5 },
		discoveredAt: isoDaysAgo(6),
		status: "researched",
		founders: [
			{
				id: "f10",
				name: "Priya Shah",
				role: "CEO",
				bio: "Security PM turned founder; YC alum.",
			},
		],
	},
	{
		id: "l11",
		name: "Northwind MCP",
		tagline: "Hosted MCP with org-scoped authZ.",
		sector: "devtools",
		source: "github",
		fitScore: 48,
		fitBreakdown: { founder: 52, market: 45, traction: 44 },
		signal: { metric: "Stars", value: 88, velocity: 3 },
		discoveredAt: isoDaysAgo(7),
		status: "new",
		founders: [
			{
				id: "f11",
				name: "Chris Dale",
				role: "Solo founder",
				bio: "Indie hacker; previously developer tools at Stripe.",
			},
		],
	},
	{
		id: "l12",
		name: "Glassline",
		tagline: "SLOs for non-deterministic agents.",
		sector: "infra",
		source: "product-hunt",
		fitScore: 84,
		fitBreakdown: { founder: 86, market: 82, traction: 83 },
		signal: { metric: "Upvotes", value: 540, velocity: 16 },
		discoveredAt: isoDaysAgo(1),
		status: "drafted",
		founders: [
			{
				id: "f12",
				name: "Noah Kim",
				role: "Founder",
				bio: "SRE leadership; wrote internal treatise on canarying LLM features.",
			},
		],
		draft: draftFor("noah@glassline.dev", "Glassline", "Noah Kim"),
	},
	{
		id: "l13",
		name: "Torchside",
		tagline: "Warm introductions at scale via structured founder graphs.",
		sector: "devtools",
		source: "x",
		fitScore: 61,
		fitBreakdown: { founder: 63, market: 59, traction: 60 },
		signal: { metric: "Followers", value: 3200, velocity: 6 },
		discoveredAt: isoDaysAgo(8),
		status: "approved",
		founders: [
			{
				id: "f13",
				name: "Dana Cruz",
				role: "CEO",
				bio: "Network scientist; ex-sales at Series B SaaS.",
			},
		],
	},
	{
		id: "l14",
		name: "Zedstack",
		tagline: "Composable eval harness for code agents.",
		sector: "agentic",
		source: "github",
		fitScore: 88,
		fitBreakdown: { founder: 90, market: 85, traction: 87 },
		signal: { metric: "Stars", value: 967, velocity: 27 },
		discoveredAt: isoDaysAgo(0),
		status: "new",
		founders: [
			{
				id: "f14",
				name: "Quinn Harper",
				role: "Co-founder",
				bio: "Compilers + PL nerd; ex-research lab.",
			},
		],
	},
	{
		id: "l15",
		name: "Rivulet",
		tagline: "Streaming context windows with token economics.",
		sector: "infra",
		source: "crunchbase",
		fitScore: 72,
		fitBreakdown: { founder: 74, market: 70, traction: 71 },
		signal: { metric: "Funding stage", value: 1, velocity: 1 },
		discoveredAt: isoDaysAgo(9),
		status: "sent",
		founders: [
			{
				id: "f15",
				name: "Elena Vogel",
				role: "CEO",
				bio: "Two-sided marketplace experience; MIT.",
			},
		],
	},
];

const FUNNEL: FunnelStage[] = [
	{ key: "d", label: "Discovered", count: 420 },
	{ key: "r", label: "Researched", count: 186 },
	{ key: "dr", label: "Drafted", count: 64 },
	{ key: "ap", label: "Approved", count: 28 },
	{ key: "se", label: "Sent", count: 19 },
	{ key: "rep", label: "Replied", count: 11 },
	{ key: "m", label: "Meeting", count: 4 },
];

const SOURCE_FILL: Record<VcLeadSource, string> = {
	github: "var(--chart-1)",
	"product-hunt": "var(--chart-2)",
	x: "var(--chart-3)",
	crunchbase: "oklch(65% 0.12 264)",
};

function sourceBreakdown(): ShadowPartnerDashboardSnapshot["sourceBreakdown"] {
	const rows: [VcLeadSource, number][] = [
		["github", 148],
		["product-hunt", 62],
		["x", 55],
		["crunchbase", 35],
	];
	return rows.map(([source, count]) => ({
		source,
		count,
		fillVar: SOURCE_FILL[source],
	}));
}

const SECTORS: ShadowPartnerDashboardSnapshot["sectorDistribution"] = [
	{ sector: "agentic", count: 112 },
	{ sector: "infra", count: 78 },
	{ sector: "devtools", count: 57 },
];

const TRENDING: TrendingSignal[] = [
	{ phrase: "agentic memory", growthPct: 340 },
	{ phrase: "mcp servers", growthPct: 210 },
	{ phrase: "eval harness", growthPct: 156 },
	{ phrase: "durable tools", growthPct: 128 },
	{ phrase: "shadow deployments", growthPct: 94 },
];

const CONTACTED: ContactedLead[] = [
	{
		id: "c1",
		founderName: "Riley Park",
		startupName: "Kernel",
		contactedAt: isoDaysAgo(1),
		threadStatus: "replied",
		avatarSeed: "rp",
	},
	{
		id: "c2",
		founderName: "Morgan Patel",
		startupName: "Lattice AI",
		contactedAt: isoDaysAgo(2),
		threadStatus: "no-reply",
		avatarSeed: "mp",
	},
	{
		id: "c3",
		founderName: "Casey Ng",
		startupName: "Resonant",
		contactedAt: isoDaysAgo(3),
		threadStatus: "meeting",
		avatarSeed: "cn",
	},
	{
		id: "c4",
		founderName: "Sam Okonkwo",
		startupName: "Cohere Graph",
		contactedAt: isoDaysAgo(4),
		threadStatus: "no-reply",
		avatarSeed: "so",
	},
	{
		id: "c5",
		founderName: "Dana Cruz",
		startupName: "Torchside",
		contactedAt: isoDaysAgo(5),
		threadStatus: "replied",
		avatarSeed: "dc",
	},
	{
		id: "c6",
		founderName: "Elena Vogel",
		startupName: "Rivulet",
		contactedAt: isoDaysAgo(6),
		threadStatus: "no-reply",
		avatarSeed: "ev",
	},
	{
		id: "c7",
		founderName: "Priya Shah",
		startupName: "Helixbyte",
		contactedAt: isoDaysAgo(7),
		threadStatus: "meeting",
		avatarSeed: "ps",
	},
	{
		id: "c8",
		founderName: "Taylor Brooks",
		startupName: "Mirrored",
		contactedAt: isoDaysAgo(8),
		threadStatus: "no-reply",
		avatarSeed: "tb",
	},
	{
		id: "c9",
		founderName: "Jamie Frost",
		startupName: "Packetwerk",
		contactedAt: isoDaysAgo(9),
		threadStatus: "replied",
		avatarSeed: "jf",
	},
	{
		id: "c10",
		founderName: "Noah Kim",
		startupName: "Glassline",
		contactedAt: isoDaysAgo(10),
		threadStatus: "no-reply",
		avatarSeed: "nk",
	},
];

const BASE_TS = 1_738_915_200_000; // fixed epoch for deterministic stream seeds

const INITIAL_STREAM: StreamEvent[] = [
	{
		id: "s1",
		ts: BASE_TS + 1_000,
		stepType: "scanning",
		sourceEmoji: "🐙",
		stepLabel: "GitHub",
		detail: "Scanning trending repos tagged agentic",
	},
	{
		id: "s2",
		ts: BASE_TS + 14_000,
		stepType: "discovered",
		sourceEmoji: "🔍",
		stepLabel: "Discovered",
		detail: "NeuroLoop — 432 stars in 48h",
	},
	{
		id: "s3",
		ts: BASE_TS + 29_000,
		stepType: "researching",
		sourceEmoji: "👤",
		stepLabel: "Researching",
		detail: "Sarah Chen, ex-Anthropic · LinkedIn matched",
	},
	{
		id: "s4",
		ts: BASE_TS + 44_000,
		stepType: "scoring",
		sourceEmoji: "🧠",
		stepLabel: "Scoring",
		detail: 'Thesis fit 87/100 — "AI infra, technical founder, hot velocity"',
	},
	{
		id: "s5",
		ts: BASE_TS + 60_000,
		stepType: "drafting",
		sourceEmoji: "✉️",
		stepLabel: "Drafting",
		detail: "Personalized intro queued for approval",
	},
];

export const STREAM_EVENT_TEMPLATES: Omit<StreamEvent, "id" | "ts">[] = [
	{
		stepType: "scanning",
		sourceEmoji: "🐙",
		stepLabel: "GitHub",
		detail: "Indexing new stargazers on agent-tool repos",
	},
	{
		stepType: "discovered",
		sourceEmoji: "🚀",
		stepLabel: "Discovered",
		detail: "Zedstack — 967 stars · multi-step SWE agent",
	},
	{
		stepType: "researching",
		sourceEmoji: "👤",
		stepLabel: "Researching",
		detail: "Quinn Harper · mutuals with portfolio engineer",
	},
	{
		stepType: "scoring",
		sourceEmoji: "🧠",
		stepLabel: "Scoring",
		detail: "Thesis fit 88/100 — velocity + founder depth",
	},
	{
		stepType: "drafting",
		sourceEmoji: "✉️",
		stepLabel: "Drafting",
		detail: "Butterbase queue slot reserved for manual review",
	},
	{
		stepType: "neutral",
		sourceEmoji: "📡",
		stepLabel: "Product Hunt",
		detail: "Ranking today’s launches by engaged-comment density",
	},
	{
		stepType: "neutral",
		sourceEmoji: "𝕏",
		stepLabel: "X",
		detail: "Monitoring breakout threads on MCP + infra",
	},
];

export function getShadowPartnerDashboardMock(): ShadowPartnerDashboardSnapshot {
	return {
		fundName: FUND_NAME,
		kpis: KPI_MOCK,
		funnel: FUNNEL,
		sourceBreakdown: sourceBreakdown(),
		sectorDistribution: SECTORS,
		trendingSignals: TRENDING,
		contacted: CONTACTED,
		initialStream: INITIAL_STREAM,
		leads: LEADS,
	};
}
