import { NextRequest, NextResponse } from "next/server";
import { getCompanyAdsBillingService } from "@/lib/services/companyAdsService";
import {
  companyAdsErrorResponse,
  getOrganizationIdFromRequest,
  requireCompanyAdsSession,
} from "../_lib";

export async function GET(request: NextRequest) {
  try {
    const session = await requireCompanyAdsSession(request);
    const organizationId = getOrganizationIdFromRequest(request);
    const billing = await getCompanyAdsBillingService(session.user.id, organizationId);

    return NextResponse.json(billing);
  } catch (error) {
    return companyAdsErrorResponse(error);
  }
}
