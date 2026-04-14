import { NextRequest, NextResponse } from "next/server";
import {
  createCompanyAdsCampaignService,
  deleteCompanyAdsCampaignService,
  listCompanyAdsCampaignsService,
  updateCompanyAdsCampaignService,
  CompanyAdsValidationError,
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
    const campaigns = await listCompanyAdsCampaignsService(session.user.id, organizationId);

    return NextResponse.json(campaigns);
  } catch (error) {
    return companyAdsErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireCompanyAdsSession(request);
    const organizationId = getOrganizationIdFromRequest(request);
    const body = await request.json();
    const campaign = await createCompanyAdsCampaignService(
      session.user.id,
      organizationId,
      body,
    );

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    return companyAdsErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireCompanyAdsSession(request);
    const organizationId = getOrganizationIdFromRequest(request);
    const body = await request.json();

    if (!body?.id) {
      throw new CompanyAdsValidationError("Chybí id kampaně");
    }

    const campaign = await updateCompanyAdsCampaignService(
      session.user.id,
      organizationId,
      body.id,
      body,
    );

    return NextResponse.json({ campaign });
  } catch (error) {
    return companyAdsErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireCompanyAdsSession(request);
    const organizationId = getOrganizationIdFromRequest(request);
    const campaignId = request.nextUrl.searchParams.get("id");

    if (!campaignId) {
      throw new CompanyAdsValidationError("Chybí id kampaně");
    }

    const result = await deleteCompanyAdsCampaignService(
      session.user.id,
      organizationId,
      campaignId,
    );

    return NextResponse.json(result);
  } catch (error) {
    return companyAdsErrorResponse(error);
  }
}
