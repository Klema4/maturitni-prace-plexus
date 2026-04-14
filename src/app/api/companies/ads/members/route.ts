import { NextRequest, NextResponse } from "next/server";
import {
  removeCompanyAdsMemberService,
  updateCompanyAdsMemberRoleService,
  getCompanyAdsMembersService,
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
    const members = await getCompanyAdsMembersService(session.user.id, organizationId);

    return NextResponse.json(members);
  } catch (error) {
    return companyAdsErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireCompanyAdsSession(request);
    const organizationId = getOrganizationIdFromRequest(request);
    const body = await request.json();
    const members = await updateCompanyAdsMemberRoleService(
      session.user.id,
      organizationId,
      body,
    );

    return NextResponse.json(members);
  } catch (error) {
    return companyAdsErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireCompanyAdsSession(request);
    const organizationId = getOrganizationIdFromRequest(request);
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      throw new CompanyAdsValidationError("Chybí userId člena firmy");
    }

    const result = await removeCompanyAdsMemberService(
      session.user.id,
      organizationId,
      userId,
    );

    return NextResponse.json(result);
  } catch (error) {
    return companyAdsErrorResponse(error);
  }
}
