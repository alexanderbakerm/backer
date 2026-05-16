"use client";

import { ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

function HeroScreenshot() {
	const alt =
		"Shadow Partner CRM: sidebar navigation, KPI cards, and live agent stream for deal sourcing.";
	return (
		<div
			className={cn(
				"flex w-full flex-col overflow-hidden rounded-xl border border-marketing-border",
				"bg-marketing-card shadow-sm",
			)}
		>
			<div
				className={cn(
					"relative w-full overflow-hidden border-b border-marketing-border",
					"bg-marketing-bg-elevated aspect-[1024/584]",
				)}
			>
				<Image
					src="/marketing/snapshots/hero-shadow-partner-crm.png"
					alt={alt}
					width={1024}
					height={584}
					className="size-full object-cover object-top"
					priority
					sizes="(min-width: 1024px) min(1280px, 90vw), 100vw"
				/>
			</div>
		</div>
	);
}

export function HeroSection() {
	return (
		<section id="hero" className="py-16 scroll-mt-14">
			<div className="mx-auto flex max-w-2xl flex-col gap-10 px-6 md:max-w-3xl lg:max-w-7xl lg:gap-14 lg:px-10">
				<div className="flex flex-col gap-10 lg:gap-14">
					<div className="flex flex-col items-start gap-6">
						{/* Announcement Pill */}
						<Link
							href="#features"
							className={cn(
								"relative inline-flex max-w-full items-center gap-3 overflow-hidden rounded-md px-3.5 py-2 text-sm",
								"bg-marketing-card",
								"hover:bg-marketing-card-hover",
								"dark:ring-inset dark:ring-1 dark:ring-white/5",
								"sm:flex-row sm:items-center sm:gap-3 sm:rounded-full sm:px-3 sm:py-0.5",
							)}
						>
							<span className="truncate text-pretty sm:truncate">
								✨ Introducing Shadow Partner & Founder Mode v2
							</span>
							<span className="hidden h-3 w-px bg-marketing-card-hover sm:block" />
							<span className="inline-flex shrink-0 items-center gap-1 font-semibold">
								Learn more
								<ChevronRightIcon className="size-3" />
							</span>
						</Link>

						{/* Headline */}
						<h1
							className={cn(
								"max-w-5xl text-balance font-display text-5xl tracking-display-tight",
								"text-marketing-fg",
								"sm:text-5xl sm:leading-14",
								"lg:text-[5rem] lg:leading-20",
							)}
						>
							Autonomous Deal Sourcing & Outreach. For Both Sides of the Table.
						</h1>

						{/* Description */}
						<div className="flex max-w-3xl flex-col gap-4 text-lg leading-8 text-marketing-fg-muted">
							<p>
								<span className="font-medium text-marketing-fg">Backer</span> is
								the first dual-sided AI agent platform running local LLMs and
								live web scrapers. VCs find breakout builders instantly.
								Founders discover and pitch high-conviction funds without the
								cold-outreach spam.
							</p>
						</div>

						{/* CTA */}
						<div className="flex items-center gap-4">
							<Link
								href="/auth/sign-up"
								className={cn(
									"inline-flex shrink-0 items-center justify-center gap-1 rounded-full px-4 py-2 text-sm font-medium",
									"bg-marketing-accent text-marketing-accent-fg hover:bg-marketing-accent-hover",
								)}
							>
								Build Scouter Agent
							</Link>
						</div>
					</div>

					<HeroScreenshot />
				</div>
			</div>
		</section>
	);
}
