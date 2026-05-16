"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import {
	GitHubIcon,
	LinkedInIcon,
	XIcon,
} from "@/components/marketing/icons/social-icons";

const productLinks = [
	{ title: "Features", href: "/#features" },
	{ title: "Pricing", href: "/pricing" },
	{ title: "FAQ", href: "/#faq" },
] as const;

const socialLinks = [
	{ name: "X", href: "https://twitter.com", icon: XIcon },
	{ name: "GitHub", href: "https://github.com", icon: GitHubIcon },
	{ name: "LinkedIn", href: "https://linkedin.com", icon: LinkedInIcon },
];

function AppInfo() {
	return (
		<div className="flex max-w-md flex-col gap-3">
			<Logo withLabel={true} className="text-marketing-fg" />
			<div className="flex flex-col gap-4 text-marketing-fg-muted">
				<p className="text-pretty leading-relaxed">
					Autonomous dual-sided deal intelligence and high-signal outreach
					execution networks. Simplifying capital discovery for high-conviction
					founders and breakout investment teams.
				</p>
			</div>
		</div>
	);
}

export function Footer() {
	return (
		<footer className="pt-24" id="footer">
			<div className="bg-marketing-card/50 border-t border-marketing-border py-16">
				<div className="mx-auto flex max-w-7xl flex-col gap-16 px-6 lg:px-10">
					<div className="flex flex-col gap-12 text-sm lg:flex-row lg:items-start lg:justify-between lg:gap-16">
						<AppInfo />

						<nav className="flex flex-col gap-4 lg:items-end lg:text-right">
							<h3 className="font-semibold tracking-wider text-marketing-fg uppercase text-xs">
								Product
							</h3>
							<ul className="flex flex-col gap-3 lg:items-end">
								{productLinks.map((item) => (
									<li key={item.href}>
										<Link
											href={item.href}
											className="text-marketing-fg-muted hover:text-marketing-fg transition-colors duration-200"
										>
											{item.title}
										</Link>
									</li>
								))}
							</ul>
						</nav>
					</div>

					<div className="flex flex-col items-center justify-between gap-8 border-t border-marketing-border pt-8 sm:flex-row text-sm">
						<div className="text-marketing-fg-muted order-2 sm:order-1">
							© 2026 Backer. All rights reserved.
						</div>
						<div className="flex items-center gap-6 order-1 sm:order-2">
							{socialLinks.map((link) => (
								<Link
									key={link.name}
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={link.name}
									className="text-marketing-fg-muted hover:text-marketing-fg transition-all duration-200 hover:scale-110 active:scale-95 *:size-5"
								>
									<link.icon />
								</Link>
							))}
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
