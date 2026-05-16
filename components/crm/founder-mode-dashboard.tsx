"use client";

import {
	ArrowDownRight,
	ArrowUpRight,
	Database,
	Hourglass,
	Linkedin,
	Mail,
	Play,
	Radar,
	Send,
	Sparkles,
	Target,
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
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

type VCPlatform = "linkedin" | "crunchbase" | "twitter";
type ApprovalStatus = "pending" | "approved" | "rejected";
type LogLevel = "think" | "info" | "success" | "warn";

interface AgentLogEntry {
	id: string;
	ts: number;
	level: LogLevel;
	message: string;
}

interface VCLead {
	id: string;
	partnerId: string;
	partnerName: string;
	fundName: string;
	platform: VCPlatform;
	matchScore: number;
	emailDraftSubject: string;
	emailDraftBody: string;
}

interface FounderMetrics {
	vcsProfiled: number;
	vcsProfiledWeekDeltaPct: number;
	thesisMatches: number;
	pitchesQueued: number;
	responseRatePct: number;
	responseRateWeekDeltaPct: number;
}

interface DataSourcesConfig {
	crunchbase: boolean;
	linkedin: boolean;
	twitter: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────────

const PLATFORM_LABEL: Record<VCPlatform, string> = {
	linkedin: "LinkedIn",
	crunchbase: "Crunchbase",
	twitter: "X / Twitter",
};

function createId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── Mock data ──────────────────────────────────────────────────────────────

const INITIAL_LOGS: AgentLogEntry[] = [
	{
		id: "1",
		ts: Date.now() - 120_000,
		level: "think",
		message:
			'Scraping Crunchbase for "AI Infra seed funds" — filtering by deal activity in last 90 days…',
	},
	{
		id: "2",
		ts: Date.now() - 90_000,
		level: "info",
		message:
			"Bright Data job bd-li-2291: LinkedIn DOM stable, extracting GP thesis signals from profile activity.",
	},
	{
		id: "3",
		ts: Date.now() - 60_000,
		level: "think",
		message:
			"Analyzing Martin Casado's recent portfolio announcements — inferring check size from deal memos…",
	},
	{
		id: "4",
		ts: Date.now() - 30_000,
		level: "success",
		message:
			"Sequoia (Shaun Maguire): 3 new AI DevTools investments in Q1 2025 — high recency signal, drafting pitch.",
	},
];

const INITIAL_LEADS: VCLead[] = [
	{
		id: "vc-1",
		partnerId: "p-seq-01",
		partnerName: "Shaun Maguire",
		fundName: "Sequoia Capital",
		platform: "linkedin",
		matchScore: 0.96,
		emailDraftSubject:
			"Sequoia × [Your Company] — AI-native infrastructure seed",
		emailDraftBody: `Shaun — I've been following Sequoia's deployment cadence in AI infrastructure and believe our stack sits at exactly the wedge you've been writing about.

We're building [Your Company]: [one-line pitch].

Why now: [market timing argument].
Why us: [founding team differentiator].

We're raising a $[X]M Seed. Given your recent investments in AI observability tooling, I believe you'd immediately see the pattern.

Worth a 20-minute call? Happy to send the deck first.`,
	},
	{
		id: "vc-2",
		partnerId: "p-a16z-01",
		partnerName: "Martin Casado",
		fundName: "Andreessen Horowitz",
		platform: "linkedin",
		matchScore: 0.94,
		emailDraftSubject: "a16z × [Your Company] — developer infrastructure",
		emailDraftBody: `Martin — your framing around "foundational transformations in developer infrastructure" maps closely to what we're building.

[Your Company] is [one-line pitch].

We have [X] design partners, [Y] in early ARR commitments, and a team that has shipped critical-path systems at [Company A] and [Company B].

We're raising a $[X]M Seed/Series A. Given a16z's enterprise go-to-market network, I think the distribution angle here would resonate with your portfolio thesis.

Open to a call?`,
	},
	{
		id: "vc-3",
		partnerId: "p-frc-01",
		partnerName: "Brett Berson",
		fundName: "First Round Capital",
		platform: "crunchbase",
		matchScore: 0.93,
		emailDraftSubject: "First Round × [Your Company] — pre-seed / seed",
		emailDraftBody: `Brett — First Round's operator framework for pre-seed companies is exactly the kind of hands-on partnership we're looking for at this stage.

[Your Company]: [one-line pitch].

We're at [stage]: [traction proof point]. The product-market fit signal is early but strong — [specific metric].

Looking to raise $[X]M to extend runway through [milestone]. Would love 20 minutes to walk through the deck and get your honest read.`,
	},
	{
		id: "vc-4",
		partnerId: "p-ff-01",
		partnerName: "Keith Rabois",
		fundName: "Founders Fund",
		platform: "twitter",
		matchScore: 0.91,
		emailDraftSubject: "Founders Fund × [Your Company] — non-consensus bet",
		emailDraftBody: `Keith — you've written about backing founders who see structural regularities that the market hasn't priced yet. That's exactly the thesis behind [Your Company].

[One-line pitch with the non-consensus angle clearly stated].

[Why this is a breakthrough, not an incremental improvement].

We're raising $[X]M. Happy to send the full technical breakdown — I think the architecture itself makes the argument better than any slide.`,
	},
	{
		id: "vc-5",
		partnerId: "p-bm-01",
		partnerName: "Miles Grimshaw",
		fundName: "Benchmark",
		platform: "crunchbase",
		matchScore: 0.92,
		emailDraftSubject: "Benchmark × [Your Company] — open-source core",
		emailDraftBody: `Miles — Benchmark's track record with high-conviction technical founders (Elastic, Cockroach) mirrors exactly the kind of company we're building.

[Your Company] is an open-source [category] that [does X]. The protocol layer we're establishing creates a defensible moat similar to what you saw with [portfolio company].

Current traction: [X] GitHub stars, [Y] active integrations, [Z] contributors.

Raising $[X]M Seed. Would love to share the community growth data — I think the organic retention curve speaks for itself.`,
	},
];

const DEFAULT_METRICS: FounderMetrics = {
	vcsProfiled: 3_241,
	vcsProfiledWeekDeltaPct: 18.6,
	thesisMatches: 47,
	pitchesQueued: 12,
	responseRatePct: 28.4,
	responseRateWeekDeltaPct: 5.2,
};

const DEFAULT_PITCH = `Raising Seed/Series A for a **B2B AI infrastructure platform** with:
• developer-first SDK embedding into existing eng workflows
• 3 design partners at LOI stage with $2M+ ARR commitments
• founding team: ex-Google Brain + ex-Stripe engineering leads

Target check: $3–5M. Strong preference for US investors with enterprise SaaS depth and AI infra thesis alignment.`;

// ── Sub-components ─────────────────────────────────────────────────────────

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

function LogBubble({ entry }: { entry: AgentLogEntry }): React.JSX.Element {
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

// ── Main component ─────────────────────────────────────────────────────────

export type FounderModeDashboardProps = {
	organizationName: string;
};

export function FounderModeDashboard({
	organizationName,
}: FounderModeDashboardProps): React.JSX.Element {
	const streamEndRef = React.useRef<HTMLDivElement | null>(null);

	const [metrics, setMetrics] = React.useState<FounderMetrics>(DEFAULT_METRICS);
	const [logs, setLogs] = React.useState<AgentLogEntry[]>(INITIAL_LOGS);
	const [leads] = React.useState<VCLead[]>(INITIAL_LEADS);
	const [approvals, setApprovals] = React.useState<
		Record<string, ApprovalStatus>
	>(() =>
		Object.fromEntries(INITIAL_LEADS.map((l) => [l.id, "pending" as const])),
	);
	const [pitch, setPitch] = React.useState<string>(DEFAULT_PITCH);
	const [sources, setSources] = React.useState<DataSourcesConfig>({
		crunchbase: true,
		linkedin: true,
		twitter: true,
	});
	const [vectorCount, setVectorCount] = React.useState(612_400);
	const [vectorCapacity] = React.useState(1_000_000);
	const [scanBusy, setScanBusy] = React.useState(false);
	const [dialogOpen, setDialogOpen] = React.useState(false);
	const [activeLead, setActiveLead] = React.useState<VCLead | null>(null);
	const [agentActive, setAgentActive] = React.useState(true);

	// Auto-scroll log stream — scoped to the scroll area container only
	React.useEffect(() => {
		if (streamEndRef.current) {
			const container = streamEndRef.current.closest(
				"[data-radix-scroll-area-viewport]",
			);
			if (container) {
				container.scrollTop = container.scrollHeight;
			}
		}
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
				message:
					"Manual scan requested — orchestrating Bright Data + Crunchbase/LinkedIn workers…",
			},
		]);
		try {
			await new Promise((r) => setTimeout(r, 1_800));
			const stepMessages = [
				"Crunchbase: retrieved 312 fund records active in target sectors.",
				"LinkedIn DOM stable — GP thesis signals extracted for 28 partners.",
				"Thesis evaluator matched pitch against 47 active VC investment frameworks.",
				"5 new high-confidence matches queued (≥88% alignment).",
			];
			const stepLogs: AgentLogEntry[] = stepMessages.map((msg, i) => ({
				id: `${createId()}${i}`,
				ts: Date.now() + i * 200,
				level: "success" as const,
				message: msg,
			}));
			setLogs((prev) => [
				...prev,
				...stepLogs,
				{
					id: createId(),
					ts: Date.now() + 900,
					level: "success",
					message:
						"Scan slice complete — pitch evaluator queued; drafts staged for your review.",
				},
			]);
			setMetrics((m) => ({
				...m,
				vcsProfiled: m.vcsProfiled + 38,
				thesisMatches: m.thesisMatches + 5,
				pitchesQueued: m.pitchesQueued + 2,
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

	const openDraft = (lead: VCLead): void => {
		setActiveLead(lead);
		setDialogOpen(true);
	};

	const setLeadStatus = (leadId: string, status: ApprovalStatus): void => {
		setApprovals((a) => ({ ...a, [leadId]: status }));
		if (status === "approved") {
			setMetrics((m) => ({
				...m,
				pitchesQueued: Math.max(0, m.pitchesQueued - 1),
				responseRatePct: Math.min(99.9, m.responseRatePct + 0.4),
			}));
			setLogs((prev) => [
				...prev,
				{
					id: createId(),
					ts: Date.now(),
					level: "success",
					message: `VC ${leadId}: approved — Resend queue + outreach delivery hook invoked.`,
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
					message: `VC ${leadId}: rejected — partner_id tombstoned to avoid re-pitch.`,
				},
			]);
		}
	};

	return (
		<div className="p-4 pb-24 sm:px-6 sm:pt-6">
			<div className="mx-auto w-full max-w-[1600px] space-y-6">
				{/* ── Page header ── */}
				<div className="flex flex-col gap-4 border-border/70 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
					<div className="space-y-2">
						<div className="flex flex-wrap items-center gap-3">
							<h1 className="font-semibold text-2xl tracking-tight sm:text-3xl">
								Founder Mode
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
							Reverse VC sourcing for{" "}
							<span className="font-medium text-foreground">
								{organizationName}
							</span>{" "}
							— scraping public investor surfaces, evaluating your pitch against
							active fund theses, and queuing targeted outreach for your
							approval.
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

				{/* ── Metric cards ── */}
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
					<MetricMiniCard
						title="VCs profiled"
						value={metrics.vcsProfiled.toLocaleString()}
						trendPct={metrics.vcsProfiledWeekDeltaPct}
						icon={Radar}
					/>
					<MetricMiniCard
						title="Thesis matches"
						value={metrics.thesisMatches.toLocaleString()}
						sub="High-confidence pitch alignments"
						trendPct={11.3}
						icon={Sparkles}
					/>
					<MetricMiniCard
						title="Pitches queued"
						value={metrics.pitchesQueued.toLocaleString()}
						sub="Awaiting your approval"
						trendPct={-1.8}
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

				{/* ── Main grid (3 + 2 columns) ── */}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
					{/* ── Left col (3/5): Log stream + approval table ── */}
					<div className="space-y-6 lg:col-span-3">
						{/* Live stream */}
						<Card className="border-border/80 shadow-none">
							<CardHeader className="border-border/60 border-b pb-4">
								<div className="flex items-center gap-2">
									<Target className="size-4 text-orange-600 dark:text-orange-400" />
									<CardTitle className="text-base">
										Live stream of consciousness
									</CardTitle>
								</div>
								<CardDescription>
									Real-time agent trace (Bright Data, Crunchbase, LinkedIn, X /
									Twitter)
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

						{/* Pending approvals */}
						<Card className="border-border/80 shadow-none">
							<CardHeader className="border-border/60 border-b pb-4">
								<CardTitle className="text-base">Pending approvals</CardTitle>
								<CardDescription>
									Matched VCs ranked by thesis alignment — approve to trigger
									outreach delivery queues.
								</CardDescription>
							</CardHeader>
							<CardContent className="p-0 sm:px-0">
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow className="border-border/60 hover:bg-transparent">
												<TableHead className="w-[160px]">Partner</TableHead>
												<TableHead>Fund</TableHead>
												<TableHead>Source</TableHead>
												<TableHead className="text-right">Match</TableHead>
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
																<span>{lead.partnerName}</span>
																<span className="text-muted-foreground text-xs">
																	id {lead.partnerId}
																</span>
															</div>
														</TableCell>
														<TableCell>{lead.fundName}</TableCell>
														<TableCell>
															<Badge
																variant="outline"
																className="border-border/80 font-normal"
															>
																{lead.platform === "linkedin" && (
																	<Linkedin className="mr-1 size-3" />
																)}
																{lead.platform === "twitter" && (
																	<Twitter className="mr-1 size-3" />
																)}
																{lead.platform === "crunchbase" && (
																	<Database className="mr-1 size-3" />
																)}
																{PLATFORM_LABEL[lead.platform]}
															</Badge>
														</TableCell>
														<TableCell className="text-right">
															<span
																className={cn(
																	"font-semibold tabular-nums",
																	lead.matchScore >= 0.93
																		? "text-emerald-600 dark:text-emerald-400"
																		: lead.matchScore >= 0.88
																			? "text-orange-600 dark:text-orange-400"
																			: "text-foreground",
																)}
															>
																{(lead.matchScore * 100).toFixed(0)}%
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

					{/* ── Right col (2/5): Pitch + data sources + memory ── */}
					<div className="space-y-6 lg:col-span-2">
						{/* Founder pitch */}
						<Card className="border-border/80 shadow-none">
							<CardHeader>
								<CardTitle className="text-base">Your founder pitch</CardTitle>
								<CardDescription>
									Evaluated against active VC thesis frameworks to score
									alignment and generate personalised outreach.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<Label htmlFor="pitch" className="sr-only">
									Pitch
								</Label>
								<Textarea
									id="pitch"
									value={pitch}
									onChange={(e) => setPitch(e.target.value)}
									rows={12}
									className="min-h-[220px] resize-y border-border/80 bg-muted/20 font-medium text-sm leading-relaxed"
								/>
								<p className="text-muted-foreground text-xs">
									Manual scans attach this pitch snapshot to the orchestration
									request — evaluated server-side against scraped VC thesis
									data.
								</p>
							</CardContent>
						</Card>

						{/* Data sources */}
						<Card className="border-border/80 shadow-none">
							<CardHeader>
								<CardTitle className="text-base">Data sources</CardTitle>
								<CardDescription>
									Bright Data scraper lanes — toggle to include or exclude
									investor intelligence surfaces.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-5">
								<div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-muted/15 px-4 py-3">
									<div className="flex items-center gap-3">
										<Database className="size-4 text-muted-foreground" />
										<div>
											<p className="font-medium text-sm">Crunchbase</p>
											<p className="text-muted-foreground text-xs">
												Fund activity, deal flow, check size signals
											</p>
										</div>
									</div>
									<Switch
										checked={sources.crunchbase}
										onCheckedChange={(v) =>
											setSources((s) => ({ ...s, crunchbase: v }))
										}
										aria-label="Toggle Crunchbase scraper"
									/>
								</div>
								<div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-muted/15 px-4 py-3">
									<div className="flex items-center gap-3">
										<Linkedin className="size-4 text-muted-foreground" />
										<div>
											<p className="font-medium text-sm">LinkedIn</p>
											<p className="text-muted-foreground text-xs">
												GP profiles, portfolio signals, thesis updates
											</p>
										</div>
									</div>
									<Switch
										checked={sources.linkedin}
										onCheckedChange={(v) =>
											setSources((s) => ({ ...s, linkedin: v }))
										}
										aria-label="Toggle LinkedIn scraper"
									/>
								</div>
								<div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-muted/15 px-4 py-3">
									<div className="flex items-center gap-3">
										<Twitter className="size-4 text-muted-foreground" />
										<div>
											<p className="font-medium text-sm">X / Twitter</p>
											<p className="text-muted-foreground text-xs">
												GP thesis threads, deal announcements, reply networks
											</p>
										</div>
									</div>
									<Switch
										checked={sources.twitter}
										onCheckedChange={(v) =>
											setSources((s) => ({ ...s, twitter: v }))
										}
										aria-label="Toggle X scraper"
									/>
								</div>
							</CardContent>
						</Card>

						{/* Memory status */}
						<Card className="border-border/80 shadow-none">
							<CardHeader>
								<div className="flex items-center gap-2">
									<Database className="size-4 text-emerald-600 dark:text-emerald-400" />
									<CardTitle className="text-base">
										Memory status (isolated state layers)
									</CardTitle>
								</div>
								<CardDescription>
									Deduplication vector index — avoids re-pitching known{" "}
									<code className="rounded bg-muted px-1 py-0.5 text-[11px]">
										partner_id
									</code>{" "}
									contacts.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<MemoryRing
									usedPct={memoryPct}
									label={`${vectorCount.toLocaleString()} embeddings online`}
									sub={`~${(
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

			{/* ── Draft dialog ── */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Draft outreach</DialogTitle>
						<DialogDescription>
							{activeLead
								? `${activeLead.partnerName} · ${activeLead.fundName}`
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
