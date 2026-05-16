"use client";

import { ChevronRight } from "lucide-react";
import * as React from "react";
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { FunnelStage, VcLeadSource } from "@/lib/shadow-partner/types";

const SOURCE_READABLE: Record<VcLeadSource, string> = {
	github: "GitHub",
	"product-hunt": "Product Hunt",
	x: "X",
	crunchbase: "Crunchbase",
};

function conversionPct(from: number, to: number): string {
	if (from <= 0) {
		return "—";
	}
	return `${Math.round((100 * to) / from)}%`;
}

export type PipelineAndSourcesProps = {
	funnel: FunnelStage[];
	sourceBreakdown: { source: VcLeadSource; count: number; fillVar: string }[];
};

export function PipelineAndSources({
	funnel,
	sourceBreakdown,
}: PipelineAndSourcesProps): React.JSX.Element {
	const pieData = sourceBreakdown.map((s) => ({
		name: SOURCE_READABLE[s.source],
		value: s.count,
		fill: s.fillVar,
	}));

	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
			<Card className="lg:col-span-2">
				<CardHeader>
					<CardTitle>Pipeline Funnel</CardTitle>
					<CardDescription>
						Discovered through meeting — conversion between stages (last 30d
						mock).
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap items-stretch gap-2">
						{funnel.map((stage, i) => {
							const next = funnel[i + 1];
							return (
								<React.Fragment key={stage.key}>
									<div className="bg-muted/40 min-w-[100px] flex-1 rounded-lg border px-3 py-2">
										<div className="text-muted-foreground text-xs font-medium">
											{stage.label}
										</div>
										<div className="font-heading mt-1 text-xl font-semibold tabular-nums">
											{stage.count}
										</div>
										{next ? (
											<div className="text-muted-foreground mt-1 text-[11px]">
												→ {conversionPct(stage.count, next.count)} to{" "}
												{next.label}
											</div>
										) : null}
									</div>
									{i < funnel.length - 1 ? (
										<div
											className="text-muted-foreground flex items-center px-0.5"
											aria-hidden
										>
											<ChevronRight className="size-4" />
										</div>
									) : null}
								</React.Fragment>
							);
						})}
					</div>
				</CardContent>
			</Card>
			<Card className="lg:col-span-1">
				<CardHeader>
					<CardTitle>Source Breakdown</CardTitle>
					<CardDescription>Leads by discovery channel</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="h-[220px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={pieData}
									dataKey="value"
									nameKey="name"
									cx="50%"
									cy="50%"
									innerRadius={52}
									outerRadius={72}
									paddingAngle={2}
									isAnimationActive={false}
								>
									{pieData.map((entry) => (
										<Cell key={entry.name} fill={entry.fill} />
									))}
								</Pie>
								<Tooltip
									formatter={(value: number) => [value, "Leads"]}
									contentStyle={{ borderRadius: 8 }}
								/>
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
