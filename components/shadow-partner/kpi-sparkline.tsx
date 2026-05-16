"use client";

import * as React from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import type { KpiMetric } from "@/lib/shadow-partner/types";

const ACCENT: Record<KpiMetric["accent"], string> = {
	chart1: "var(--chart-1)",
	chart2: "var(--chart-2)",
	chart3: "var(--chart-3)",
};

export type KpiSparklineProps = {
	data: KpiMetric["sparkline"];
	accent: KpiMetric["accent"];
};

export function KpiSparkline({
	data,
	accent,
}: KpiSparklineProps): React.JSX.Element {
	const gid = React.useId().replace(/:/g, "");
	const color = ACCENT[accent];

	return (
		<div className="h-[60px] w-full">
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart
					data={data}
					margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
				>
					<defs>
						<linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor={color} stopOpacity={0.6} />
							<stop offset="100%" stopColor={color} stopOpacity={0} />
						</linearGradient>
					</defs>
					<Area
						type="monotone"
						dataKey="y"
						stroke={color}
						strokeWidth={1.5}
						fill={`url(#${gid})`}
						isAnimationActive={false}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
