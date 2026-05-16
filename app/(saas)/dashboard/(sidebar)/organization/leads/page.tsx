import { redirect } from "next/navigation";
import type * as React from "react";

/**
 * Legacy URL: generic leads lived here. Startups CRM is now at /crm/leads.
 */
export default function OrganizationLeadsRedirect(): React.JSX.Element {
	redirect("/crm/leads");
}
