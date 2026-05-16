import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type * as React from "react";
import { ShadowPartnerDashboard } from "@/components/shadow-partner/shadow-partner-dashboard";
import {
	Page,
	PageBody,
	PageBreadcrumb,
	PageHeader,
	PagePrimaryBar,
} from "@/components/ui/custom/page";
import { getOrganizationById, getSession } from "@/lib/auth/server";
import { getShadowPartnerDashboardData } from "@/lib/shadow-partner/actions";

export const metadata: Metadata = {
	title: "Dashboard",
};

/**
 * Organization dashboard page.
 * The active organization is obtained from the session by the layout,
 * and TRPC procedures use protectedOrganizationProcedure which validates it.
 */
export default async function DashboardPage(): Promise<React.JSX.Element> {
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

	const shadowSnapshot = await getShadowPartnerDashboardData();

	return (
		<Page>
			<PageHeader>
				<PagePrimaryBar>
					<PageBreadcrumb
						segments={[
							{ label: "Home", href: "/dashboard" },
							{ label: organization.name, href: "/dashboard/organization" },
							{ label: "Dashboard" },
						]}
					/>
				</PagePrimaryBar>
			</PageHeader>
			<PageBody>
				<div className="p-4 sm:px-6 sm:pt-6 sm:pb-24">
					<div className="mx-auto w-full space-y-4">
						<ShadowPartnerDashboard snapshot={shadowSnapshot} />
					</div>
				</div>
			</PageBody>
		</Page>
	);
}
