import { NextRequest, NextResponse } from "next/server";
import { getCompanyAdsOverviewService } from "@/lib/services/companyAdsService";
import {
  companyAdsErrorResponse,
  getOrganizationIdFromRequest,
  requireCompanyAdsSession,
} from "../_lib";

export async function GET(request: NextRequest) {
  try {
    const session = await requireCompanyAdsSession(request);
    const organizationId = getOrganizationIdFromRequest(request);
    const overview = await getCompanyAdsOverviewService(session.user.id, organizationId);

    return NextResponse.json(overview);
  } catch (error) {
    return companyAdsErrorResponse(error);
  }
}
