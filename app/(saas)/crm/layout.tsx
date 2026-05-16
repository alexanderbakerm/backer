import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type * as React from "react";
import { OrganizationMenuItems } from "@/components/organization/organization-menu-items";
import { SidebarLayout } from "@/components/sidebar-layout";
import { getOrganizationById, getSession } from "@/lib/auth/server";
import { shouldRedirectToChoosePlan } from "@/lib/billing/guards";
import { OrganizationProviders } from "../dashboard/(sidebar)/organization/providers";

export type CrmLayoutProps = React.PropsWithChildren;

/**
 * CRM routes share the same org sidebar shell as /dashboard/organization/*.
 */
export default async function CrmLayout({
	children,
}: CrmLayoutProps): Promise<React.JSX.Element> {
	const session = await getSession();

	if (!session) {
		redirect("/auth/sign-in");
	}

	const activeOrganizationId = session.session.activeOrganizationId;
	if (!activeOrganizationId) {
		redirect("/dashboard");
	}

	const organization = await getOrganizationById(activeOrganizationId);
	if (!organization) {
		redirect("/dashboard");
	}

	const needsToChoosePlan = await shouldRedirectToChoosePlan(organization.id);
	if (needsToChoosePlan) {
		redirect("/dashboard/choose-plan");
	}

	const cookieStore = await cookies();

	return (
		<OrganizationProviders organization={organization}>
			<SidebarLayout
				defaultOpen={cookieStore.get("sidebar_state")?.value !== "false"}
				defaultWidth={cookieStore.get("sidebar_width")?.value}
				menuItems={<OrganizationMenuItems />}
			>
				{children}
			</SidebarLayout>
		</OrganizationProviders>
	);
}
