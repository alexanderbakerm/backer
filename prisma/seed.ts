import { PrismaPg } from "@prisma/adapter-pg";
import { PipelineStatus, PrismaClient, SourceType } from "@prisma/client";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error("DATABASE_URL env var is required");
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function daysAgo(n: number): Date {
	return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

const STARTUPS = [
	{
		name: "NeuroLoop",
		founderName: "Sarah Chen",
		email: "sarah@neuroloop.dev",
		founderLinkedIn: "https://linkedin.com/in/sarahchen-ai",
		description:
			"Memory substrate for agentic runtimes — replaces in-context storage with a queryable persistent layer.",
		source: SourceType.GITHUB,
		sourceUrl: "https://github.com/neuroloop-ai/neuroloop",
		scrapedAt: daysAgo(0),
		confidenceScore: 0.91,
		thesisReasoning:
			"Ex-Anthropic; shipped production eval infra. Technical wedge is strong — persistent memory is the missing primitive for reliable agents. 432 stars in 48h signals real developer pull.",
		status: PipelineStatus.EVALUATED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "Lattice AI",
		founderName: "Morgan Patel",
		email: "morgan@lattice.ai",
		founderLinkedIn: "https://linkedin.com/in/morganpatel-aws",
		description:
			"Deterministic orchestration for multi-agent SWE teams — state-machine-based with human checkpoints.",
		source: SourceType.PRODUCT_HUNT,
		sourceUrl: "https://producthunt.com/posts/lattice-ai",
		scrapedAt: daysAgo(1),
		confidenceScore: 0.76,
		thesisReasoning:
			"Former AWS Lambda; strong on durable execution patterns. Market timing is good. 612 PH upvotes but founder depth is the key risk — need second call.",
		status: PipelineStatus.QUEUED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "Voltage",
		founderName: "Jordan Lee",
		email: "jordan@voltage.dev",
		founderLinkedIn: "https://linkedin.com/in/jordanlee-ml",
		description:
			"Edge inference for sub-100ms copilots — runs small models at the edge with deterministic latency guarantees.",
		source: SourceType.TWITTER,
		sourceUrl: "https://twitter.com/jordanlee_dev",
		scrapedAt: daysAgo(2),
		confidenceScore: 0.71,
		thesisReasoning: null,
		status: PipelineStatus.SCANNED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "Subroutine",
		founderName: "Alex Rivera",
		email: "alex@subroutine.dev",
		founderLinkedIn: "https://linkedin.com/in/alexrivera-rust",
		description:
			"Typed contracts between MCP servers and hosts — enforces schema compatibility at connect-time.",
		source: SourceType.GITHUB,
		sourceUrl: "https://github.com/subroutine-dev/subroutine",
		scrapedAt: daysAgo(1),
		confidenceScore: 0.82,
		thesisReasoning:
			"Rust/open-source maintainer from Figma infra. MCP tooling is early but growing — typed contracts solve a real pain.",
		status: PipelineStatus.EVALUATED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "Resonant",
		founderName: "Casey Ng",
		email: "casey@resonant.ai",
		founderLinkedIn: "https://linkedin.com/in/caseyng-rl",
		description:
			"Online evals for long-horizon agents — streaming evaluation against user-defined rubrics.",
		source: SourceType.OTHER,
		sourceUrl: "https://crunchbase.com/org/resonant-ai",
		scrapedAt: daysAgo(6),
		confidenceScore: 0.69,
		thesisReasoning:
			"PhD RL background; sold prior company to a major cloud provider. Eval infra is table stakes for enterprise agents. Engaged on first email — meeting requested.",
		status: PipelineStatus.OUTREACHED,
		draftedEmail:
			"Hi Casey — your work on streaming evals caught my eye. Online rubric evaluation is exactly the infra gap enterprise teams hit when agents run past 10 steps. Would a 20-min call this week work? — Partner @ Northline Ventures",
		sentAt: daysAgo(5),
	},
	{
		name: "Kernel",
		founderName: "Riley Park",
		email: "riley@kernel.dev",
		founderLinkedIn: "https://linkedin.com/in/rileypark-databricks",
		description:
			"Filesystem for agent memory and tool results — persistent, queryable, and reproducible.",
		source: SourceType.GITHUB,
		sourceUrl: "https://github.com/kernel-ai/kernel",
		scrapedAt: daysAgo(0),
		confidenceScore: 0.94,
		thesisReasoning:
			"Ex-Databricks; obsessed with reproducible agent traces. 1204 stars with 31-star/day velocity is exceptional. True technical founder who has shipped critical-path systems.",
		status: PipelineStatus.OUTREACHED,
		draftedEmail:
			"Hi Riley — Kernel is solving the reproducibility problem that breaks every agent deployment beyond toy demos. Your GitHub velocity (1204 stars, +31/day) puts you in the top 5% of repos we track. Open to a call this week? — Partner @ Northline Ventures",
		sentAt: daysAgo(0),
	},
	{
		name: "Mirrored",
		founderName: "Taylor Brooks",
		email: "taylor@mirrored.io",
		founderLinkedIn: "https://linkedin.com/in/taylorbrooks-saas",
		description:
			"Shadow environments for safe agent rollouts — mirrors production traffic to a sandboxed agent before go-live.",
		source: SourceType.PRODUCT_HUNT,
		sourceUrl: "https://producthunt.com/posts/mirrored",
		scrapedAt: daysAgo(4),
		confidenceScore: 0.58,
		thesisReasoning: null,
		status: PipelineStatus.IGNORED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "Cohere Graph",
		founderName: "Sam Okonkwo",
		email: "sam@coheregraph.ai",
		founderLinkedIn: "https://linkedin.com/in/samokonkwo-nlp",
		description:
			"GraphRAG without the operational overhead — embedded graph structure inferred at index time.",
		source: SourceType.TWITTER,
		sourceUrl: "https://twitter.com/samokonkwo_ai",
		scrapedAt: daysAgo(2),
		confidenceScore: 0.74,
		thesisReasoning:
			"NLP lead from big-tech R&D; strong publication record on retrieval durability. GraphRAG is hot but operationally painful — inferred graph structure is the right abstraction.",
		status: PipelineStatus.OUTREACHED,
		draftedEmail:
			"Hi Sam — your approach to inferred graph structure at index time removes the biggest friction point in GraphRAG adoption. Want to compare notes this week? — Partner @ Northline Ventures",
		sentAt: daysAgo(2),
	},
	{
		name: "Packetwerk",
		founderName: "Jamie Frost",
		email: "jamie@packetwerk.io",
		founderLinkedIn: "https://linkedin.com/in/jamiefrost-otel",
		description:
			"Wire-format observability for agent tool calls — extends OpenTelemetry for LLM + tool use tracing.",
		source: SourceType.GITHUB,
		sourceUrl: "https://github.com/packetwerk/packetwerk",
		scrapedAt: daysAgo(5),
		confidenceScore: 0.79,
		thesisReasoning:
			"Active OpenTelemetry contributor. Agent observability is an unsolved problem — every enterprise we talk to needs this.",
		status: PipelineStatus.EVALUATED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "Helixbyte",
		founderName: "Priya Shah",
		email: "priya@helixbyte.com",
		founderLinkedIn: "https://linkedin.com/in/priyashah-security",
		description:
			"Policy sandboxes for autonomous browsing agents — isolates browser sessions with capability-based permissions.",
		source: SourceType.OTHER,
		sourceUrl: "https://ycombinator.com/companies/helixbyte",
		scrapedAt: daysAgo(7),
		confidenceScore: 0.66,
		thesisReasoning: null,
		status: PipelineStatus.SCANNED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "Northwind MCP",
		founderName: "Chris Dale",
		email: "chris@northwind.dev",
		founderLinkedIn: "https://linkedin.com/in/chrisdale-stripe",
		description:
			"Hosted MCP server platform with org-scoped authorization — multi-tenant auth layer for MCP tool registries.",
		source: SourceType.GITHUB,
		sourceUrl: "https://github.com/northwindmcp/server",
		scrapedAt: daysAgo(8),
		confidenceScore: 0.48,
		thesisReasoning: null,
		status: PipelineStatus.SCANNED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "Glassline",
		founderName: "Noah Kim",
		email: "noah@glassline.dev",
		founderLinkedIn: "https://linkedin.com/in/noahkim-sre",
		description:
			"SLOs for non-deterministic agents — defines and enforces service-level objectives for LLM-powered features.",
		source: SourceType.PRODUCT_HUNT,
		sourceUrl: "https://producthunt.com/posts/glassline",
		scrapedAt: daysAgo(1),
		confidenceScore: 0.84,
		thesisReasoning:
			"SRE leadership with deep canarying experience for ML. 540 PH upvotes in 24h is top 3% of launches tracked.",
		status: PipelineStatus.QUEUED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "Torchside",
		founderName: "Dana Cruz",
		email: "dana@torchside.io",
		founderLinkedIn: "https://linkedin.com/in/danacruz-network",
		description:
			"Warm introduction engine for founder networks — structured graph of co-founder, investor, and advisor relationships.",
		source: SourceType.TWITTER,
		sourceUrl: "https://twitter.com/danacruz_founder",
		scrapedAt: daysAgo(9),
		confidenceScore: 0.61,
		thesisReasoning:
			"Network scientist with enterprise GTM background. Fits criteria but market size needs validation. Second call scheduled.",
		status: PipelineStatus.EVALUATED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "Zedstack",
		founderName: "Quinn Harper",
		email: "quinn@zedstack.dev",
		founderLinkedIn: "https://linkedin.com/in/quinharper-compilers",
		description:
			"Composable eval harness for code agents — modular test runner with deterministic replay and LLM-as-judge scoring.",
		source: SourceType.GITHUB,
		sourceUrl: "https://github.com/zedstack/zedstack",
		scrapedAt: daysAgo(0),
		confidenceScore: 0.88,
		thesisReasoning:
			"Compilers + PL background from research lab. 967 stars with +27/day velocity. Code agents need structured eval.",
		status: PipelineStatus.QUEUED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "Rivulet",
		founderName: "Elena Vogel",
		email: "elena@rivulet.ai",
		founderLinkedIn: "https://linkedin.com/in/elenavogel-mit",
		description:
			"Streaming context windows with token-aware compression — reduces LLM costs for long-session agents by 60–80%.",
		source: SourceType.OTHER,
		sourceUrl: "https://crunchbase.com/org/rivulet-ai",
		scrapedAt: daysAgo(10),
		confidenceScore: 0.72,
		thesisReasoning:
			"Token cost at scale is a recurring pain across our portfolio. Context compression that preserves semantic coherence is hard to get right.",
		status: PipelineStatus.OUTREACHED,
		draftedEmail:
			"Hi Elena — Rivulet's streaming context windows map directly to what our portfolio companies are asking for. Call this week? — Partner @ Northline Ventures",
		sentAt: daysAgo(9),
	},
	{
		name: "FlowTrace",
		founderName: "Nico Reyes",
		email: "nico@flowtrace.dev",
		founderLinkedIn: "https://linkedin.com/in/nicoreyes-tracing",
		description:
			"Distributed tracing for autonomous agent workflows — correlates tool calls across async agent hops with causal attribution.",
		source: SourceType.GITHUB,
		sourceUrl: "https://github.com/flowtrace-ai/flowtrace",
		scrapedAt: daysAgo(3),
		confidenceScore: 0.85,
		thesisReasoning:
			"Ex-distributed systems at a unicorn. Tracing for async agent workflows is genuinely hard — OTel doesn't handle non-deterministic branching well.",
		status: PipelineStatus.EVALUATED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "Seedbed",
		founderName: "Mei Zhang",
		email: "mei@seedbed.ai",
		founderLinkedIn: "https://linkedin.com/in/meizhang-ml",
		description:
			"Synthetic data pipelines for fine-tuning — generates domain-specific training corpora with controllable quality metrics.",
		source: SourceType.PRODUCT_HUNT,
		sourceUrl: "https://producthunt.com/posts/seedbed",
		scrapedAt: daysAgo(4),
		confidenceScore: 0.77,
		thesisReasoning:
			"ML background with fine-tuning expertise. Synthetic data generation is becoming table stakes for domain-specific LLMs.",
		status: PipelineStatus.EVALUATED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "CortexDB",
		founderName: "Aryan Mehta",
		email: "aryan@cortexdb.io",
		founderLinkedIn: "https://linkedin.com/in/aryanmehta-db",
		description:
			"Vector database designed for agent working memory — supports partial retrieval, update-in-place, and forgetting curves.",
		source: SourceType.GITHUB,
		sourceUrl: "https://github.com/cortexdb/cortexdb",
		scrapedAt: daysAgo(2),
		confidenceScore: 0.89,
		thesisReasoning:
			"Database systems background. Existing vector DBs are built for semantic search, not agent memory semantics. Partial retrieval and forgetting APIs are the right primitive design.",
		status: PipelineStatus.QUEUED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "PatchLink",
		founderName: "Sam Rivers",
		email: "sam@patchlink.dev",
		founderLinkedIn: "https://linkedin.com/in/samrivers-devtools",
		description:
			"Automated changelog-to-PR mapping — links release notes to the commits and reviews that produced them.",
		source: SourceType.TWITTER,
		sourceUrl: "https://twitter.com/samrivers_dev",
		scrapedAt: daysAgo(6),
		confidenceScore: 0.63,
		thesisReasoning: null,
		status: PipelineStatus.SCANNED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "Foundry Labs",
		founderName: "Jessie Park",
		email: "jessie@foundry.ai",
		founderLinkedIn: "https://linkedin.com/in/jessiepark-llmops",
		description:
			"LLM operations platform for enterprise model fleets — manages fine-tuned model versions, routing, and cost attribution.",
		source: SourceType.PRODUCT_HUNT,
		sourceUrl: "https://producthunt.com/posts/foundry-labs",
		scrapedAt: daysAgo(5),
		confidenceScore: 0.81,
		thesisReasoning:
			"Enterprise model fleet management (not just inference) is underserved. Strong product framing. Scheduling second call.",
		status: PipelineStatus.EVALUATED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "Dagworth",
		founderName: "Oliver Reed",
		email: "oliver@dagworth.dev",
		founderLinkedIn: "https://linkedin.com/in/oliverreed-dag",
		description:
			"Typed DAGs for multi-step agent orchestration — compile-time graph validation with runtime state checkpointing.",
		source: SourceType.GITHUB,
		sourceUrl: "https://github.com/dagworth/dagworth",
		scrapedAt: daysAgo(8),
		confidenceScore: 0.87,
		thesisReasoning:
			"Typed orchestration removes an entire class of runtime errors for production agents. Sent personalized intro after Z.ai thesis score.",
		status: PipelineStatus.OUTREACHED,
		draftedEmail:
			"Hi Oliver — compile-time graph validation for agent DAGs solves a problem we see repeatedly: runtime failures in multi-step agents are almost always structural, not logical. Call Thursday? — Partner @ Northline Ventures",
		sentAt: daysAgo(7),
	},
	{
		name: "Lineshape",
		founderName: "Noa Fisher",
		email: "noa@lineshape.io",
		founderLinkedIn: "https://linkedin.com/in/noafisher-api",
		description:
			"API contracts that enforce latency SLOs — runtime assertion library for service mesh latency budgets.",
		source: SourceType.TWITTER,
		sourceUrl: "https://twitter.com/noa_lineshape",
		scrapedAt: daysAgo(7),
		confidenceScore: 0.68,
		thesisReasoning: null,
		status: PipelineStatus.SCANNED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "Threadneedle",
		founderName: "Aaron Cho",
		email: "aaron@threadneedle.ai",
		founderLinkedIn: "https://linkedin.com/in/aaroncho-prompts",
		description:
			"Prompt version control with A/B evaluation — tracks prompt lineage and measures regression across model updates.",
		source: SourceType.PRODUCT_HUNT,
		sourceUrl: "https://producthunt.com/posts/threadneedle",
		scrapedAt: daysAgo(6),
		confidenceScore: 0.73,
		thesisReasoning: null,
		status: PipelineStatus.SCANNED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "Circulant",
		founderName: "Demi Hart",
		email: "demi@circulant.dev",
		founderLinkedIn: "https://linkedin.com/in/demihart-ml",
		description:
			"Anomaly detection for AI feature drift — identifies distribution shift in LLM output quality before users do.",
		source: SourceType.GITHUB,
		sourceUrl: "https://github.com/circulant-ai/circulant",
		scrapedAt: daysAgo(3),
		confidenceScore: 0.8,
		thesisReasoning:
			"Applies statistical process control to LLM output quality. Output drift is one of the hardest problems in production ML.",
		status: PipelineStatus.EVALUATED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "Mantis",
		founderName: "Ray Kiran",
		email: "ray@mantisops.io",
		founderLinkedIn: "https://linkedin.com/in/raykiran-automation",
		description:
			"Browser automation SDK for agentic UIs — headless session management with DOM change detection and recovery.",
		source: SourceType.TWITTER,
		sourceUrl: "https://twitter.com/raykiran_mantis",
		scrapedAt: daysAgo(4),
		confidenceScore: 0.75,
		thesisReasoning:
			"Enterprise RPA workflows are being replaced by LLM-driven agents that need reliable DOM interaction. Browser agents are growing fast.",
		status: PipelineStatus.QUEUED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "Optrack",
		founderName: "Lena Skov",
		email: "lena@optrack.dev",
		founderLinkedIn: "https://linkedin.com/in/lenaskov-guardrails",
		description:
			"Operator-defined guardrails for LLM apps — policy-as-code enforcement layer between users and model outputs.",
		source: SourceType.GITHUB,
		sourceUrl: "https://github.com/optrack-ai/optrack",
		scrapedAt: daysAgo(5),
		confidenceScore: 0.83,
		thesisReasoning:
			"Policy enforcement is a compliance requirement for every enterprise LLM deployment. Strong technical fit and distribution wedge.",
		status: PipelineStatus.EVALUATED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "Bridgehead AI",
		founderName: "Cam Patel",
		email: "cam@bridgehead.ai",
		founderLinkedIn: "https://linkedin.com/in/campatel-async",
		description:
			"Async function calling for hosted models — queues, retries, and rate-limits tool calls across model providers.",
		source: SourceType.PRODUCT_HUNT,
		sourceUrl: "https://producthunt.com/posts/bridgehead-ai",
		scrapedAt: daysAgo(7),
		confidenceScore: 0.7,
		thesisReasoning: null,
		status: PipelineStatus.SCANNED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "Heliograph",
		founderName: "Yuki Abe",
		email: "yuki@heliograph.io",
		founderLinkedIn: "https://linkedin.com/in/yukiabe-telemetry",
		description:
			"Time-series telemetry native to agent runtimes — metrics SDK built for non-deterministic, branching execution.",
		source: SourceType.GITHUB,
		sourceUrl: "https://github.com/heliograph-io/heliograph",
		scrapedAt: daysAgo(3),
		confidenceScore: 0.86,
		thesisReasoning:
			"Standard metrics SDKs assume deterministic execution paths — branching-aware telemetry is the right primitive for production agents.",
		status: PipelineStatus.QUEUED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "Splitplane",
		founderName: "Ana Costa",
		email: "ana@splitplane.dev",
		founderLinkedIn: "https://linkedin.com/in/anacosta-saas",
		description:
			"Multi-tenant SaaS infrastructure toolkit for AI applications — tenant isolation, rate limiting, and usage metering.",
		source: SourceType.TWITTER,
		sourceUrl: "https://twitter.com/anacosta_saas",
		scrapedAt: daysAgo(11),
		confidenceScore: 0.65,
		thesisReasoning: null,
		status: PipelineStatus.IGNORED,
		draftedEmail: null,
		sentAt: null,
	},
	{
		name: "Ironveil",
		founderName: "Max Böhm",
		email: "max@ironveil.dev",
		founderLinkedIn: "https://linkedin.com/in/maxbohm-security",
		description:
			"Zero-trust policy engine for agent-to-agent communication — mutual TLS + capability tokens for autonomous agent mesh.",
		source: SourceType.GITHUB,
		sourceUrl: "https://github.com/ironveil/ironveil",
		scrapedAt: daysAgo(2),
		confidenceScore: 0.92,
		thesisReasoning:
			"Security infrastructure for agent meshes is an unsolved problem. Zero-trust capabilities applied to A2A protocols is the right threat model. Strong German security research background.",
		status: PipelineStatus.OUTREACHED,
		draftedEmail:
			"Hi Max — zero-trust for A2A communication is the security primitive that every agentic architecture is missing. Your capability token model is the right abstraction. Open to a call this week? — Partner @ Northline Ventures",
		sentAt: daysAgo(1),
	},
] as const;

async function main(): Promise<void> {
	const orgs = await prisma.organization.findMany({
		select: { id: true, name: true },
		orderBy: { createdAt: "asc" },
	});

	if (orgs.length === 0) {
		console.error(
			"No organizations found. Sign in at http://localhost:3001 first, then re-run the seed.",
		);
		process.exit(1);
	}

	for (const org of orgs) {
		console.log(`Seeding startups for org: ${org.name} (${org.id})`);

		let created = 0;
		let skipped = 0;

		for (const startup of STARTUPS) {
			const existing = await prisma.startup.findFirst({
				where: { organizationId: org.id, email: startup.email },
				select: { id: true },
			});

			if (existing) {
				skipped++;
				continue;
			}

			await prisma.startup.create({
				data: {
					...startup,
					sentAt: startup.sentAt ?? undefined,
					organizationId: org.id,
				},
			});
			created++;
		}

		console.log(`  Created: ${created}, Skipped (already exists): ${skipped}`);
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
