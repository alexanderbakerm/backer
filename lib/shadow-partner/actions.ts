"use server";

import { getShadowPartnerDashboardMock } from "./mock-data";
import type { ShadowPartnerDashboardSnapshot } from "./types";

/**
 * Server actions for the Shadow Partner VC dashboard.
 * Swap implementations here when wiring real data sources.
 */
export async function getShadowPartnerDashboardData(): Promise<ShadowPartnerDashboardSnapshot> {
	return getShadowPartnerDashboardMock();
}
