import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type * as React from "react";
import { ShadowPartnerDashboard } from "@/components/crm/shadow-partner-dashboard";
import {
	Page,
	PageBody,
	PageBreadcrumb,
	PageHeader,
	PagePrimaryBar,
} from "@/components/ui/custom/page";
import { getOrganizationById, getSession } from "@/lib/auth/server";

export const metadata: Metadata = {
	title: "AI Shadow Partner",
};

export default async function ShadowPartnerPage(): Promise<React.JSX.Element> {
	const session = await getSession();
	if (!session?.session.activeOrganizationId) {
		redirect("/dashboard");
	}

	const organization = await getOrganizationById(
		session.session.activeOrganizationId,
	);
	if (!organization) {
		redirect("/dashboard");
	}

	return (
		<Page>
			<PageHeader>
				<PagePrimaryBar>
					<PageBreadcrumb
						segments={[
							{ label: "Home", href: "/dashboard" },
							{ label: organization.name, href: "/dashboard/organization" },
							{ label: "AI Shadow Partner" },
						]}
					/>
				</PagePrimaryBar>
			</PageHeader>
			<PageBody>
				<ShadowPartnerDashboard organizationName={organization.name} />
			</PageBody>
		</Page>
	);
}
