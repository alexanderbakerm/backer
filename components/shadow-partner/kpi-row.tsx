"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { KpiMetric } from "@/lib/shadow-partner/types";
import { cn } from "@/lib/utils";
import { KpiSparkline } from "./kpi-sparkline";

export type KpiRowProps = {
	kpis: KpiMetric[];
};

function MetricFigure(props: { children: React.ReactNode }): React.JSX.Element {
	return (
		<div className="font-heading font-semibold text-2xl">{props.children}</div>
	);
}

export function KpiRow({ kpis }: KpiRowProps): React.JSX.Element {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
			{kpis.map((kpi) => (
				<Card key={kpi.id}>
					<CardHeader>
						<CardTitle className="flex flex-wrap items-center gap-2.5">
							<span>{kpi.label}</span>
							{kpi.deltaKind === "na" ? (
								<Badge variant="secondary" className="font-normal">
									n/a
								</Badge>
							) : (
								<span
									className={cn(
										"inline-flex items-center gap-0.5 text-xs font-normal",
										kpi.deltaUp
											? "text-green-600 dark:text-green-400"
											: "text-destructive",
									)}
								>
									{kpi.deltaUp ? (
										<ArrowUp className="size-3" aria-hidden />
									) : (
										<ArrowDown className="size-3" aria-hidden />
									)}
									{kpi.deltaText}
								</span>
							)}
						</CardTitle>
						<CardDescription>vs last 7 days</CardDescription>
						<div>
							<MetricFigure>{kpi.valueLabel}</MetricFigure>
						</div>
					</CardHeader>
					<CardContent>
						<KpiSparkline data={kpi.sparkline} accent={kpi.accent} />
					</CardContent>
				</Card>
			))}
		</div>
	);
}
