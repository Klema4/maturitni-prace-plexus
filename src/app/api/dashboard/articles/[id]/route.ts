import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getDashboardArticleService,
  updateDashboardArticleService,
} from "@/lib/services/dashboardArticlesService";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const { id } = await params;
    const article = await getDashboardArticleService(id);

    if (!article) {
      return NextResponse.json({ error: "Článek nenalezen" }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst článek" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const { id } = await params;
    const success = await updateDashboardArticleService(id, await request.json());

    if (!success) {
      return NextResponse.json(
        { error: "Nepodařilo se aktualizovat článek" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      { error: error?.message || "Nepodařilo se aktualizovat článek" },
      { status: 400 },
    );
  }
}
