import { CtaSection } from "@/components/marketing/sections/cta-section";
import { FaqSection } from "@/components/marketing/sections/faq-section";
import { FeaturesSection } from "@/components/marketing/sections/features-section";
import { HeroSection } from "@/components/marketing/sections/hero-section";
import { LogoCloudSection } from "@/components/marketing/sections/logo-cloud-section";
import { PricingSection } from "@/components/marketing/sections/pricing-section";
import { StatsSection } from "@/components/marketing/sections/stats-section";
import { TestimonialsSection } from "@/components/marketing/sections/testimonials-section";
import { appConfig } from "@/config/app.config";

function OrganizationJsonLd() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: appConfig.appName,
		description: appConfig.description,
		url: appConfig.baseUrl,
		logo: `${appConfig.baseUrl}/favicon.svg`,
		contactPoint: {
			"@type": "ContactPoint",
			email: appConfig.contact.email,
			telephone: appConfig.contact.phone,
			contactType: "customer service",
		},
		address: {
			"@type": "PostalAddress",
			streetAddress: appConfig.contact.address,
		},
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
		/>
	);
}

function WebSiteJsonLd() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: appConfig.appName,
		description: appConfig.description,
		url: appConfig.baseUrl,
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `${appConfig.baseUrl}/blog?q={search_term_string}`,
			},
			"query-input": "required name=search_term_string",
		},
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
		/>
	);
}

export default async function HomePage() {
	const faqContent = {
		headline: "Questions & Answers",
		items: [
			{
				question: "How do Shadow Partner and Founder Mode differ?",
				answer:
					"Shadow Partner ingests live founder signals for investors. Founder Mode reverses the engine to map funds, theses, and warm paths for outbound without spray-and-pray email.",
			},
			{
				question: "Do I need cloud LLMs to start?",
				answer:
					"Free and Pro tiers include local Ollama paths. Z.ai / GLM-5.1 reasoning layers unlock on higher allocations for deeper thesis scoring and drafting.",
			},
			{
				question: "Where does scraped data live?",
				answer:
					"Bright Data automations and advanced scouting protocols write into your isolated workspace. Secure sandboxed memory enforces dedupe so agents never re-contact the same prospect unknowingly.",
			},
			{
				question: "Can funds enforce compliance review?",
				answer:
					"Yes. Approvals, draft queues, and audit trails are built for GP review before anything hits your outbox or CRM.",
			},
			{
				question: "Is there a trial on Pro?",
				answer:
					"Pro includes a 14-day trial on eligible workspaces so teams can run a continuous Shadow Agent before committing.",
			},
		],
	};

	const ctaContent = {
		headline: "Ready to deploy your agents?",
		description:
			"Spin up local models, connect scrapers, and orchestrate fundraising on both sides of the table—starting free.",
		primaryCta: {
			text: "Build Scouter Agent",
			href: "/auth/sign-up",
		},
		secondaryCta: {
			text: "Talk to us",
			href: "/contact",
		},
	};

	return (
		<>
			<OrganizationJsonLd />
			<WebSiteJsonLd />
			<HeroSection />
			<LogoCloudSection />
			<FeaturesSection />
			<StatsSection />
			<TestimonialsSection />
			<FaqSection content={faqContent} />
			<PricingSection headline="Engine allocation that scales with your velocity." />
			<CtaSection content={ctaContent} />
		</>
	);
}
