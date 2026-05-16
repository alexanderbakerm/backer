"use client";

import * as React from "react";
import type { ShadowPartnerDashboardSnapshot } from "@/lib/shadow-partner/types";
import { HotLeadsTable } from "./hot-leads-table";
import { KpiRow } from "./kpi-row";
import { LiveAgentStream } from "./live-agent-stream";
import { PipelineAndSources } from "./pipeline-and-sources";
import { RecentlyContacted } from "./recently-contacted";
import { ReviewDraftSheet } from "./review-draft-sheet";
import { SectorAndTrending } from "./sector-and-trending";
import { ShadowPartnerHeader } from "./shadow-partner-header";

export type ShadowPartnerDashboardProps = {
	snapshot: ShadowPartnerDashboardSnapshot;
};

export function ShadowPartnerDashboard({
	snapshot,
}: ShadowPartnerDashboardProps): React.JSX.Element {
	const [agentActive, setAgentActive] = React.useState(true);
	const [leads, setLeads] = React.useState(snapshot.leads);
	const [sheetOpen, setSheetOpen] = React.useState(false);
	const [activeLeadId, setActiveLeadId] = React.useState<string | null>(null);

	const activeLead = React.useMemo(() => {
		if (!activeLeadId) {
			return null;
		}
		return leads.find((l) => l.id === activeLeadId) ?? null;
	}, [activeLeadId, leads]);

	const openReview = React.useCallback((leadId: string) => {
		setActiveLeadId(leadId);
		setSheetOpen(true);
	}, []);

	const handleApprove = React.useCallback(
		(leadId: string, draft: { to: string; subject: string; body: string }) => {
			setLeads((prev) =>
				prev.map((l) =>
					l.id === leadId ? { ...l, status: "approved", draft } : l,
				),
			);
		},
		[],
	);

	const handleRegenerate = React.useCallback(
		(leadId: string, draft: { to: string; subject: string; body: string }) => {
			setLeads((prev) =>
				prev.map((l) => (l.id === leadId ? { ...l, draft } : l)),
			);
		},
		[],
	);

	return (
		<div className="fade-in flex animate-in flex-col space-y-4 duration-500">
			<ShadowPartnerHeader
				fundName={snapshot.fundName}
				agentActive={agentActive}
				onToggleAgent={() => {
					setAgentActive((a) => !a);
				}}
			/>
			<KpiRow kpis={snapshot.kpis} />
			<LiveAgentStream initialEvents={snapshot.initialStream} />
			<HotLeadsTable leads={leads} onReviewDraft={openReview} />
			<PipelineAndSources
				funnel={snapshot.funnel}
				sourceBreakdown={snapshot.sourceBreakdown}
			/>
			<SectorAndTrending
				sectorDistribution={snapshot.sectorDistribution}
				trendingSignals={snapshot.trendingSignals}
			/>
			<RecentlyContacted contacted={snapshot.contacted} />
			<ReviewDraftSheet
				lead={activeLead}
				open={sheetOpen}
				onOpenChange={(o) => {
					setSheetOpen(o);
					if (!o) {
						setActiveLeadId(null);
					}
				}}
				onApprove={handleApprove}
				onRegenerate={handleRegenerate}
			/>
		</div>
	);
}
