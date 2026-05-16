"use client";

import { PipelineStatus, SourceType } from "@prisma/client";
import {
	ArrowUpRight,
	Github,
	Radar,
	Send,
	Sparkles,
	Twitter,
} from "lucide-react";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";

const STATUS_ORDER: PipelineStatus[] = [
	PipelineStatus.SCANNED,
	PipelineStatus.EVALUATED,
	PipelineStatus.QUEUED,
	PipelineStatus.OUTREACHED,
	PipelineStatus.IGNORED,
];

const STATUS_LABELS: Record<PipelineStatus, string> = {
	[PipelineStatus.SCANNED]: "Scanned",
	[PipelineStatus.EVALUATED]: "Evaluated",
	[PipelineStatus.QUEUED]: "Queued",
	[PipelineStatus.OUTREACHED]: "Outreached",
	[PipelineStatus.IGNORED]: "Ignored",
};

const STATUS_COLORS: Record<PipelineStatus, string> = {
	[PipelineStatus.SCANNED]: "bg-slate-400 dark:bg-slate-500",
	[PipelineStatus.EVALUATED]: "bg-violet-500",
	[PipelineStatus.QUEUED]: "bg-amber-500",
	[PipelineStatus.OUTREACHED]: "bg-emerald-500",
	[PipelineStatus.IGNORED]: "bg-muted-foreground/40",
};

const SOURCE_LABELS: Record<SourceType, string> = {
	[SourceType.GITHUB]: "GitHub",
	[SourceType.PRODUCT_HUNT]: "Product Hunt",
	[SourceType.TWITTER]: "X / Twitter",
	[SourceType.OTHER]: "Other",
};

function SourceIcon({
	source,
}: {
	source: SourceType;
}): React.JSX.Element | null {
	if (source === SourceType.GITHUB)
		return <Github className="size-3 shrink-0" />;
	if (source === SourceType.TWITTER)
		return <Twitter className="size-3 shrink-0" />;
	if (source === SourceType.PRODUCT_HUNT)
		return <Sparkles className="size-3 shrink-0" />;
	return null;
}

function StatCard({
	title,
	value,
	sub,
	icon: Icon,
	accent,
}: {
	title: string;
	value: string | number;
	sub?: string;
	icon: React.ComponentType<{ className?: string }>;
	accent?: "emerald" | "violet" | "amber" | "default";
}): React.JSX.Element {
	const iconColor =
		accent === "emerald"
			? "text-emerald-600 dark:text-emerald-400"
			: accent === "violet"
				? "text-violet-600 dark:text-violet-400"
				: accent === "amber"
					? "text-amber-600 dark:text-amber-400"
					: "text-orange-600 dark:text-orange-400";

	return (
		<Card className="border-border/80 bg-card/50 shadow-none backdrop-blur-sm">
			<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
				<CardTitle className="font-medium text-muted-foreground text-sm">
					{title}
				</CardTitle>
				<div className="rounded-md border border-border/70 bg-muted/40 p-1.5">
					<Icon className={cn("size-4", iconColor)} />
				</div>
			</CardHeader>
			<CardContent className="space-y-1">
				<p className="font-semibold text-2xl tabular-nums tracking-tight">
					{value}
				</p>
				{sub ? (
					<p className="text-muted-foreground text-xs">{sub}</p>
				) : null}
			</CardContent>
		</Card>
	);
}

function StatCardSkeleton(): React.JSX.Element {
	return (
		<Card className="border-border/80 shadow-none">
			<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
				<Skeleton className="h-4 w-32" />
				<Skeleton className="size-7 rounded-md" />
			</CardHeader>
			<CardContent className="space-y-2">
				<Skeleton className="h-7 w-16" />
				<Skeleton className="h-3 w-24" />
			</CardContent>
		</Card>
	);
}

export function StartupsStats(): React.JSX.Element {
	const { data, isPending } = trpc.organization.startup.stats.useQuery(
		undefined,
		{ staleTime: 30_000 },
	);

	if (isPending) {
		return (
			<div className="space-y-4">
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<StatCardSkeleton key={i} />
					))}
				</div>
			</div>
		);
	}

	if (!data || data.total === 0) {
		return <></>;
	}

	const outreached =
		data.byStatus.find((s) => s.status === PipelineStatus.OUTREACHED)?.count ??
		0;
	const avgPct = Math.round(data.avgConfidence * 100);

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<StatCard
					title="Total sourced"
					value={data.total.toLocaleString()}
					sub="All pipeline stages"
					icon={Radar}
				/>
				<StatCard
					title="Surfaced this week"
					value={data.thisWeek.toLocaleString()}
					sub="Last 7 days"
					icon={ArrowUpRight}
					accent="violet"
				/>
				<StatCard
					title="Avg confidence"
					value={`${avgPct}%`}
					sub="Z.ai thesis score"
					icon={Sparkles}
					accent="amber"
				/>
				<StatCard
					title="Outreached"
					value={outreached.toLocaleString()}
					sub="Intro sent by Shadow Partner"
					icon={Send}
					accent="emerald"
				/>
			</div>

			<div className="flex flex-wrap gap-x-6 gap-y-3">
				<div className="flex items-center gap-3">
					<span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
						Pipeline
					</span>
					<div className="flex items-center gap-2">
						{STATUS_ORDER.map((status) => {
							const count =
								data.byStatus.find((s) => s.status === status)?.count ?? 0;
							if (count === 0) return null;
							return (
								<span
									key={status}
									className="inline-flex items-center gap-1.5 text-xs text-foreground/80"
								>
									<span
										className={cn("size-2 rounded-full", STATUS_COLORS[status])}
									/>
									{STATUS_LABELS[status]}{" "}
									<span className="tabular-nums font-medium">{count}</span>
								</span>
							);
						})}
					</div>
				</div>

				{data.bySource.length > 0 ? (
					<div className="flex items-center gap-3">
						<span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
							Sources
						</span>
						<div className="flex items-center gap-2">
							{data.bySource
								.sort((a, b) => b.count - a.count)
								.map(({ source, count }) => (
									<span
										key={source}
										className="inline-flex items-center gap-1 text-xs text-foreground/80"
									>
										<SourceIcon source={source} />
										{SOURCE_LABELS[source]}{" "}
										<span className="tabular-nums font-medium">{count}</span>
									</span>
								))}
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}
