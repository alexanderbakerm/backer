"use client";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { UserAvatar } from "@/components/user/user-avatar";
import type {
	ShadowPartnerSourcedLead,
	VcLeadSource,
	VcLeadStatus,
} from "@/lib/shadow-partner/types";
import { cn } from "@/lib/utils";

const SOURCE_LABEL: Record<VcLeadSource, string> = {
	github: "GitHub",
	"product-hunt": "Product Hunt",
	x: "X",
	crunchbase: "Crunchbase",
};

const STATUS_LABEL: Record<VcLeadStatus, string> = {
	new: "New",
	researched: "Researched",
	drafted: "Drafted",
	approved: "Approved",
	sent: "Sent",
	replied: "Replied",
};

const FILTER_CHIPS: { key: "all" | VcLeadStatus; label: string }[] = [
	{ key: "all", label: "All" },
	{ key: "new", label: "New" },
	{ key: "researched", label: "Researched" },
	{ key: "drafted", label: "Drafted" },
	{ key: "approved", label: "Approved" },
	{ key: "sent", label: "Sent" },
	{ key: "replied", label: "Replied" },
];

function sourceBadgeVariant(
	source: VcLeadSource,
): React.ComponentProps<typeof Badge>["variant"] {
	switch (source) {
		case "github":
			return "default";
		case "product-hunt":
			return "secondary";
		case "x":
			return "outline";
		default:
			return "outline";
	}
}

function FitScoreRing({ score }: { score: number }): React.JSX.Element {
	const colorClass =
		score < 50
			? "stroke-destructive text-destructive"
			: score < 75
				? "stroke-[var(--chart-4)] text-amber-700 dark:text-amber-400"
				: "stroke-green-600 text-green-700 dark:stroke-green-500 dark:text-green-400";
	const r = 16;
	const c = 2 * Math.PI * r;
	const pct = Math.min(100, Math.max(0, score)) / 100;

	return (
		<div
			className="relative flex size-11 shrink-0 items-center justify-center"
			aria-label={`Thesis fit score ${score} out of 100`}
		>
			<svg viewBox="0 0 40 40" className="size-11 -rotate-90">
				<circle
					cx="20"
					cy="20"
					r={r}
					fill="none"
					className="stroke-muted"
					strokeWidth="4"
				/>
				<circle
					cx="20"
					cy="20"
					r={r}
					fill="none"
					className={cn("stroke-current", colorClass)}
					strokeWidth="4"
					strokeDasharray={`${c * pct} ${c}`}
					strokeLinecap="round"
				/>
			</svg>
			<span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold tabular-nums">
				{score}
			</span>
		</div>
	);
}

export type HotLeadsTableProps = {
	leads: ShadowPartnerSourcedLead[];
	onReviewDraft: (leadId: string) => void;
};

export function HotLeadsTable({
	leads,
	onReviewDraft,
}: HotLeadsTableProps): React.JSX.Element {
	const [statusFilter, setStatusFilter] = React.useState<"all" | VcLeadStatus>(
		"all",
	);
	const [sorting, setSorting] = React.useState<SortingState>([
		{ id: "fitScore", desc: true },
	]);

	const filtered = React.useMemo(() => {
		if (statusFilter === "all") {
			return leads;
		}
		return leads.filter((l) => l.status === statusFilter);
	}, [leads, statusFilter]);

	const columns = React.useMemo<ColumnDef<ShadowPartnerSourcedLead>[]>(
		() => [
			{
				id: "startup",
				header: "Startup",
				accessorFn: (row) => row.name,
				cell: ({ row }) => (
					<div className="flex min-w-[160px] items-start gap-2">
						<div
							className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md text-xs font-semibold"
							aria-hidden
						>
							{row.original.name.slice(0, 1)}
						</div>
						<div>
							<div className="font-medium leading-tight">
								{row.original.name}
							</div>
							<div className="text-muted-foreground line-clamp-2 text-xs">
								{row.original.tagline}
							</div>
						</div>
					</div>
				),
				enableSorting: false,
			},
			{
				id: "founders",
				header: "Founder(s)",
				accessorFn: (row) => row.founders[0]?.name ?? "",
				cell: ({ row }) => {
					const fs = row.original.founders;
					const primary = fs[0];
					if (!primary) {
						return "—";
					}
					return (
						<div className="flex min-w-[140px] items-center gap-2">
							<div className="flex -space-x-2">
								{fs.slice(0, 3).map((f) => (
									<UserAvatar
										key={f.id}
										className="size-7 border-2 border-background"
										name={f.name}
										src={f.avatarUrl}
									/>
								))}
							</div>
							<div>
								<div className="text-sm font-medium leading-tight">
									{primary.name}
								</div>
								<div className="text-muted-foreground text-xs">
									{primary.role}
								</div>
							</div>
						</div>
					);
				},
				enableSorting: false,
			},
			{
				accessorKey: "source",
				header: "Source",
				cell: ({ getValue }) => {
					const s = getValue() as VcLeadSource;
					return (
						<Badge variant={sourceBadgeVariant(s)} className="font-normal">
							{SOURCE_LABEL[s]}
						</Badge>
					);
				},
				enableSorting: false,
			},
			{
				accessorKey: "sector",
				header: "Sector",
				cell: ({ getValue }) => (
					<Badge variant="outline" className="font-normal capitalize">
						{String(getValue())}
					</Badge>
				),
				enableSorting: false,
			},
			{
				accessorKey: "fitScore",
				header: ({ column }) => (
					<Button
						type="button"
						variant="ghost"
						className="-ml-3 h-8 px-2"
						onClick={() => {
							column.toggleSorting(column.getIsSorted() === "asc");
						}}
					>
						Fit Score
						{column.getIsSorted() === "desc" ? (
							<ArrowDown className="ml-1 size-3" aria-hidden />
						) : column.getIsSorted() === "asc" ? (
							<ArrowUp className="ml-1 size-3" aria-hidden />
						) : (
							<ChevronsUpDown className="ml-1 size-3 opacity-50" aria-hidden />
						)}
					</Button>
				),
				cell: ({ row }) => <FitScoreRing score={row.original.fitScore} />,
			},
			{
				id: "signal",
				accessorFn: (row) => row.signal.velocity,
				header: ({ column }) => (
					<Button
						type="button"
						variant="ghost"
						className="-ml-3 h-8 px-2"
						onClick={() => {
							column.toggleSorting(column.getIsSorted() === "asc");
						}}
					>
						Signal
						{column.getIsSorted() === "desc" ? (
							<ArrowDown className="ml-1 size-3" aria-hidden />
						) : column.getIsSorted() === "asc" ? (
							<ArrowUp className="ml-1 size-3" aria-hidden />
						) : (
							<ChevronsUpDown className="ml-1 size-3 opacity-50" aria-hidden />
						)}
					</Button>
				),
				cell: ({ row }) => {
					const { metric, value, velocity } = row.original.signal;
					const up = velocity >= 0;
					return (
						<div className="text-sm tabular-nums">
							<span className="text-muted-foreground">{metric}</span>{" "}
							<span className="font-medium">
								{value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
							</span>
							<span
								className={cn(
									"ml-1 inline-flex items-center gap-0.5 text-xs",
									up
										? "text-green-600 dark:text-green-400"
										: "text-destructive",
								)}
								aria-label={up ? "Velocity up" : "Velocity down"}
							>
								{up ? (
									<ArrowUp className="size-3" aria-hidden />
								) : (
									<ArrowDown className="size-3" aria-hidden />
								)}
								{Math.abs(velocity)}
							</span>
						</div>
					);
				},
			},
			{
				accessorKey: "discoveredAt",
				header: ({ column }) => (
					<Button
						type="button"
						variant="ghost"
						className="-ml-3 h-8 px-2"
						onClick={() => {
							column.toggleSorting(column.getIsSorted() === "asc");
						}}
					>
						Discovered
						{column.getIsSorted() === "desc" ? (
							<ArrowDown className="ml-1 size-3" aria-hidden />
						) : column.getIsSorted() === "asc" ? (
							<ArrowUp className="ml-1 size-3" aria-hidden />
						) : (
							<ChevronsUpDown className="ml-1 size-3 opacity-50" aria-hidden />
						)}
					</Button>
				),
				sortingFn: (rowA, rowB, columnId) => {
					const da = new Date(rowA.getValue(columnId) as string).getTime();
					const db = new Date(rowB.getValue(columnId) as string).getTime();
					return da - db;
				},
				cell: ({ row }) =>
					formatDistanceToNow(new Date(row.original.discoveredAt), {
						addSuffix: true,
					}),
			},
			{
				accessorKey: "status",
				header: "Status",
				cell: ({ row }) => (
					<Badge variant="secondary" className="font-normal capitalize">
						{STATUS_LABEL[row.original.status]}
					</Badge>
				),
				enableSorting: false,
			},
			{
				id: "actions",
				header: "Actions",
				cell: ({ row }) => (
					<Button
						type="button"
						size="sm"
						variant="outline"
						onClick={() => {
							onReviewDraft(row.original.id);
						}}
					>
						Review Draft
					</Button>
				),
				enableSorting: false,
			},
		],
		[onReviewDraft],
	);

	const table = useReactTable({
		data: filtered,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: { pagination: { pageSize: 10 } },
	});

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<CardTitle>Hot Leads</CardTitle>
						<CardDescription>
							Sort by fit, discovery time, or signal velocity. Filter pipeline
							stage.
						</CardDescription>
					</div>
				</div>
				<div
					className="flex flex-wrap gap-2 pt-2"
					role="group"
					aria-label="Filter by status"
				>
					{FILTER_CHIPS.map((chip) => (
						<Button
							key={chip.key}
							type="button"
							size="sm"
							variant={statusFilter === chip.key ? "default" : "outline"}
							className="h-8 rounded-full"
							onClick={() => {
								setStatusFilter(chip.key);
								table.setPageIndex(0);
							}}
						>
							{chip.label}
						</Button>
					))}
				</div>
			</CardHeader>
			<CardContent>
				<div className="-mx-6 overflow-x-auto px-6">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((hg) => (
								<TableRow key={hg.id}>
									{hg.headers.map((header) => (
										<TableHead key={header.id} className="whitespace-nowrap">
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="text-muted-foreground h-24 text-center"
									>
										No leads for this filter.
									</TableCell>
								</TableRow>
							) : (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										className="focus-within:bg-muted/50"
										tabIndex={0}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												onReviewDraft(row.original.id);
											}
										}}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id} className="align-middle">
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
				<div className="mt-4 flex flex-wrap items-center justify-between gap-2">
					<p className="text-muted-foreground text-sm">
						Page {table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount() || 1}
					</p>
					<div className="flex gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={!table.getCanPreviousPage()}
							onClick={() => {
								table.previousPage();
							}}
						>
							Previous
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={!table.getCanNextPage()}
							onClick={() => {
								table.nextPage();
							}}
						>
							Next
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
