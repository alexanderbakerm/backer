"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { ShadowPartnerSourcedLead } from "@/lib/shadow-partner/types";
import { cn } from "@/lib/utils";

export type ReviewDraftSheetProps = {
	lead: ShadowPartnerSourcedLead | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onApprove: (
		leadId: string,
		draft: { to: string; subject: string; body: string },
	) => void;
	onRegenerate: (
		leadId: string,
		draft: { to: string; subject: string; body: string },
	) => void;
};

function defaultDraft(lead: ShadowPartnerSourcedLead): {
	to: string;
	subject: string;
	body: string;
} {
	const primary = lead.founders[0];
	const guess = primary
		? `${primary.name.toLowerCase().replace(/\s+/g, ".")}@${lead.name.toLowerCase().replace(/\s+/g, "")}.com`
		: "founder@example.com";
	return {
		to: guess,
		subject: `Quick note on ${lead.name}`,
		body: `Hi${primary ? ` ${primary.name.split(" ")[0]}` : ""},\n\nWe’re tracking ${lead.name} closely — would love to compare notes when you have a moment.\n\n— Partner, ${""}`,
	};
}

export function ReviewDraftSheet({
	lead,
	open,
	onOpenChange,
	onApprove,
	onRegenerate,
}: ReviewDraftSheetProps): React.JSX.Element {
	const [to, setTo] = React.useState("");
	const [subject, setSubject] = React.useState("");
	const [body, setBody] = React.useState("");

	React.useEffect(() => {
		if (!lead) {
			return;
		}
		const d = lead.draft ?? defaultDraft(lead);
		setTo(d.to);
		setSubject(d.subject);
		setBody(d.body);
	}, [lead]);

	const primaryFounder = lead?.founders[0];

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
				side="right"
			>
				{lead ? (
					<>
						<SheetHeader className="space-y-1 border-b p-6 pb-4">
							<SheetTitle>Review Draft</SheetTitle>
							<SheetDescription>
								Approve to queue in Gmail via Butterbase (mock — local state
								only).
							</SheetDescription>
						</SheetHeader>
						<ScrollArea className="flex-1 px-6">
							<div className="space-y-6 py-6">
								<section className="flex gap-3">
									<div className="bg-muted flex size-14 shrink-0 items-center justify-center rounded-lg text-lg font-bold">
										{lead.name.slice(0, 1)}
									</div>
									<div className="min-w-0 flex-1 space-y-2">
										<div>
											<h3 className="font-semibold leading-tight">
												{lead.name}
											</h3>
											<p className="text-muted-foreground text-sm capitalize">
												{lead.sector}
											</p>
										</div>
										<div className="flex flex-wrap items-center gap-2">
											<span className="text-muted-foreground text-xs">Fit</span>
											<span className="font-heading text-xl font-semibold tabular-nums">
												{lead.fitScore}
											</span>
											<span className="text-muted-foreground text-xs">
												/ 100
											</span>
										</div>
										<dl className="text-muted-foreground grid grid-cols-3 gap-2 text-[11px]">
											<div>
												<dt className="font-medium text-foreground">
													Founder fit
												</dt>
												<dd>{lead.fitBreakdown.founder}</dd>
											</div>
											<div>
												<dt className="font-medium text-foreground">
													Market fit
												</dt>
												<dd>{lead.fitBreakdown.market}</dd>
											</div>
											<div>
												<dt className="font-medium text-foreground">
													Traction
												</dt>
												<dd>{lead.fitBreakdown.traction}</dd>
											</div>
										</dl>
									</div>
								</section>

								<section>
									<h4 className="mb-2 text-sm font-medium">Founder bio</h4>
									<p className="text-muted-foreground text-sm leading-relaxed">
										{primaryFounder?.bio ?? "No synthesized bio available."}
									</p>
								</section>

								<section className="space-y-3">
									<h4 className="text-sm font-medium">Draft email</h4>
									<div className="space-y-1.5">
										<Label htmlFor="draft-to">To</Label>
										<Textarea
											id="draft-to"
											rows={2}
											value={to}
											onChange={(e) => {
												setTo(e.target.value);
											}}
											className="min-h-[44px] resize-y"
										/>
									</div>
									<div className="space-y-1.5">
										<Label htmlFor="draft-subject">Subject</Label>
										<Textarea
											id="draft-subject"
											rows={2}
											value={subject}
											onChange={(e) => {
												setSubject(e.target.value);
											}}
											className="min-h-[44px] resize-y"
										/>
									</div>
									<div className="space-y-1.5">
										<Label htmlFor="draft-body">Body</Label>
										<Textarea
											id="draft-body"
											rows={10}
											value={body}
											onChange={(e) => {
												setBody(e.target.value);
											}}
											className="min-h-[200px] resize-y"
										/>
									</div>
								</section>
							</div>
						</ScrollArea>
						<SheetFooter className="mt-auto gap-2 border-t bg-background p-4 sm:flex-col sm:space-x-0">
							<Button
								type="button"
								className="w-full"
								onClick={() => {
									onApprove(lead.id, { to, subject, body });
									onOpenChange(false);
								}}
							>
								Approve & Queue
							</Button>
							<div className="flex w-full gap-2">
								<Button
									type="button"
									variant="secondary"
									className="flex-1"
									onClick={() => {
										const nextSubject = `${subject} (refined)`;
										const nextBody = `${body}\n\nP.S. Happy to tailor this further — our infra thesis is attached.`;
										setSubject(nextSubject);
										setBody(nextBody);
										onRegenerate(lead.id, {
											to,
											subject: nextSubject,
											body: nextBody,
										});
									}}
								>
									Regenerate
								</Button>
								<Button
									type="button"
									variant="ghost"
									className={cn("flex-1 text-muted-foreground")}
									onClick={() => {
										onOpenChange(false);
									}}
								>
									Skip
								</Button>
							</div>
						</SheetFooter>
					</>
				) : null}
			</SheetContent>
		</Sheet>
	);
}
