import { NextRequest, NextResponse } from "next/server";
import { acceptCompanyAdsInviteService } from "@/lib/services/companyAdsService";
import { companyAdsErrorResponse, requireCompanyAdsSession } from "../../_lib";

export async function POST(request: NextRequest) {
  try {
    const session = await requireCompanyAdsSession(request);
    const body = await request.json();
    const result = await acceptCompanyAdsInviteService(session.user.id, body?.token);

    return NextResponse.json(result);
  } catch (error) {
    return companyAdsErrorResponse(error);
  }
}
