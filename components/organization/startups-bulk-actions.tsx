"use client";

import NiceModal from "@ebay/nice-modal-react";
import { PipelineStatus } from "@prisma/client";
import type * as React from "react";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/confirmation-modal";
import {
	CsvDelimiterModal,
	type DelimiterType,
} from "@/components/csv-delimiter-modal";
import {
	type BulkActionItem,
	DataTableBulkActions,
	getSelectedRowIds,
} from "@/components/ui/custom/data-table";
import { capitalize, downloadCsv, downloadExcel } from "@/lib/utils";
import { trpc } from "@/trpc/client";

export type StartupsBulkActionsProps = {
	rowSelection: Record<string, boolean>;
	onClearSelection: () => void;
};

const pipelineLabels: Record<PipelineStatus, string> = {
	[PipelineStatus.SCANNED]: "Scanned",
	[PipelineStatus.EVALUATED]: "Evaluated",
	[PipelineStatus.QUEUED]: "Queued",
	[PipelineStatus.OUTREACHED]: "Outreached",
	[PipelineStatus.IGNORED]: "Ignored",
};

export function StartupsBulkActions({
	rowSelection,
	onClearSelection,
}: StartupsBulkActionsProps): React.JSX.Element {
	const utils = trpc.useUtils();

	const exportCsv = trpc.organization.startup.exportSelectedToCsv.useMutation();
	const exportExcel =
		trpc.organization.startup.exportSelectedToExcel.useMutation();
	const bulkDelete = trpc.organization.startup.bulkDelete.useMutation();
	const bulkUpdateStatus =
		trpc.organization.startup.bulkUpdateStatus.useMutation();

	const getDelimiterChar = (delimiterType: DelimiterType): string => {
		switch (delimiterType) {
			case "comma":
				return ",";
			case "semicolon":
				return ";";
			case "tab":
				return "\t";
			default:
				return ",";
		}
	};

	const handleExportSelectedToCsv = async (delimiter: DelimiterType) => {
		const startupIds = getSelectedRowIds(rowSelection);
		if (startupIds.length === 0) {
			toast.error("No startups selected.");
			return;
		}
		try {
			const csv = await exportCsv.mutateAsync({ startupIds });
			const delimiterChar = getDelimiterChar(delimiter);
			const csvData =
				delimiter === "comma" ? csv : csv.replace(/,/g, delimiterChar);
			downloadCsv(csvData, "startups.csv");
			toast.success("CSV exported.");
		} catch (_err) {
			toast.error("Failed to export CSV.");
		}
	};

	const handleExportSelectedToExcel = async () => {
		const startupIds = getSelectedRowIds(rowSelection);
		if (startupIds.length === 0) {
			toast.error("No startups selected.");
			return;
		}
		try {
			const base64 = await exportExcel.mutateAsync({ startupIds });
			downloadExcel(base64, "startups.xlsx");
			toast.success("Excel exported.");
		} catch (_err) {
			toast.error("Failed to export Excel.");
		}
	};

	const handleBulkDelete = () => {
		const ids = getSelectedRowIds(rowSelection);
		if (ids.length === 0) {
			toast.error("No startups selected.");
			return;
		}

		NiceModal.show(ConfirmationModal, {
			title: "Delete startups?",
			message: `Are you sure you want to delete ${ids.length} startup${ids.length > 1 ? "s" : ""}? This action cannot be undone.`,
			confirmLabel: "Delete",
			destructive: true,
			onConfirm: async () => {
				try {
					await bulkDelete.mutateAsync({ ids });
					toast.success(
						`${ids.length} startup${ids.length > 1 ? "s" : ""} deleted.`,
					);
					onClearSelection();
					utils.organization.startup.list.invalidate();
				} catch (_err) {
					toast.error("Failed to delete startups.");
				}
			},
		});
	};

	const handleBulkUpdateStatus = async (status: PipelineStatus) => {
		const ids = getSelectedRowIds(rowSelection);
		if (ids.length === 0) {
			toast.error("No startups selected.");
			return;
		}

		try {
			await bulkUpdateStatus.mutateAsync({ ids, status });
			toast.success(
				`${ids.length} startup${ids.length > 1 ? "s" : ""} updated to ${pipelineLabels[status] || capitalize(status)}.`,
			);
			onClearSelection();
			utils.organization.startup.list.invalidate();
		} catch (_err) {
			toast.error("Failed to update startups.");
		}
	};

	const statusActions: BulkActionItem[] = Object.values(PipelineStatus).map(
		(status) => ({
			label: `Set to ${pipelineLabels[status] || capitalize(status)}`,
			onClick: () => handleBulkUpdateStatus(status),
		}),
	);

	const actions: BulkActionItem[] = [
		{
			label: "Change pipeline status",
			actions: statusActions,
		},
		{
			label: "Export to CSV",
			separator: true,
			onClick: () => {
				NiceModal.show(CsvDelimiterModal, {
					onConfirm: handleExportSelectedToCsv,
				});
			},
		},
		{
			label: "Export to Excel",
			onClick: handleExportSelectedToExcel,
		},
		{
			label: "Delete",
			onClick: handleBulkDelete,
			variant: "destructive",
			separator: true,
		},
	];

	return <DataTableBulkActions actions={actions} rowSelection={rowSelection} />;
}
