import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getAllCampaignsService,
  getCampaignByIdService,
  getActiveCampaignsService,
  getPlannedCampaignsService,
  getCampaignsByOrganizationIdService,
  createCampaignService,
  updateCampaignService,
  deleteCampaignService,
} from "@/lib/services/adsService";

/**
 * GET /api/dashboard/campaigns
 * Získání seznamu kampaní
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
    const type = searchParams.get("type") || "all";
    const id = searchParams.get("id");
    const organizationId = searchParams.get("organizationId");

    if (id) {
      const campaign = await getCampaignByIdService(id);
      if (!campaign) {
        return NextResponse.json(
          { error: "Kampaň nenalezena" },
          { status: 404 }
        );
      }
      return NextResponse.json({ campaign });
    }

    if (organizationId) {
      const campaigns = await getCampaignsByOrganizationIdService(organizationId);
      return NextResponse.json({ campaigns });
    }

    let campaigns;
    if (type === "active") {
      campaigns = await getActiveCampaignsService();
    } else if (type === "planned") {
      campaigns = await getPlannedCampaignsService();
    } else {
      campaigns = await getAllCampaignsService();
    }

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst kampaně" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dashboard/campaigns
 * Vytvoření nové kampaně
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
    const campaign = await createCampaignService(body);

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: error.message || "Nepodařilo se vytvořit kampaň" },
      { status: 400 }
    );
  }
}

/**
 * PATCH /api/dashboard/campaigns
 * Aktualizace kampaně
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
        { error: "Chybí id kampaně" },
        { status: 400 }
      );
    }

    const campaign = await updateCampaignService(id, data);

    if (!campaign) {
      return NextResponse.json(
        { error: "Kampaň nenalezena" },
        { status: 404 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error: any) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { error: error.message || "Nepodařilo se aktualizovat kampaň" },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/dashboard/campaigns
 * Smazání kampaně
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
    const campaignId = searchParams.get("id");

    if (!campaignId) {
      return NextResponse.json(
        { error: "Chybí id kampaně" },
        { status: 400 }
      );
    }

    const success = await deleteCampaignService(campaignId);

    if (!success) {
      return NextResponse.json(
        { error: "Nepodařilo se smazat kampaň" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { error: "Nepodařilo se smazat kampaň" },
      { status: 500 }
    );
  }
}
