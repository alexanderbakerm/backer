"use client";

import { nanoid } from "nanoid";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { STREAM_EVENT_TEMPLATES } from "@/lib/shadow-partner/mock-data";
import type { StreamEvent } from "@/lib/shadow-partner/types";
import { cn } from "@/lib/utils";

function usePrefersReducedMotion(): boolean {
	const [reduced, setReduced] = React.useState(false);

	React.useEffect(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		const apply = (): void => {
			setReduced(mq.matches);
		};
		apply();
		mq.addEventListener("change", apply);
		return () => {
			mq.removeEventListener("change", apply);
		};
	}, []);

	return reduced;
}

function toneClass(stepType: StreamEvent["stepType"]): string {
	switch (stepType) {
		case "discovered":
			return "border-l-teal-600 text-teal-700 dark:border-l-teal-500 dark:text-teal-400";
		case "scoring":
			return "border-l-[var(--chart-1)] text-orange-700 dark:text-orange-400";
		case "drafting":
			return "border-l-violet-600 text-violet-700 dark:border-l-violet-400 dark:text-violet-300";
		case "researching":
			return "border-l-sky-600 text-sky-700 dark:text-sky-400";
		default:
			return "border-l-border text-foreground";
	}
}

function formatTime(ts: number): string {
	const d = new Date(ts);
	return d.toLocaleTimeString(undefined, {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});
}

export type LiveAgentStreamProps = {
	initialEvents: StreamEvent[];
};

export function LiveAgentStream({
	initialEvents,
}: LiveAgentStreamProps): React.JSX.Element {
	const reducedMotion = usePrefersReducedMotion();
	const [paused, setPaused] = React.useState(false);
	const [events, setEvents] = React.useState<StreamEvent[]>(() =>
		[...initialEvents].sort((a, b) => b.ts - a.ts).slice(0, 20),
	);
	const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

	React.useEffect(() => {
		if (paused) {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
			return;
		}

		const tick = (): void => {
			const delay = 4000 + Math.floor(Math.random() * 2000);
			timerRef.current = setTimeout(() => {
				const ix = Math.floor(Math.random() * STREAM_EVENT_TEMPLATES.length);
				const template = STREAM_EVENT_TEMPLATES[ix] as Omit<
					StreamEvent,
					"id" | "ts"
				>;
				const next: StreamEvent = {
					id: nanoid(12),
					ts: Date.now(),
					...template,
				};
				setEvents((prev) => {
					const merged = [next, ...prev];
					return merged.slice(0, 20);
				});
				tick();
			}, delay);
		};

		tick();

		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [paused]);

	return (
		<Card>
			<CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
				<div>
					<CardTitle>Live Agent Stream</CardTitle>
					<CardDescription>
						Real-time trace across Bright Data, Z.ai, and Butterbase.
					</CardDescription>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => {
						setPaused((p) => !p);
					}}
					aria-pressed={paused}
				>
					{paused ? "Resume stream" : "Pause stream"}
				</Button>
			</CardHeader>
			<CardContent>
				<ul className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
					{events.map((ev, idx) => (
						<li
							key={ev.id}
							className={cn(
								"border-l-2 bg-muted/30 rounded-md border border-border px-3 py-2 text-sm",
								toneClass(ev.stepType),
								!reducedMotion &&
									idx === 0 &&
									"animate-in fade-in slide-in-from-top-1 duration-300",
							)}
						>
							<div className="text-muted-foreground flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
								<time dateTime={new Date(ev.ts).toISOString()}>
									{formatTime(ev.ts)}
								</time>
								<span aria-hidden>·</span>
								<span aria-label="Source">
									{ev.sourceEmoji} {ev.stepLabel}
								</span>
							</div>
							<p className="mt-0.5 text-foreground">{ev.detail}</p>
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}
