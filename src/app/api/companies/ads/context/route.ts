import { NextRequest, NextResponse } from "next/server";
import { resolveCompanyAdsContextService } from "@/lib/services/companyAdsService";
import { companyAdsErrorResponse, requireCompanyAdsSession } from "../_lib";

export async function GET(request: NextRequest) {
  try {
    const session = await requireCompanyAdsSession(request);
    const preferredOrganizationId =
      request.nextUrl.searchParams.get("companyId") ??
      request.nextUrl.searchParams.get("company");
    const cookieOrganizationId = request.cookies.get("activeAdsOrganizationId")?.value ?? null;
    const context = await resolveCompanyAdsContextService(session.user.id, {
      preferredOrganizationId,
      cookieOrganizationId,
    });

    const response = NextResponse.json(context);
    response.cookies.set("activeAdsOrganizationId", context.activeOrganization.id, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    return companyAdsErrorResponse(error);
  }
}
