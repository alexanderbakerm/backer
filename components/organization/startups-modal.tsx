"use client";

import NiceModal, { type NiceModalHocProps } from "@ebay/nice-modal-react";
import { PipelineStatus, SourceType } from "@prisma/client";
import { format } from "date-fns";
import type * as React from "react";
import type { Control, FieldValues } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
	type EnhancedNiceModalHandler,
	useEnhancedModal,
} from "@/hooks/use-enhanced-modal";
import { useZodForm } from "@/hooks/use-zod-form";
import { capitalize } from "@/lib/utils";
import {
	createStartupSchema,
	updateStartupSchema,
} from "@/schemas/organization-startup-schemas";
import { trpc } from "@/trpc/client";

const sourceLabels: Record<SourceType, string> = {
	[SourceType.GITHUB]: "GitHub",
	[SourceType.PRODUCT_HUNT]: "Product Hunt",
	[SourceType.TWITTER]: "X / Twitter",
	[SourceType.OTHER]: "Other",
};

export type StartupRow = {
	id: string;
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
};

export type StartupsModalProps = NiceModalHocProps & {
	startup?: StartupRow;
};

function StartupFormFields({
	control,
	showScheduleFields,
}: {
	control: Control<FieldValues>;
	showScheduleFields: boolean;
}): React.JSX.Element {
	const nf = "name" as never;
	const fn = "founderName" as never;
	const em = "email" as never;
	const fl = "founderLinkedIn" as never;
	const desc = "description" as never;
	const src = "source" as never;
	const st = "status" as never;
	const su = "sourceUrl" as never;
	const cc = "confidenceScore" as never;
	const tr = "thesisReasoning" as never;
	const de = "draftedEmail" as never;
	const sa = "sentAt" as never;
	const sc = "scrapedAt" as never;
	return (
		<ScrollArea className="flex-1">
			<div className="space-y-4 px-6 py-4">
				<FormField
					control={control}
					name={nf}
					render={({ field }) => (
						<FormItem asChild>
							<Field>
								<FormLabel>Startup / project</FormLabel>
								<FormControl>
									<Input placeholder="NimbusForge" {...field} />
								</FormControl>
								<FormMessage />
							</Field>
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name={fn}
					render={({ field }) => (
						<FormItem asChild>
							<Field>
								<FormLabel>Founder name</FormLabel>
								<FormControl>
									<Input placeholder="Avery Kim" {...field} />
								</FormControl>
								<FormMessage />
							</Field>
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name={em}
					render={({ field }) => (
						<FormItem asChild>
							<Field>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										type="email"
										placeholder="founder@company.com"
										{...field}
										value={String(field.value ?? "")}
									/>
								</FormControl>
								<FormMessage />
							</Field>
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name={fl}
					render={({ field }) => (
						<FormItem asChild>
							<Field>
								<FormLabel>Founder LinkedIn (optional)</FormLabel>
								<FormControl>
									<Input
										placeholder="https://linkedin.com/in/…"
										{...field}
										value={String(field.value ?? "")}
									/>
								</FormControl>
								<FormMessage />
							</Field>
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name={desc}
					render={({ field }) => (
						<FormItem asChild>
							<Field>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Textarea
										className="min-h-[80px] resize-y"
										placeholder="One-liner, product, traction…"
										{...field}
										value={String(field.value ?? "")}
									/>
								</FormControl>
								<FormMessage />
							</Field>
						</FormItem>
					)}
				/>

				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={control}
						name={src}
						render={({ field }) => (
							<FormItem asChild>
								<Field>
									<FormLabel>Source</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={String(field.value)}
									>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Source" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{Object.values(SourceType).map((src) => (
												<SelectItem key={src} value={src}>
													{sourceLabels[src]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</Field>
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name={st}
						render={({ field }) => (
							<FormItem asChild>
								<Field>
									<FormLabel>Pipeline</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={String(field.value)}
									>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Status" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{Object.values(PipelineStatus).map((st) => (
												<SelectItem key={st} value={st}>
													{capitalize(st.replaceAll("_", " ").toLowerCase())}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</Field>
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={control}
					name={su}
					render={({ field }) => (
						<FormItem asChild>
							<Field>
								<FormLabel>Source URL</FormLabel>
								<FormControl>
									<Input
										placeholder="Repo, PH launch, or post URL"
										{...field}
										value={String(field.value ?? "")}
									/>
								</FormControl>
								<FormMessage />
							</Field>
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name={cc}
					render={({ field }) => (
						<FormItem asChild>
							<Field>
								<FormLabel>Confidence (0–1)</FormLabel>
								<FormControl>
									<Input
										type="number"
										step="0.01"
										min={0}
										max={1}
										{...field}
										value={field.value as number}
										onChange={(e) =>
											field.onChange(
												e.target.value === "" ? 0 : Number(e.target.value),
											)
										}
									/>
								</FormControl>
								<FormMessage />
							</Field>
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name={tr}
					render={({ field }) => (
						<FormItem asChild>
							<Field>
								<FormLabel>Thesis reasoning (Z.ai / Ollama)</FormLabel>
								<FormControl>
									<Textarea
										className="min-h-[100px] resize-y"
										placeholder="Why this matches the fund thesis…"
										{...field}
										value={String(field.value ?? "")}
									/>
								</FormControl>
								<FormMessage />
							</Field>
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name={de}
					render={({ field }) => (
						<FormItem asChild>
							<Field>
								<FormLabel>Drafted email (Butterbase / Resend)</FormLabel>
								<FormControl>
									<Textarea
										className="min-h-[120px] resize-y font-mono text-xs"
										placeholder="Personalized outreach draft…"
										{...field}
										value={String(field.value ?? "")}
									/>
								</FormControl>
								<FormMessage />
							</Field>
						</FormItem>
					)}
				/>

				{showScheduleFields ? (
					<>
						<FormField
							control={control}
							name={sc}
							render={({ field }) => {
								const d = field.value as Date | undefined;
								return (
									<FormItem asChild>
										<Field>
											<FormLabel>Scraped at</FormLabel>
											<FormControl>
												<Input
													type="datetime-local"
													value={
														d ? format(new Date(d), "yyyy-MM-dd'T'HH:mm") : ""
													}
													onChange={(e) => {
														const v = e.target.value;
														field.onChange(v ? new Date(v) : undefined);
													}}
												/>
											</FormControl>
											<FormMessage />
										</Field>
									</FormItem>
								);
							}}
						/>
						<FormField
							control={control}
							name={sa}
							render={({ field }) => {
								const d = field.value as Date | null | undefined;
								return (
									<FormItem asChild>
										<Field>
											<FormLabel>Sent at (optional)</FormLabel>
											<FormControl>
												<Input
													type="datetime-local"
													value={
														d ? format(new Date(d), "yyyy-MM-dd'T'HH:mm") : ""
													}
													onChange={(e) => {
														const v = e.target.value;
														field.onChange(v ? new Date(v) : null);
													}}
												/>
											</FormControl>
											<FormMessage />
										</Field>
									</FormItem>
								);
							}}
						/>
					</>
				) : null}
			</div>
		</ScrollArea>
	);
}

function CreateStartupContent({
	modal,
}: {
	modal: EnhancedNiceModalHandler;
}): React.JSX.Element {
	const utils = trpc.useUtils();
	const form = useZodForm({
		schema: createStartupSchema,
		defaultValues: {
			name: "",
			founderName: "",
			founderLinkedIn: undefined,
			email: "",
			description: undefined,
			source: SourceType.OTHER,
			sourceUrl: undefined,
			confidenceScore: 0,
			thesisReasoning: undefined,
			status: PipelineStatus.SCANNED,
			draftedEmail: undefined,
			sentAt: null,
		},
	});

	const createMutation = trpc.organization.startup.create.useMutation({
		onSuccess: () => {
			toast.success("Startup created");
			utils.organization.startup.list.invalidate();
			modal.handleClose();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create startup");
		},
	});

	const onSubmit = form.handleSubmit((data) => {
		createMutation.mutate(data);
	});

	const isPending = createMutation.isPending;

	return (
		<Form {...form}>
			<form
				onSubmit={onSubmit}
				className="flex flex-1 flex-col overflow-hidden"
			>
				<StartupFormFields
					control={form.control as unknown as Control<FieldValues>}
					showScheduleFields={false}
				/>
				<SheetFooter className="flex-row justify-end gap-2 border-t">
					<Button
						type="button"
						variant="outline"
						onClick={modal.handleClose}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isPending} loading={isPending}>
						Create
					</Button>
				</SheetFooter>
			</form>
		</Form>
	);
}

function EditStartupContent({
	modal,
	startup,
}: {
	modal: EnhancedNiceModalHandler;
	startup: StartupRow;
}): React.JSX.Element {
	const utils = trpc.useUtils();
	const form = useZodForm({
		schema: updateStartupSchema,
		defaultValues: {
			id: startup.id,
			name: startup.name,
			founderName: startup.founderName,
			founderLinkedIn: startup.founderLinkedIn ?? "",
			email: startup.email,
			description: startup.description ?? "",
			source: startup.source,
			sourceUrl: startup.sourceUrl ?? "",
			scrapedAt: startup.scrapedAt,
			confidenceScore: startup.confidenceScore,
			thesisReasoning: startup.thesisReasoning ?? "",
			status: startup.status,
			draftedEmail: startup.draftedEmail ?? "",
			sentAt: startup.sentAt,
		},
	});

	const updateMutation = trpc.organization.startup.update.useMutation({
		onSuccess: () => {
			toast.success("Startup updated");
			utils.organization.startup.list.invalidate();
			modal.handleClose();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update startup");
		},
	});

	const onSubmit = form.handleSubmit((data) => {
		updateMutation.mutate(data);
	});

	const isPending = updateMutation.isPending;

	return (
		<Form {...form}>
			<form
				onSubmit={onSubmit}
				className="flex flex-1 flex-col overflow-hidden"
			>
				<StartupFormFields
					control={form.control as unknown as Control<FieldValues>}
					showScheduleFields
				/>
				<SheetFooter className="flex-row justify-end gap-2 border-t">
					<Button
						type="button"
						variant="outline"
						onClick={modal.handleClose}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isPending} loading={isPending}>
						Save
					</Button>
				</SheetFooter>
			</form>
		</Form>
	);
}

export const StartupsModal = NiceModal.create<StartupsModalProps>(
	({ startup }) => {
		const modal = useEnhancedModal();

		return (
			<Sheet
				open={modal.visible}
				onOpenChange={(open) => !open && modal.handleClose()}
			>
				<SheetContent
					className="sm:max-w-xl"
					onAnimationEndCapture={modal.handleAnimationEndCapture}
				>
					<SheetHeader>
						<SheetTitle>{startup ? "Edit startup" : "Add startup"}</SheetTitle>
						<SheetDescription className="sr-only">
							{startup
								? "Update intelligence record for this startup."
								: "Create a startup surfaced by Shadow Partner or manual entry."}
						</SheetDescription>
					</SheetHeader>

					{startup ? (
						<EditStartupContent modal={modal} startup={startup} />
					) : (
						<CreateStartupContent modal={modal} />
					)}
				</SheetContent>
			</Sheet>
		);
	},
);
