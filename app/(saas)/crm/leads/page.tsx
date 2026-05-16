import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type * as React from "react";
import { StartupsStats } from "@/components/organization/startups-stats";
import { StartupsTable } from "@/components/organization/startups-table";
import {
	Page,
	PageBody,
	PageBreadcrumb,
	PageContent,
	PageHeader,
	PagePrimaryBar,
} from "@/components/ui/custom/page";
import { getOrganizationById, getSession } from "@/lib/auth/server";

export const metadata: Metadata = {
	title: "Startups",
};

export default async function CrmStartupsPage(): Promise<React.JSX.Element> {
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
							{ label: "Startups" },
						]}
					/>
				</PagePrimaryBar>
			</PageHeader>
			<PageBody>
				<PageContent title="Startups intelligence">
					<p className="max-w-3xl text-muted-foreground text-sm leading-relaxed">
						Companies and founders surfaced by Shadow Partner (Bright Data,
						Z.ai). Records are scoped to{" "}
						<span className="font-medium text-foreground">
							{organization.name}
						</span>
						.
					</p>
					<StartupsStats />
					<StartupsTable />
				</PageContent>
			</PageBody>
		</Page>
	);
}
