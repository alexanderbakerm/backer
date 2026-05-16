"use client";

import {
	ArrowDownRight,
	ArrowUpRight,
	Bot,
	Database,
	Github,
	Hourglass,
	Mail,
	Play,
	Radar,
	Send,
	Sparkles,
	Twitter,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type {
	LeadApprovalStatus,
	LeadPlatform,
	ShadowAgentLogEntry,
	ShadowDataSourcesConfig,
	ShadowPartnerLead,
	ShadowPartnerMetrics,
} from "@/lib/shadow-partner/types";
import { cn } from "@/lib/utils";

const PLATFORM_LABEL: Record<LeadPlatform, string> = {
	github: "GitHub",
	product_hunt: "Product Hunt",
	x: "X",
	linkedin: "LinkedIn",
	crunchbase: "Crunchbase",
};

function createId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const INITIAL_LOGS: ShadowAgentLogEntry[] = [
	{
		id: "1",
		ts: Date.now() - 120_000,
		level: "think",
		message:
			'Scraping Product Hunt for "devtools infra" — ranking launches by engagement velocity…',
	},
	{
		id: "2",
		ts: Date.now() - 90_000,
		level: "info",
		message:
			"Bright Data job bd-ph-8842: DOM stable, extracting founder emails where policy permits.",
	},
	{
		id: "3",
		ts: Date.now() - 60_000,
		level: "think",
		message:
			"Analyzing LinkedIn DOM for Founder Avery Kim — inferring technical depth from publication graph…",
	},
	{
		id: "4",
		ts: Date.now() - 30_000,
		level: "success",
		message:
			"Memory: founder_id f82a1 — novel cluster; safe to draft hyper-personalized opener.",
	},
];

const INITIAL_LEADS: ShadowPartnerLead[] = [
	{
		id: "lead-1",
		founderId: "f82a1c",
		founderName: "Avery Kim",
		startupName: "NimbusForge",
		platform: "product_hunt",
		confidence: 0.94,
		emailDraftSubject: "NimbusForge + operator-led infra thesis",
		emailDraftBody: `Avery — I loved how you're framing deterministic rollbacks for agentic deploys.

We're backing teams that compress infra feedback loops for mid-market SaaS. NimbusForge looks aligned with our focus on:

• policy-as-code that survives real-world on-call
• PLG motion with a wedge into eng leadership

If you're open to it, I'd love to share two portfolio companies solving adjacent control-plane problems — might be a useful compare-notes chat next week.`,
	},
	{
		id: "lead-2",
		founderId: "9b3e7d",
		founderName: "Jordan Lee",
		startupName: "VectorRelay",
		platform: "github",
		confidence: 0.88,
		emailDraftSubject: "vectorrelay / event-driven reliability",
		emailDraftBody: `Jordan — your commit cadence on stream sinks + backpressure stood out.

We invest pre-seed/seed in infra that makes "almost-once" delivery actually observable. VectorRelay's direction maps tightly.

Happy to be helpful even if now's not the right time — want me to send a short memo on how we think about retention SLAs in event fabrics?`,
	},
	{
		id: "lead-3",
		founderId: "c441af",
		founderName: "Sam Rivera",
		startupName: "CircuitOps",
		platform: "x",
		confidence: 0.81,
		emailDraftSubject: "CircuitOps + SRE autonomy thesis",
		emailDraftBody: `Sam — catching your thread on "runbooks that compile" clicked with our thesis on programmable ops.

If you're heads-down shipping, no pressure — I can share a lightweight benchmark pack we use with portfolio SRE teams (MTTK vs change risk).`,
	},
];

const DEFAULT_METRICS: ShadowPartnerMetrics = {
	foundersScanned: 12840,
	foundersScannedWeekDeltaPct: 12.4,
	thesisMatches: 186,
	outreachQueued: 24,
	responseRatePct: 31.2,
	responseRateWeekDeltaPct: 4.1,
};

const DEFAULT_THESIS = `Seeking pre-seed/seed B2B teams building **infrastructure for AI + distributed systems** with:
• a clear wedge in developer or SRE workflows
• evidence of enterprise design partners or repeatable PLG loops
• founders who have shipped critical path systems before

Geography-agnostic; prioritize US + EU time zones for this fund vintage.`;

function MemoryRing({
	usedPct,
	label,
	sub,
}: {
	usedPct: number;
	label: string;
	sub: string;
}): React.JSX.Element {
	const r = 52;
	const c = 2 * Math.PI * r;
	const dash = c * (Math.min(100, Math.max(0, usedPct)) / 100);

	return (
		<div className="flex items-center gap-5">
			<div className="relative size-28 shrink-0">
				<svg viewBox="0 0 120 120" className="size-full -rotate-90">
					<circle
						cx="60"
						cy="60"
						r={r}
						fill="none"
						className="stroke-muted"
						strokeWidth="8"
					/>
					<circle
						cx="60"
						cy="60"
						r={r}
						fill="none"
						className="stroke-emerald-500/90 transition-all duration-700"
						strokeWidth="8"
						strokeLinecap="round"
						strokeDasharray={`${dash} ${c}`}
					/>
					<circle
						cx="60"
						cy="60"
						r={r}
						fill="none"
						className="stroke-orange-400/35"
						strokeWidth="8"
						strokeDasharray={`${c * 0.12} ${c}`}
						strokeDashoffset={-dash * 0.15}
					/>
				</svg>
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<span className="font-semibold text-lg tabular-nums text-foreground">
						{usedPct}%
					</span>
					<span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
						index
					</span>
				</div>
			</div>
			<div className="min-w-0 space-y-1">
				<p className="font-medium text-foreground text-sm leading-snug">
					{label}
				</p>
				<p className="text-muted-foreground text-xs leading-relaxed">{sub}</p>
			</div>
		</div>
	);
}

function MetricMiniCard({
	title,
	value,
	sub,
	trendPct,
	invertTrendColor,
	icon: Icon,
}: {
	title: string;
	value: string;
	sub?: string;
	trendPct?: number;
	invertTrendColor?: boolean;
	icon: React.ComponentType<{ className?: string }>;
}): React.JSX.Element {
	const trendUp =
		trendPct === undefined
			? null
			: invertTrendColor
				? trendPct <= 0
				: trendPct >= 0;

	return (
		<Card className="border-border/80 bg-card/50 shadow-none backdrop-blur-sm transition-shadow hover:shadow-sm">
			<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
				<CardTitle className="font-medium text-muted-foreground text-sm">
					{title}
				</CardTitle>
				<div className="rounded-md border border-border/70 bg-muted/40 p-1.5">
					<Icon className="size-4 text-orange-600 dark:text-orange-400" />
				</div>
			</CardHeader>
			<CardContent className="space-y-2">
				<div className="flex flex-wrap items-baseline gap-2">
					<span className="font-semibold text-2xl tabular-nums tracking-tight">
						{value}
					</span>
					{trendPct !== undefined && (
						<span
							className={cn(
								"inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-medium text-xs",
								trendUp
									? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
									: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
							)}
						>
							{trendUp ? (
								<ArrowUpRight className="size-3.5" />
							) : (
								<ArrowDownRight className="size-3.5" />
							)}
							{Math.abs(trendPct)}%
							<span className="sr-only">
								{trendUp ? "up" : "down"} week over week
							</span>
						</span>
					)}
				</div>
				{sub ? (
					<p className="text-muted-foreground text-xs">{sub}</p>
				) : (
					<p className="text-muted-foreground text-xs">vs. prior 7 days</p>
				)}
			</CardContent>
		</Card>
	);
}

function LogBubble({
	entry,
}: {
	entry: ShadowAgentLogEntry;
}): React.JSX.Element {
	const tone =
		entry.level === "success"
			? "border-emerald-500/25 bg-emerald-500/5"
			: entry.level === "warn"
				? "border-orange-500/25 bg-orange-500/5"
				: entry.level === "think"
					? "border-border/80 bg-muted/30"
					: "border-border/60 bg-background";

	return (
		<div
			className={cn(
				"rounded-lg border px-3 py-2 font-mono text-[11px] leading-relaxed md:text-xs",
				tone,
			)}
		>
			<span className="text-muted-foreground">
				{new Date(entry.ts).toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
				})}
			</span>{" "}
			<span
				className={cn(
					"font-semibold uppercase",
					entry.level === "success" && "text-emerald-600 dark:text-emerald-400",
					entry.level === "warn" && "text-orange-600 dark:text-orange-400",
					entry.level === "think" && "text-muted-foreground",
				)}
			>
				[{entry.level}]
			</span>{" "}
			<span className="text-foreground/90">{entry.message}</span>
		</div>
	);
}

export type ShadowPartnerDashboardProps = {
	organizationName: string;
};

export function ShadowPartnerDashboard({
	organizationName,
}: ShadowPartnerDashboardProps): React.JSX.Element {
	const streamEndRef = React.useRef<HTMLDivElement | null>(null);

	const [metrics, setMetrics] =
		React.useState<ShadowPartnerMetrics>(DEFAULT_METRICS);
	const [logs, setLogs] = React.useState<ShadowAgentLogEntry[]>(INITIAL_LOGS);
	const [leads] = React.useState<ShadowPartnerLead[]>(INITIAL_LEADS);
	const [approvals, setApprovals] = React.useState<
		Record<string, LeadApprovalStatus>
	>(() =>
		Object.fromEntries(INITIAL_LEADS.map((l) => [l.id, "pending" as const])),
	);
	const [thesis, setThesis] = React.useState<string>(DEFAULT_THESIS);
	const [sources, setSources] = React.useState<ShadowDataSourcesConfig>({
		github: true,
		productHunt: true,
		xTwitter: true,
	});
	const [vectorCount, setVectorCount] = React.useState(842_900);
	const [vectorCapacity] = React.useState(1_000_000);
	const [scanBusy, setScanBusy] = React.useState(false);
	const [dialogOpen, setDialogOpen] = React.useState(false);
	const [activeLead, setActiveLead] = React.useState<ShadowPartnerLead | null>(
		null,
	);
	const [agentActive, setAgentActive] = React.useState(true);

	React.useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await fetch("/api/shadow-partner");
				if (!res.ok) {
					return;
				}
				const data = (await res.json()) as {
					metrics?: ShadowPartnerMetrics;
					memory?: { vectorCount?: number; capacity?: number };
				};
				if (cancelled) {
					return;
				}
				if (data.metrics) {
					setMetrics(data.metrics);
				}
				if (data.memory?.vectorCount) {
					setVectorCount(data.memory.vectorCount);
				}
			} catch {
				// keep local defaults
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	React.useEffect(() => {
		streamEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [logs]);

	const memoryPct = Math.round((vectorCount / vectorCapacity) * 100);

	const runManualScan = async (): Promise<void> => {
		setScanBusy(true);
		const t = createId();
		setLogs((prev) => [
			...prev,
			{
				id: t,
				ts: Date.now(),
				level: "think",
				message: "Manual scan requested — orchestrating Bright Data workers…",
			},
		]);
		try {
			const res = await fetch("/api/shadow-partner", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "manual-scan",
					thesisSnippet: thesis.slice(0, 800),
				}),
			});
			const data = (await res.json()) as { steps?: string[] };
			const stepLogs: ShadowAgentLogEntry[] = (data.steps ?? []).map(
				(step, i) => ({
					id: `${createId()}${i}`,
					ts: Date.now(),
					level: "success" as const,
					message: step,
				}),
			);
			setLogs((prev) => [
				...prev,
				...stepLogs,
				{
					id: createId(),
					ts: Date.now(),
					level: "success",
					message:
						"Scan slice complete — thesis evaluator queued on Ollama / Z.ai; drafts staged in Butterbase for your review.",
				},
			]);
			setMetrics((m) => ({
				...m,
				foundersScanned: m.foundersScanned + 42,
				thesisMatches: m.thesisMatches + 3,
				outreachQueued: m.outreachQueued + 1,
			}));
		} catch {
			setLogs((prev) => [
				...prev,
				{
					id: createId(),
					ts: Date.now(),
					level: "warn",
					message:
						"Manual scan API unreachable — showing local simulation only.",
				},
			]);
		} finally {
			setScanBusy(false);
		}
	};

	const openDraft = (lead: ShadowPartnerLead): void => {
		setActiveLead(lead);
		setDialogOpen(true);
	};

	const setLeadStatus = (leadId: string, status: LeadApprovalStatus): void => {
		setApprovals((a) => ({ ...a, [leadId]: status }));
		if (status === "approved") {
			setMetrics((m) => ({
				...m,
				outreachQueued: Math.max(0, m.outreachQueued - 1),
				responseRatePct: Math.min(99.9, m.responseRatePct + 0.3),
			}));
			setLogs((prev) => [
				...prev,
				{
					id: createId(),
					ts: Date.now(),
					level: "success",
					message: `Lead ${leadId}: marked approved — Resend queue + Slack/Gmail fan-out hook invoked (stub).`,
				},
			]);
		}
		if (status === "rejected") {
			setLogs((prev) => [
				...prev,
				{
					id: createId(),
					ts: Date.now(),
					level: "warn",
					message: `Lead ${leadId}: rejected — contact tombstone updated to avoid re-contact.`,
				},
			]);
		}
	};

	return (
		<div className="p-4 pb-24 sm:px-6 sm:pt-6">
			<div className="mx-auto w-full max-w-[1600px] space-y-6">
				<div className="flex flex-col gap-4 border-border/70 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
					<div className="space-y-2">
						<div className="flex flex-wrap items-center gap-3">
							<h1 className="font-semibold text-2xl tracking-tight sm:text-3xl">
								AI Shadow Partner
							</h1>
							<button
								type="button"
								onClick={() => setAgentActive((v) => !v)}
								className={cn(
									"inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium text-xs transition-colors",
									agentActive
										? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
										: "border-border bg-muted/50 text-muted-foreground",
								)}
							>
								<span
									className={cn(
										"size-2 rounded-full",
										agentActive
											? "animate-pulse bg-emerald-500 shadow-[0_0_8px_rgb(34,197,94)]"
											: "bg-muted-foreground",
									)}
									aria-hidden
								/>
								{agentActive ? "Agent Active" : "Agent Paused"}
							</button>
						</div>
						<p className="max-w-2xl text-muted-foreground text-sm leading-relaxed">
							Autonomous VC sourcing for{" "}
							<span className="font-medium text-foreground">
								{organizationName}
							</span>
							— scraping public surfaces, reasoning against your thesis, and
							queuing outreach for human approval.
						</p>
					</div>
					<div className="flex shrink-0 flex-wrap gap-2">
						<Button
							variant="outline"
							size="sm"
							className="border-border/80 shadow-none"
							onClick={runManualScan}
							disabled={scanBusy || !agentActive}
						>
							{scanBusy ? (
								<Hourglass className="size-4 animate-pulse" />
							) : (
								<Play className="size-4" />
							)}
							Run Manual Scan
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
					<MetricMiniCard
						title="Founders scanned"
						value={metrics.foundersScanned.toLocaleString()}
						trendPct={metrics.foundersScannedWeekDeltaPct}
						icon={Radar}
					/>
					<MetricMiniCard
						title="Thesis matches"
						value={metrics.thesisMatches.toLocaleString()}
						sub="High-confidence Z.ai classifications"
						trendPct={8.2}
						icon={Sparkles}
					/>
					<MetricMiniCard
						title="Outreach queued"
						value={metrics.outreachQueued.toLocaleString()}
						sub="Awaiting manual approval"
						trendPct={-2.4}
						invertTrendColor
						icon={Mail}
					/>
					<MetricMiniCard
						title="Response rate"
						value={`${metrics.responseRatePct.toFixed(1)}%`}
						trendPct={metrics.responseRateWeekDeltaPct}
						icon={Send}
					/>
				</div>

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
					<div className="space-y-6 lg:col-span-3">
						<Card className="border-border/80 shadow-none">
							<CardHeader className="border-border/60 border-b pb-4">
								<div className="flex items-center gap-2">
									<Bot className="size-4 text-orange-600 dark:text-orange-400" />
									<CardTitle className="text-base">
										Live stream of consciousness
									</CardTitle>
								</div>
								<CardDescription>
									Real-time agent trace (Bright Data, Ollama / Z.ai)
								</CardDescription>
							</CardHeader>
							<CardContent className="pt-4">
								<ScrollArea className="h-64 rounded-lg border border-border/70 bg-muted/20 pr-3">
									<div className="space-y-2 p-3">
										{logs.map((entry) => (
											<LogBubble key={entry.id} entry={entry} />
										))}
										<div ref={streamEndRef} />
									</div>
								</ScrollArea>
							</CardContent>
						</Card>

						<Card className="border-border/80 shadow-none">
							<CardHeader className="border-border/60 border-b pb-4">
								<CardTitle className="text-base">Pending approvals</CardTitle>
								<CardDescription>
									Sourced founders ranked by model confidence — approve to
									trigger Resend + delivery queues (stub).
								</CardDescription>
							</CardHeader>
							<CardContent className="p-0 sm:px-0">
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow className="border-border/60 hover:bg-transparent">
												<TableHead className="w-[140px]">Founder</TableHead>
												<TableHead>Startup</TableHead>
												<TableHead>Source</TableHead>
												<TableHead className="text-right">Confidence</TableHead>
												<TableHead className="text-right">Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{leads.map((lead) => {
												const status = approvals[lead.id] ?? "pending";
												return (
													<TableRow
														key={lead.id}
														className={cn(
															"border-border/60",
															status === "rejected" && "opacity-50",
														)}
													>
														<TableCell className="font-medium">
															<div className="flex flex-col">
																<span>{lead.founderName}</span>
																<span className="text-muted-foreground text-xs">
																	id {lead.founderId}
																</span>
															</div>
														</TableCell>
														<TableCell>{lead.startupName}</TableCell>
														<TableCell>
															<Badge
																variant="outline"
																className="border-border/80 font-normal"
															>
																{lead.platform === "github" && (
																	<Github className="mr-1 size-3" />
																)}
																{lead.platform === "x" && (
																	<Twitter className="mr-1 size-3" />
																)}
																{PLATFORM_LABEL[lead.platform]}
															</Badge>
														</TableCell>
														<TableCell className="text-right">
															<span
																className={cn(
																	"font-semibold tabular-nums",
																	lead.confidence >= 0.9
																		? "text-emerald-600 dark:text-emerald-400"
																		: lead.confidence >= 0.85
																			? "text-orange-600 dark:text-orange-400"
																			: "text-foreground",
																)}
															>
																{(lead.confidence * 100).toFixed(0)}%
															</span>
														</TableCell>
														<TableCell>
															<div className="flex flex-wrap items-center justify-end gap-2">
																<Button
																	variant="ghost"
																	size="sm"
																	className="h-8 text-xs"
																	onClick={() => openDraft(lead)}
																>
																	View draft
																</Button>
																{status === "pending" && (
																	<>
																		<Button
																			size="sm"
																			variant="outline"
																			className="h-8 border-emerald-500/40 bg-emerald-500/5 text-xs text-emerald-800 hover:bg-emerald-500/10 dark:text-emerald-300"
																			onClick={() =>
																				setLeadStatus(lead.id, "approved")
																			}
																		>
																			Approve & send
																		</Button>
																		<Button
																			size="sm"
																			variant="outline"
																			className="h-8 text-xs"
																			onClick={() =>
																				setLeadStatus(lead.id, "rejected")
																			}
																		>
																			Reject
																		</Button>
																	</>
																)}
																{status === "approved" && (
																	<Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
																		Approved
																	</Badge>
																)}
																{status === "rejected" && (
																	<Badge variant="secondary">Rejected</Badge>
																)}
															</div>
														</TableCell>
													</TableRow>
												);
											})}
										</TableBody>
									</Table>
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="space-y-6 lg:col-span-2">
						<Card className="border-border/80 shadow-none">
							<CardHeader>
								<CardTitle className="text-base">Investment thesis</CardTitle>
								<CardDescription>
									Evaluated by Z.ai / local Ollama against scraped evidence
									bundles.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<Label htmlFor="thesis" className="sr-only">
									Thesis
								</Label>
								<Textarea
									id="thesis"
									value={thesis}
									onChange={(e) => setThesis(e.target.value)}
									rows={12}
									className="min-h-[220px] resize-y border-border/80 bg-muted/20 font-medium text-sm leading-relaxed"
								/>
								<p className="text-muted-foreground text-xs">
									Manual scans attach this thesis snapshot to the orchestration
									POST (body truncated server-side in the mock).
								</p>
							</CardContent>
						</Card>

						<Card className="border-border/80 shadow-none">
							<CardHeader>
								<CardTitle className="text-base">Data sources</CardTitle>
								<CardDescription>
									Bright Data scraper lanes — toggle to include/exclude
									surfaces.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-5">
								<div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-muted/15 px-4 py-3">
									<div className="flex items-center gap-3">
										<Github className="size-4 text-muted-foreground" />
										<div>
											<p className="font-medium text-sm">GitHub</p>
											<p className="text-muted-foreground text-xs">
												Repos, releases, contributor graphs
											</p>
										</div>
									</div>
									<Switch
										checked={sources.github}
										onCheckedChange={(v) =>
											setSources((s) => ({ ...s, github: v }))
										}
										aria-label="Toggle GitHub scraper"
									/>
								</div>
								<div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-muted/15 px-4 py-3">
									<div className="flex items-center gap-3">
										<Sparkles className="size-4 text-muted-foreground" />
										<div>
											<p className="font-medium text-sm">Product Hunt</p>
											<p className="text-muted-foreground text-xs">
												Launches, maker graph, traction proxies
											</p>
										</div>
									</div>
									<Switch
										checked={sources.productHunt}
										onCheckedChange={(v) =>
											setSources((s) => ({ ...s, productHunt: v }))
										}
										aria-label="Toggle Product Hunt scraper"
									/>
								</div>
								<div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-muted/15 px-4 py-3">
									<div className="flex items-center gap-3">
										<Twitter className="size-4 text-muted-foreground" />
										<div>
											<p className="font-medium text-sm">X / Twitter</p>
											<p className="text-muted-foreground text-xs">
												Founder arcs, reply networks, signal density
											</p>
										</div>
									</div>
									<Switch
										checked={sources.xTwitter}
										onCheckedChange={(v) =>
											setSources((s) => ({ ...s, xTwitter: v }))
										}
										aria-label="Toggle X scraper"
									/>
								</div>
							</CardContent>
						</Card>

						<Card className="border-border/80 shadow-none">
							<CardHeader>
								<div className="flex items-center gap-2">
									<Database className="size-4 text-emerald-600 dark:text-emerald-400" />
									<CardTitle className="text-base">
										Memory status (isolated state layers)
									</CardTitle>
								</div>
								<CardDescription>
									Deduplication vector index — avoids double-contacting known{" "}
									<code className="rounded bg-muted px-1 py-0.5 text-[11px]">
										founder_id
									</code>
									.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<MemoryRing
									usedPct={memoryPct}
									label={`${vectorCount.toLocaleString()} embeddings online`}
									sub={`Resizing window ~${(
										vectorCapacity - vectorCount
									).toLocaleString()} slots remaining before compaction.`}
								/>
								<Button
									variant="outline"
									size="sm"
									className="w-full border-dashed"
									onClick={() =>
										setVectorCount((n) => Math.min(vectorCapacity, n + 12_000))
									}
								>
									Simulate ingestion burst (+12k)
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Draft outreach</DialogTitle>
						<DialogDescription>
							{activeLead
								? `${activeLead.founderName} · ${activeLead.startupName}`
								: ""}
						</DialogDescription>
					</DialogHeader>
					{activeLead ? (
						<div className="space-y-4">
							<div>
								<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
									Subject
								</p>
								<p className="mt-1 font-medium text-foreground text-sm">
									{activeLead.emailDraftSubject}
								</p>
							</div>
							<div>
								<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
									Body
								</p>
								<pre className="mt-2 max-h-[280px] overflow-auto whitespace-pre-wrap rounded-lg border border-border/70 bg-muted/25 p-3 font-sans text-sm leading-relaxed">
									{activeLead.emailDraftBody}
								</pre>
							</div>
							<div className="flex justify-end gap-2">
								<Button variant="outline" onClick={() => setDialogOpen(false)}>
									Close
								</Button>
								<Button
									onClick={() => {
										setLeadStatus(activeLead.id, "approved");
										setDialogOpen(false);
									}}
								>
									Approve from preview
								</Button>
							</div>
						</div>
					) : null}
				</DialogContent>
			</Dialog>
		</div>
	);
}
