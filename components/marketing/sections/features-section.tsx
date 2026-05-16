"use client";

import Image from "next/image";
import type * as React from "react";
import { cn } from "@/lib/utils";

type PerspectiveCard = {
	imageSrc: string;
	imageAlt: string;
	heading: string;
	description: string;
	imageWidth: number;
	imageHeight: number;
};

function PerspectiveFeatureCard({
	card,
}: {
	card: PerspectiveCard;
}): React.JSX.Element {
	return (
		<article
			className={cn(
				"flex flex-col overflow-hidden rounded-xl border border-marketing-border",
				"bg-marketing-card shadow-sm",
			)}
		>
			<div
				className={cn(
					"relative w-full overflow-hidden rounded-t-xl",
					"bg-marketing-bg-elevated",
				)}
			>
				<Image
					src={card.imageSrc}
					alt={card.imageAlt}
					width={card.imageWidth}
					height={card.imageHeight}
					className={cn(
						"object-cover object-top",
						"h-[320px] w-full rounded-t-xl",
						"border-b border-zinc-200 dark:border-zinc-700/60",
					)}
					sizes="(min-width: 768px) 50vw, 100vw"
				/>
			</div>

			<div className="flex flex-col gap-4 p-6 sm:p-8">
				<h3
					className={cn(
						"text-pretty font-display text-xl font-semibold leading-tight tracking-tight",
						"text-marketing-fg sm:text-2xl",
					)}
				>
					{card.heading}
				</h3>
				<p className="text-sm leading-relaxed text-marketing-fg-muted text-pretty sm:text-base">
					{card.description}
				</p>
			</div>
		</article>
	);
}

const VC_CARD: PerspectiveCard = {
	imageSrc: "/marketing/snapshots/feature-shadow-partner-panel.png",
	imageAlt:
		"Shadow Partner dashboard: sidebar, multi-stage pipeline, stage totals, pipeline chart, top signals, and category breakdown.",
	imageWidth: 1536,
	imageHeight: 1024,
	heading: "VC Deal Sourcing & Autonomous Outreach",
	description:
		'An autonomous "Shadow Partner" that continuously monitors the web to discover breakout builders before they hit the open market. It dynamically cross-references talent profiles against your investment criteria using local language models, teeing up personalized outreach tracks for manual approval.',
};

const FOUNDER_CARD: PerspectiveCard = {
	imageSrc: "/marketing/snapshots/feature-investor-match-panel.png",
	imageAlt:
		"Investor Match grid: fund names, match percentages, thesis reasoning, and partner contacts.",
	imageWidth: 1024,
	imageHeight: 671,
	heading: "Founder Reverse-Sourcing & Targeted Fundraising",
	description:
		"A Founder Mode engine that maps high-conviction partners to your stage, sector, and narrative—surfacing thesis fit, sponsor paths, and outreach you can approve before a single note leaves your workspace. No spray-and-pray; only capital relationships worth owning.",
};

export function FeaturesSection() {
	return (
		<section id="features" className="py-16 scroll-mt-14">
			<div className="mx-auto flex max-w-2xl flex-col gap-10 px-6 md:max-w-3xl lg:max-w-7xl lg:gap-14 lg:px-10">
				<div className="flex max-w-2xl flex-col gap-3">
					<h2
						className={cn(
							"text-pretty font-display text-[2rem] leading-10 tracking-tight",
							"text-marketing-fg",
							"sm:text-4xl sm:leading-tight",
						)}
					>
						One platform. Two perspectives.
					</h2>
					<p className="text-base leading-relaxed text-marketing-fg-muted text-pretty">
						Backer gives investment teams and founders the same disciplined
						runtime—clear signals, isolated memory, and outreach that stays
						under your control.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-12 md:grid-cols-2">
					<PerspectiveFeatureCard card={VC_CARD} />
					<PerspectiveFeatureCard card={FOUNDER_CARD} />
				</div>
			</div>
		</section>
	);
}
