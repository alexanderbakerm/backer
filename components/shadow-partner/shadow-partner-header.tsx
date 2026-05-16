"use client";

import { Pause, Play } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";

export type ShadowPartnerHeaderProps = {
	fundName: string;
	agentActive: boolean;
	onToggleAgent: () => void;
};

export function ShadowPartnerHeader({
	fundName,
	agentActive,
	onToggleAgent,
}: ShadowPartnerHeaderProps): React.JSX.Element {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<h1 className="font-heading text-2xl font-semibold tracking-tight">
					Shadow Partner
				</h1>
				<p className="text-muted-foreground mt-1 text-sm">
					Live deal sourcing for {fundName}
				</p>
			</div>
			<div className="flex flex-wrap items-center gap-3">
				<div
					className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
					role="status"
					aria-live="polite"
					aria-label={agentActive ? "Agent active" : "Agent paused"}
				>
					<span
						className={
							agentActive
								? "size-2 rounded-full bg-green-500"
								: "size-2 rounded-full bg-amber-500"
						}
						aria-hidden
					/>
					<span>{agentActive ? "Active" : "Paused"}</span>
				</div>
				<Button
					type="button"
					variant={agentActive ? "outline" : "default"}
					size="sm"
					onClick={onToggleAgent}
				>
					{agentActive ? (
						<>
							<Pause className="mr-1.5 size-4" aria-hidden />
							Pause
						</>
					) : (
						<>
							<Play className="mr-1.5 size-4" aria-hidden />
							Resume
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
