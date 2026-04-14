const COMPANY_ADS_STATIC_BASE_PATH = "/firmy/reklamy";

function normalizeCompanyAdsSuffix(targetPathname: string) {
  if (
    targetPathname === COMPANY_ADS_STATIC_BASE_PATH ||
    targetPathname === COMPANY_ADS_STATIC_BASE_PATH + "/"
  ) {
    return "";
  }

  if (targetPathname.startsWith(`${COMPANY_ADS_STATIC_BASE_PATH}/`)) {
    return targetPathname.slice(COMPANY_ADS_STATIC_BASE_PATH.length);
  }

  if (!targetPathname || targetPathname === "/") {
    return "";
  }

  return targetPathname.startsWith("/") ? targetPathname : `/${targetPathname}`;
}

export function buildCompanyAdsWorkspacePath(
  companyId: string,
  targetPathname: string = COMPANY_ADS_STATIC_BASE_PATH,
) {
  const suffix = normalizeCompanyAdsSuffix(targetPathname);
  return `/firmy/${companyId}/reklamy${suffix}`;
}

export function normalizeCompanyAdsWorkspacePathname(pathname: string) {
  const match = pathname.match(/^\/firmy\/[^/]+\/reklamy(\/.*)?$/);

  if (!match) {
    return pathname;
  }

  return `${COMPANY_ADS_STATIC_BASE_PATH}${match[1] ?? ""}`;
}
