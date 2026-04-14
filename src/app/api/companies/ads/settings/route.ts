import { NextRequest, NextResponse } from "next/server";
import {
  getCompanyAdsSettingsService,
  updateCompanyAdsSettingsService,
} from "@/lib/services/companyAdsService";
import {
  companyAdsErrorResponse,
  getOrganizationIdFromRequest,
  requireCompanyAdsSession,
} from "../_lib";

export async function GET(request: NextRequest) {
  try {
    const session = await requireCompanyAdsSession(request);
    const organizationId = getOrganizationIdFromRequest(request);
    const settings = await getCompanyAdsSettingsService(session.user.id, organizationId);

    return NextResponse.json(settings);
  } catch (error) {
    return companyAdsErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireCompanyAdsSession(request);
    const organizationId = getOrganizationIdFromRequest(request);
    const body = await request.json();
    const organization = await updateCompanyAdsSettingsService(
      session.user.id,
      organizationId,
      body,
    );

    return NextResponse.json({ organization });
  } catch (error) {
    return companyAdsErrorResponse(error);
  }
}
