import { NextRequest, NextResponse } from "next/server";
import { getCompanyAdsCalendarService } from "@/lib/services/companyAdsService";
import {
  companyAdsErrorResponse,
  getOrganizationIdFromRequest,
  requireCompanyAdsSession,
} from "../_lib";

export async function GET(request: NextRequest) {
  try {
    const session = await requireCompanyAdsSession(request);
    const organizationId = getOrganizationIdFromRequest(request);
    const rawRange = Number(request.nextUrl.searchParams.get("range") ?? 30);
    const rangeDays = [14, 30, 60, 90].includes(rawRange) ? rawRange : 30;
    const calendar = await getCompanyAdsCalendarService(
      session.user.id,
      organizationId,
      rangeDays,
    );

    return NextResponse.json(calendar);
  } catch (error) {
    return companyAdsErrorResponse(error);
  }
}
