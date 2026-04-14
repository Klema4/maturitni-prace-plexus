import { NextRequest, NextResponse } from "next/server";
import {
  inviteCompanyAdsMemberService,
  CompanyAdsValidationError,
} from "@/lib/services/companyAdsService";
import { companyAdsErrorResponse, requireCompanyAdsSession } from "../_lib";

export async function POST(request: NextRequest) {
  try {
    const session = await requireCompanyAdsSession(request);
    const body = await request.json();

    if (!body?.organizationId) {
      throw new CompanyAdsValidationError("Chybí organizationId");
    }

    const invite = await inviteCompanyAdsMemberService(
      session.user.id,
      body.organizationId,
      body,
    );

    return NextResponse.json({ invite }, { status: 201 });
  } catch (error) {
    return companyAdsErrorResponse(error);
  }
}
