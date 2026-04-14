import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  CompanyAdsAccessError,
  CompanyAdsConflictError,
  CompanyAdsManageError,
  CompanyAdsNotFoundError,
  CompanyAdsUnauthorizedError,
  CompanyAdsValidationError,
} from "@/lib/services/companyAdsService";

export async function requireCompanyAdsSession(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    throw new CompanyAdsUnauthorizedError();
  }

  return session;
}

export function companyAdsErrorResponse(error: unknown) {
  if (error instanceof CompanyAdsUnauthorizedError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  if (error instanceof CompanyAdsAccessError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  if (error instanceof CompanyAdsManageError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  if (error instanceof CompanyAdsNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  if (error instanceof CompanyAdsConflictError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  if (error instanceof CompanyAdsValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    { error: "Nepodařilo se dokončit požadavek" },
    { status: 500 },
  );
}

export function getOrganizationIdFromRequest(request: NextRequest) {
  const organizationId = request.nextUrl.searchParams.get("organizationId");

  if (!organizationId) {
    throw new CompanyAdsValidationError("Chybí organizationId");
  }

  return organizationId;
}
