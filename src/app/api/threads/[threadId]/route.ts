import { NextRequest, NextResponse } from "next/server";
import { getThread } from "@/lib/services/commentsService";
import { ThreadIdSchema } from "@/lib/schemas/commentsSchema";

type RouteParams = {
  params: Promise<{ threadId: string }>;
};

/**
 * GET /api/threads/[threadId]
 * Získání informací o threadu a článku
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { threadId } = await params;
    
    // Validace threadId
    const validatedThreadId = ThreadIdSchema.safeParse(threadId);
    if (!validatedThreadId.success) {
      return NextResponse.json(
        { error: "Neplatný formát identifikátoru diskuze" },
        { status: 400 }
      );
    }

    const thread = await getThread(validatedThreadId.data);

    if (!thread) {
      return NextResponse.json(
        { error: "Diskuze nebyla nalezena" },
        { status: 404 }
      );
    }

    return NextResponse.json({ thread });
  } catch (error) {
    console.error("Error fetching thread:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst diskuzi" },
      { status: 500 }
    );
  }
}
