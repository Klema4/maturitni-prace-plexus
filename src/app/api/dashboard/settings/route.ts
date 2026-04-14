import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getDashboardSettingsService,
  updateDashboardSettingsService,
} from "@/lib/services/dashboardSettingsService";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const settings = await getDashboardSettingsService();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst nastavení" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const settings = await updateDashboardSettingsService(await request.json());
    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: error.message || "Nepodařilo se aktualizovat nastavení" },
      { status: 400 },
    );
  }
}
