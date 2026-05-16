"use client";

import { formatDistanceToNow } from "date-fns";
import { ChevronRight } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { UserAvatar } from "@/components/user/user-avatar";
import type {
	ContactedLead,
	ContactThreadStatus,
} from "@/lib/shadow-partner/types";
import { cn } from "@/lib/utils";

const THREAD_LABEL: Record<ContactThreadStatus, string> = {
	"no-reply": "No reply",
	replied: "Replied",
	meeting: "Meeting booked",
};

function threadBadgeClass(status: ContactThreadStatus): string {
	switch (status) {
		case "meeting":
			return "border-green-600/30 bg-green-500/10 text-green-700 dark:text-green-400";
		case "replied":
			return "border-sky-600/30 bg-sky-500/10 text-sky-800 dark:text-sky-300";
		default:
			return "";
	}
}

export type RecentlyContactedProps = {
	contacted: ContactedLead[];
};

export function RecentlyContacted({
	contacted,
}: RecentlyContactedProps): React.JSX.Element {
	const [open, setOpen] = React.useState(true);

	return (
		<Collapsible open={open} onOpenChange={setOpen}>
			<Card>
				<CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
					<div>
						<CardTitle>Recently Contacted</CardTitle>
						<CardDescription>
							Last outbound touches — deduped agent memory
						</CardDescription>
					</div>
					<CollapsibleTrigger asChild>
						<Button type="button" variant="ghost" size="sm" className="gap-1">
							{open ? "Collapse" : "Expand"}
							<ChevronRight
								className={cn(
									"size-4 transition-transform",
									open && "rotate-90",
								)}
							/>
						</Button>
					</CollapsibleTrigger>
				</CardHeader>
				<CollapsibleContent>
					<CardContent className="pt-0">
						<ul className="divide-y rounded-lg border">
							{contacted.map((c) => (
								<li
									key={c.id}
									className="flex flex-wrap items-center gap-3 px-3 py-2.5"
								>
									<UserAvatar
										className="size-9"
										name={c.founderName}
										src={undefined}
									/>
									<div className="min-w-0 flex-1">
										<div className="truncate text-sm font-medium">
											{c.founderName}
										</div>
										<div className="text-muted-foreground truncate text-xs">
											{c.startupName}
										</div>
									</div>
									<div className="text-muted-foreground text-xs whitespace-nowrap">
										{formatDistanceToNow(new Date(c.contactedAt), {
											addSuffix: true,
										})}
									</div>
									<Badge
										variant="outline"
										className={cn(
											"shrink-0 font-normal",
											threadBadgeClass(c.threadStatus),
										)}
									>
										{THREAD_LABEL[c.threadStatus]}
									</Badge>
								</li>
							))}
						</ul>
					</CardContent>
					<CardFooter className="text-muted-foreground border-t pt-4 text-xs">
						Tracked with deduped memory — no duplicate outreach.
					</CardFooter>
				</CollapsibleContent>
			</Card>
		</Collapsible>
	);
}
