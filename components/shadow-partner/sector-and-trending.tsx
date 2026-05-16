"use client";

import { TrendingUp } from "lucide-react";
import type * as React from "react";
import {
	Bar,
	BarChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { TrendingSignal } from "@/lib/shadow-partner/types";

export type SectorAndTrendingProps = {
	sectorDistribution: { sector: string; count: number }[];
	trendingSignals: TrendingSignal[];
};

export function SectorAndTrending({
	sectorDistribution,
	trendingSignals,
}: SectorAndTrendingProps): React.JSX.Element {
	const barData = sectorDistribution.map((s) => ({
		...s,
		label: s.sector,
	}));

	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Sector Distribution</CardTitle>
					<CardDescription>Pipeline tags grouped by theme</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="h-[200px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={barData}
								layout="vertical"
								margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
							>
								<XAxis type="number" hide />
								<YAxis
									type="category"
									dataKey="label"
									width={68}
									tick={{ fontSize: 12 }}
									axisLine={false}
									tickLine={false}
								/>
								<Tooltip
									formatter={(v: number) => [v, "Leads"]}
									contentStyle={{ borderRadius: 8 }}
								/>
								<Bar
									dataKey="count"
									fill="var(--chart-2)"
									radius={[0, 4, 4, 0]}
									isAnimationActive={false}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Trending Signals</CardTitle>
					<CardDescription>Spiking keywords (past 24h, mock)</CardDescription>
				</CardHeader>
				<CardContent>
					<ul className="space-y-3">
						{trendingSignals.map((t) => (
							<li
								key={t.phrase}
								className="flex items-center justify-between gap-3 text-sm"
							>
								<span className="font-medium capitalize">{t.phrase}</span>
								<span className="text-muted-foreground inline-flex items-center gap-1 tabular-nums">
									<TrendingUp className="size-3.5 text-green-600 dark:text-green-400" />
									+{t.growthPct}%
								</span>
							</li>
						))}
					</ul>
				</CardContent>
			</Card>
		</div>
	);
}
