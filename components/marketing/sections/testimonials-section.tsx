"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface Testimonial {
	name: string;
	role: string;
	company: string;
	quote: string;
	avatar: string;
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
	return (
		<figure className="flex flex-col justify-between gap-10 rounded-md bg-marketing-card p-6 text-sm">
			<blockquote className="flex flex-col gap-4">
				<p>"{testimonial.quote}"</p>
			</blockquote>
			<figcaption className="flex items-center gap-4">
				<div className="flex size-12 overflow-hidden rounded-full outline -outline-offset-1 outline-black/5 dark:outline-white/5">
					<Image
						src={testimonial.avatar}
						alt={testimonial.name}
						width={160}
						height={160}
						className="size-full object-cover bg-white/75 dark:bg-black/75"
					/>
				</div>
				<div>
					<p className="font-semibold text-marketing-fg">{testimonial.name}</p>
					<p className="text-marketing-fg-muted">
						{testimonial.role} at {testimonial.company}
					</p>
				</div>
			</figcaption>
		</figure>
	);
}

export function TestimonialsSection() {
	const testimonials: Testimonial[] = [
		{
			name: "Sarah Chen",
			role: "General Partner",
			company: "VentureCap",
			quote:
				"Our Shadow Partner runs overnight sweeps—by morning we have scored lists, thesis notes, and drafts we actually want to send. It replaced three tools.",
			avatar: "/marketing/avatars/woman-44.jpg",
		},
		{
			name: "Marcus Johnson",
			role: "Founder",
			company: "InfraScale",
			quote:
				"Founder Mode turned crunching public portfolios into a prioritized intro map. We booked credible partner meetings without blasting another cold template.",
			avatar: "/marketing/avatars/man-32.jpg",
		},
		{
			name: "Emily Rodriguez",
			role: "Principal",
			company: "Atlas Ventures",
			quote:
				"Bright Data plus advanced scouting protocols mean we see live signals, not stale CSVs. Deal team finally trusts what the agent surfaces.",
			avatar: "/marketing/avatars/woman-68.jpg",
		},
		{
			name: "David Kim",
			role: "Co-founder & CEO",
			company: "CircuitMind",
			quote:
				"Local LLMs keep sensitive diligence notes in-house while Z.ai scores fit against our narrative. Fundraising feels choreographed, not chaotic.",
			avatar: "/marketing/avatars/man-75.jpg",
		},
		{
			name: "Priya Sharma",
			role: "Head of Platform",
			company: "Vertex Collective",
			quote:
				"Isolated state layers mean we never double-tap founders. Compliance loved the clear audit trail on who was contacted and why.",
			avatar: "/marketing/avatars/woman-26.jpg",
		},
		{
			name: "Alex Turner",
			role: "Angel Investor",
			company: "Riverfold Syndicate",
			quote:
				"I run lean. One autonomous loop replaces a junior analyst and a bloated outreach stack—without sounding like spam at scale.",
			avatar: "/marketing/avatars/man-46.jpg",
		},
	];

	return (
		<section id="testimonials" className="py-16">
			<div className="mx-auto flex max-w-2xl flex-col gap-10 px-6 md:max-w-3xl lg:max-w-7xl lg:gap-16 lg:px-10">
				{/* Header */}
				<div className="flex max-w-2xl flex-col gap-6">
					<div className="flex flex-col gap-2">
						<h2
							className={cn(
								"text-pretty font-display text-[2rem] leading-10 tracking-tight",
								"text-marketing-fg",
								"sm:text-5xl sm:leading-14",
							)}
						>
							What founders and investors tell us
						</h2>
					</div>
					<div className="text-base leading-7 text-marketing-fg-muted text-pretty">
						<p>
							Whether you deploy Shadow Partner for sourcing or Founder Mode for
							intros, teams stay in control while the agents handle the grind.
						</p>
					</div>
				</div>

				{/* Testimonials Grid */}
				<div>
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{testimonials.map((testimonial) => (
							<TestimonialCard
								key={testimonial.name}
								testimonial={testimonial}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
