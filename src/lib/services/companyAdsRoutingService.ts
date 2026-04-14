import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  CompanyAdsAccessError,
  resolveCompanyAdsContextService,
} from "@/lib/services/companyAdsService";
import { buildCompanyAdsWorkspacePath } from "@/lib/utils/companyAdsRouting";

type ResolveCompanyAdsRedirectDestinationInput = {
  preferredOrganizationId?: string | null;
  targetPathname?: string;
};

export async function resolveCompanyAdsRedirectDestination({
  preferredOrganizationId,
  targetPathname = "/firmy/reklamy",
}: ResolveCompanyAdsRedirectDestinationInput = {}) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.user?.id) {
    return "/ads/auth";
  }

  try {
    const cookieStore = await cookies();
    const cookieOrganizationId =
      cookieStore.get("activeAdsOrganizationId")?.value ?? null;
    const context = await resolveCompanyAdsContextService(session.user.id, {
      preferredOrganizationId,
      cookieOrganizationId,
    });

    return buildCompanyAdsWorkspacePath(
      context.activeOrganization.id,
      targetPathname,
    );
  } catch (error) {
    if (error instanceof CompanyAdsAccessError) {
      return "/firmy/registrace";
    }

    throw error;
  }
}
