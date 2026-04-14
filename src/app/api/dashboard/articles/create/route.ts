import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createDashboardArticleService } from "@/lib/services/dashboardArticlesService";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste prihlaseni" }, { status: 401 });
    }

    const article = await createDashboardArticleService(
      session.user.id,
      await request.json(),
    );

    return NextResponse.json({ article }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating article:", error);

    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "Clanek s timto slugem jiz existuje" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: error?.message || "Nepodarilo se vytvorit clanek" },
      { status: 400 },
    );
  }
}
