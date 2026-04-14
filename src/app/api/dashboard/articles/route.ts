import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  deleteDashboardArticleService,
  listDashboardArticlesService,
  updateDashboardArticleStatusService,
} from "@/lib/services/dashboardArticlesService";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as
      | "draft"
      | "need_factcheck"
      | "need_read"
      | "published"
      | null;

    const result = await listDashboardArticlesService({
      status: status || undefined,
      limit: parseInt(searchParams.get("limit") || "50"),
      offset: parseInt(searchParams.get("offset") || "0"),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst články" },
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

    const body = await request.json();
    if (!body?.articleId || !body?.status) {
      return NextResponse.json(
        { error: "Chybí articleId nebo status" },
        { status: 400 },
      );
    }

    const validStatuses = ["draft", "need_factcheck", "need_read", "published"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Neplatný status" }, { status: 400 });
    }

    const success = await updateDashboardArticleStatusService({
      articleId: body.articleId,
      status: body.status,
    });

    if (!success) {
      return NextResponse.json(
        { error: "Nepodařilo se aktualizovat stav článku" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating article status:", error);
    return NextResponse.json(
      { error: "Nepodařilo se aktualizovat stav článku" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const articleId = new URL(request.url).searchParams.get("articleId");
    if (!articleId) {
      return NextResponse.json({ error: "Chybí articleId" }, { status: 400 });
    }

    const success = await deleteDashboardArticleService(articleId);
    if (!success) {
      return NextResponse.json(
        { error: "Nepodařilo se smazat článek" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { error: "Nepodařilo se smazat článek" },
      { status: 500 },
    );
  }
}
