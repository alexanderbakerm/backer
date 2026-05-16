"use client";

import NiceModal from "@ebay/nice-modal-react";
import { PipelineStatus, SourceType } from "@prisma/client";
import type {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ExternalLink, FlaskConical, MoreHorizontalIcon, PlusIcon } from "lucide-react";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsJson,
	parseAsString,
	useQueryState,
} from "nuqs";
import * as React from "react";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { StartupsBulkActions } from "@/components/organization/startups-bulk-actions";
import {
	type StartupRow,
	StartupsModal,
} from "@/components/organization/startups-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	createSelectionColumn,
	DataTable,
	type FilterConfig,
	SortableColumnHeader,
} from "@/components/ui/custom/data-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTableSelection } from "@/hooks/use-table-selection";
import { capitalize, cn } from "@/lib/utils";
import { StartupSortField } from "@/schemas/organization-startup-schemas";
import { trpc } from "@/trpc/client";

const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_SORTING: SortingState = [{ id: "createdAt", desc: true }];

const pipelineBadge: Record<PipelineStatus, string> = {
	[PipelineStatus.SCANNED]:
		"bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
	[PipelineStatus.EVALUATED]:
		"bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200",
	[PipelineStatus.QUEUED]:
		"bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-200",
	[PipelineStatus.OUTREACHED]:
		"bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200",
	[PipelineStatus.IGNORED]: "bg-muted text-muted-foreground",
};

const sourceLabels: Record<SourceType, string> = {
	[SourceType.GITHUB]: "GitHub",
	[SourceType.PRODUCT_HUNT]: "Product Hunt",
	[SourceType.TWITTER]: "X / Twitter",
	[SourceType.OTHER]: "Other",
};

export function tableRowToModalStartup(row: StartupTableRow): StartupRow {
	return { ...row };
}

type StartupTableRow = {
	id: string;
	organizationId: string;
	name: string;
	founderName: string;
	founderLinkedIn: string | null;
	email: string;
	description: string | null;
	source: SourceType;
	sourceUrl: string | null;
	scrapedAt: Date;
	confidenceScore: number;
	thesisReasoning: string | null;
	status: PipelineStatus;
	draftedEmail: string | null;
	sentAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
};

export function StartupsTable(): React.JSX.Element {
	const [searchQuery, setSearchQuery] = useQueryState(
		"query",
		parseAsString.withDefault("").withOptions({ shallow: true }),
	);

	const [pageIndex, setPageIndex] = useQueryState(
		"pageIndex",
		parseAsInteger.withDefault(0).withOptions({ shallow: true }),
	);

	const [pageSize, setPageSize] = useQueryState(
		"pageSize",
		parseAsInteger.withDefault(DEFAULT_PAGE_SIZE).withOptions({
			shallow: true,
		}),
	);

	const [statusFilter, setStatusFilter] = useQueryState(
		"status",
		parseAsArrayOf(parseAsString).withDefault([]).withOptions({
			shallow: true,
		}),
	);

	const [sourceFilter, setSourceFilter] = useQueryState(
		"source",
		parseAsArrayOf(parseAsString).withDefault([]).withOptions({
			shallow: true,
		}),
	);

	const [createdAtFilter, setCreatedAtFilter] = useQueryState(
		"createdAt",
		parseAsArrayOf(parseAsString).withDefault([]).withOptions({
			shallow: true,
		}),
	);

	const [sorting, setSorting] = useQueryState<SortingState>(
		"sort",
		parseAsJson<SortingState>((value) => {
			if (!Array.isArray(value)) return DEFAULT_SORTING;
			return value.filter(
				(item) =>
					item &&
					typeof item === "object" &&
					"id" in item &&
					typeof item.desc === "boolean",
			) as SortingState;
		})
			.withDefault(DEFAULT_SORTING)
			.withOptions({ shallow: true }),
	);

	const utils = trpc.useUtils();

	const columnFilters: ColumnFiltersState = React.useMemo(() => {
		const filters: ColumnFiltersState = [];
		if (statusFilter?.length) {
			filters.push({ id: "status", value: statusFilter });
		}
		if (sourceFilter?.length) {
			filters.push({ id: "source", value: sourceFilter });
		}
		if (createdAtFilter?.length) {
			filters.push({ id: "createdAt", value: createdAtFilter });
		}
		return filters;
	}, [statusFilter, sourceFilter, createdAtFilter]);

	const handleFiltersChange = (filters: ColumnFiltersState): void => {
		const getFilterValue = (id: string): string[] => {
			const filter = filters.find((f) => f.id === id);
			return Array.isArray(filter?.value) ? (filter.value as string[]) : [];
		};

		setStatusFilter(getFilterValue("status"));
		setSourceFilter(getFilterValue("source"));
		setCreatedAtFilter(getFilterValue("createdAt"));

		if (pageIndex !== 0) {
			setPageIndex(0);
		}
	};

	const handleSortingChange = (newSorting: SortingState): void => {
		setSorting(newSorting.length > 0 ? newSorting : DEFAULT_SORTING);
		if (pageIndex !== 0) {
			setPageIndex(0);
		}
	};

	const sortParams = React.useMemo(() => {
		const fallbackSort = { id: "createdAt", desc: true } as const;
		const currentSort = sorting?.[0] ?? DEFAULT_SORTING[0] ?? fallbackSort;
		const sortBy = StartupSortField.options.includes(
			currentSort.id as StartupSortField,
		)
			? (currentSort.id as StartupSortField)
			: "createdAt";
		const sortOrder = currentSort.desc ? ("desc" as const) : ("asc" as const);
		return { sortBy, sortOrder };
	}, [sorting]);

	const { data, isPending } = trpc.organization.startup.list.useQuery(
		{
			limit: pageSize || DEFAULT_PAGE_SIZE,
			offset: (pageIndex || 0) * (pageSize || DEFAULT_PAGE_SIZE),
			query: searchQuery || "",
			sortBy: sortParams.sortBy,
			sortOrder: sortParams.sortOrder,
			filters: {
				status: (statusFilter || []) as PipelineStatus[],
				source: (sourceFilter || []) as SourceType[],
				createdAt: (createdAtFilter || []) as (
					| "today"
					| "this-week"
					| "this-month"
					| "older"
				)[],
			},
		},
		{
			placeholderData: (prev) => prev,
		},
	);

	const { rowSelection, setRowSelection, clearSelection, removeFromSelection } =
		useTableSelection({
			total: data?.total,
			pageIndex,
			pageSize,
			setPageIndex,
		});

	const deleteMutation = trpc.organization.startup.delete.useMutation({
		onSuccess: (_data, variables) => {
			toast.success("Startup deleted");
			removeFromSelection([variables.id]);
			utils.organization.startup.list.invalidate();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete");
		},
	});

	const handleSearchQueryChange = (value: string): void => {
		if (value !== searchQuery) {
			setSearchQuery(value);
			if (pageIndex !== 0) {
				setPageIndex(0);
			}
		}
	};

	const columns: ColumnDef<StartupTableRow>[] = [
		createSelectionColumn<StartupTableRow>(),
		{
			accessorKey: "name",
			header: ({ column }) => (
				<SortableColumnHeader column={column} title="Startup" />
			),
			cell: ({ row }) => (
				<div className="flex max-w-[220px] flex-col gap-0.5">
					<span
						className="truncate font-medium text-foreground"
						title={row.original.name}
					>
						{row.original.name}
					</span>
					<span className="truncate text-muted-foreground text-xs">
						{row.original.founderName}
					</span>
				</div>
			),
		},
		{
			accessorKey: "email",
			header: ({ column }) => (
				<SortableColumnHeader column={column} title="Email" />
			),
			cell: ({ row }) => (
				<span
					className="block max-w-[200px] truncate text-foreground/80"
					title={row.original.email}
				>
					{row.original.email}
				</span>
			),
		},
		{
			accessorKey: "source",
			header: ({ column }) => (
				<SortableColumnHeader column={column} title="Source" />
			),
			cell: ({ row }) => (
				<div className="flex items-center gap-1">
					<span className="text-foreground/80 text-sm">
						{sourceLabels[row.original.source]}
					</span>
					{row.original.sourceUrl ? (
						<a
							href={row.original.sourceUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline"
							aria-label="Open source link"
						>
							<ExternalLink className="size-3.5 shrink-0" />
						</a>
					) : null}
				</div>
			),
		},
		{
			accessorKey: "confidenceScore",
			header: ({ column }) => (
				<SortableColumnHeader column={column} title="Match" />
			),
			cell: ({ row }) => {
				const pct = row.original.confidenceScore * 100;
				return (
					<span
						className={cn(
							"font-semibold tabular-nums",
							pct >= 90
								? "text-emerald-600 dark:text-emerald-400"
								: pct >= 75
									? "text-orange-600 dark:text-orange-400"
									: "text-foreground",
						)}
					>
						{pct.toFixed(0)}%
					</span>
				);
			},
		},
		{
			accessorKey: "status",
			header: ({ column }) => (
				<SortableColumnHeader column={column} title="Pipeline" />
			),
			cell: ({ row }) => (
				<Badge
					className={cn(
						"border-none px-2 py-0.5 font-medium text-xs shadow-none",
						pipelineBadge[row.original.status],
					)}
					variant="outline"
				>
					{capitalize(row.original.status.replaceAll("_", " ").toLowerCase())}
				</Badge>
			),
		},
		{
			accessorKey: "scrapedAt",
			header: ({ column }) => (
				<SortableColumnHeader column={column} title="Scraped" />
			),
			cell: ({ row }) => (
				<span className="text-foreground/80 text-sm">
					{format(row.original.scrapedAt, "dd MMM yyyy")}
				</span>
			),
		},
		{
			id: "actions",
			enableSorting: false,
			cell: ({ row }) => (
				<div className="flex justify-end">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
								size="icon"
								variant="ghost"
							>
								<MoreHorizontalIcon className="shrink-0" />
								<span className="sr-only">Open menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={() =>
									NiceModal.show(StartupsModal, {
										startup: tableRowToModalStartup(row.original),
									})
								}
							>
								Edit
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => {
									NiceModal.show(ConfirmationModal, {
										title: "Delete startup?",
										message:
											"Remove this intelligence record? This cannot be undone.",
										confirmLabel: "Delete",
										destructive: true,
										onConfirm: () =>
											deleteMutation.mutate({ id: row.original.id }),
									});
								}}
								variant="destructive"
							>
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			),
		},
	];

	const startupFilters: FilterConfig[] = [
		{
			key: "status",
			title: "Pipeline",
			options: Object.values(PipelineStatus).map((status) => ({
				value: status,
				label: capitalize(status.replaceAll("_", " ").toLowerCase()),
			})),
		},
		{
			key: "source",
			title: "Source",
			options: Object.values(SourceType).map((source) => ({
				value: source,
				label: sourceLabels[source],
			})),
		},
		{
			key: "createdAt",
			title: "Created",
			options: [
				{ value: "today", label: "Today" },
				{ value: "this-week", label: "This week" },
				{ value: "this-month", label: "This month" },
				{ value: "older", label: "Older" },
			],
		},
	];

	const rows = (data?.startups ?? []) as StartupTableRow[];
	const isPlaceholder = data?.isPlaceholder ?? false;

	return (
		<div className="space-y-3">
			{isPlaceholder && (
				<div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-2.5 text-muted-foreground text-sm">
					<FlaskConical className="size-4 shrink-0 text-amber-500" />
					Sample data — connect Shadow Partner or add a startup manually to populate real records.
				</div>
			)}
		<DataTable
			columnFilters={columnFilters}
			columns={columns}
			data={rows}
			emptyMessage="No startups yet. Run Shadow Partner or add one manually."
			enableFilters
			enablePagination
			enableRowSelection
			enableSearch
			filters={startupFilters}
			loading={isPending}
			onFiltersChange={handleFiltersChange}
			onPageIndexChange={setPageIndex}
			onPageSizeChange={setPageSize}
			onRowSelectionChange={setRowSelection}
			onSearchQueryChange={handleSearchQueryChange}
			onSortingChange={handleSortingChange}
			pageIndex={pageIndex || 0}
			pageSize={pageSize || DEFAULT_PAGE_SIZE}
			getRowId={(row) => row.id}
			renderBulkActions={() => (
				<StartupsBulkActions
					rowSelection={rowSelection}
					onClearSelection={clearSelection}
				/>
			)}
			rowSelection={rowSelection}
			searchPlaceholder="Search startups, founders, thesis…"
			searchQuery={searchQuery || ""}
			defaultSorting={DEFAULT_SORTING}
			sorting={sorting}
			toolbarActions={
				<Button onClick={() => NiceModal.show(StartupsModal)} size="sm">
					<PlusIcon className="size-4 shrink-0" />
					Add startup
				</Button>
			}
			totalCount={data?.total ?? 0}
		/>
		</div>
	);
}
