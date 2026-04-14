import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getAllOrganizationsService,
  getOrganizationsWithCampaignCountService,
  getOrganizationByIdService,
  createOrganizationService,
  updateOrganizationService,
  deleteOrganizationService,
  searchOrganizationsService,
} from "@/lib/services/adsService";

/**
 * GET /api/dashboard/organizations
 * Získání seznamu organizací
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nejste přihlášeni" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const withCampaigns = searchParams.get("withCampaigns") === "true";
    const id = searchParams.get("id");
    const query = searchParams.get("query");

    if (id) {
      const organization = await getOrganizationByIdService(id);
      if (!organization) {
        return NextResponse.json(
          { error: "Organizace nenalezena" },
          { status: 404 }
        );
      }
      return NextResponse.json({ organization });
    }

    if (query) {
      const organizations = await searchOrganizationsService(query);
      return NextResponse.json({ organizations });
    }

    if (withCampaigns) {
      const organizations = await getOrganizationsWithCampaignCountService();
      return NextResponse.json({ organizations });
    }

    const organizations = await getAllOrganizationsService();
    return NextResponse.json({ organizations });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst organizace" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dashboard/organizations
 * Vytvoření nové organizace
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nejste přihlášeni" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const organization = await createOrganizationService(body);

    return NextResponse.json({ organization }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: error.message || "Nepodařilo se vytvořit organizaci" },
      { status: 400 }
    );
  }
}

/**
 * PATCH /api/dashboard/organizations
 * Aktualizace organizace
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nejste přihlášeni" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Chybí id organizace" },
        { status: 400 }
      );
    }

    const organization = await updateOrganizationService(id, data);

    if (!organization) {
      return NextResponse.json(
        { error: "Organizace nenalezena" },
        { status: 404 }
      );
    }

    return NextResponse.json({ organization });
  } catch (error: any) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { error: error.message || "Nepodařilo se aktualizovat organizaci" },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/dashboard/organizations
 * Smazání organizace
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nejste přihlášeni" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("id");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Chybí id organizace" },
        { status: 400 }
      );
    }

    const success = await deleteOrganizationService(organizationId);

    if (!success) {
      return NextResponse.json(
        { error: "Nepodařilo se smazat organizaci" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      { error: "Nepodařilo se smazat organizaci" },
      { status: 500 }
    );
  }
}
