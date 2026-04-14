import { NextRequest, NextResponse } from "next/server";
import { getCompanyAdsAnalyticsService } from "@/lib/services/companyAdsService";
import {
  companyAdsErrorResponse,
  getOrganizationIdFromRequest,
  requireCompanyAdsSession,
} from "../_lib";

export async function GET(request: NextRequest) {
  try {
    const session = await requireCompanyAdsSession(request);
    const organizationId = getOrganizationIdFromRequest(request);
    const analytics = await getCompanyAdsAnalyticsService(session.user.id, organizationId);

    return NextResponse.json(analytics);
  } catch (error) {
    return companyAdsErrorResponse(error);
  }
}
