import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getThreadComments, addComment } from "@/lib/services/commentsService";
import { getEffectivePermissionsForUser } from "@/lib/repositories/rolesRepository";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import {
   ThreadIdSchema,
   CreateCommentSchema,
} from "@/lib/schemas/commentsSchema";

type RouteParams = {
   params: Promise<{ threadId: string }>;
};

/**
 * GET /api/threads/[threadId]/comments
 * Získání komentářů pro thread
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
   try {
      const { threadId } = await params;

      // Validace threadId
      const validatedThreadId = ThreadIdSchema.safeParse(threadId);
      if (!validatedThreadId.success) {
         return NextResponse.json(
            { error: "Neplatný formát identifikátoru diskuze" },
            { status: 400 },
         );
      }

      const session = await auth.api.getSession({ headers: request.headers });
      const userId = session?.user?.id;
      const userPermissions = userId
         ? await getEffectivePermissionsForUser(userId)
         : BigInt(0);

      const searchParams = request.nextUrl.searchParams;
      const sortOrder = (searchParams.get("sortOrder") || "newest") as
         | "newest"
         | "oldest"
         | "best";
      const limit = parseInt(searchParams.get("limit") || "100");
      const offset = parseInt(searchParams.get("offset") || "0");
      const myComments = searchParams.get("myComments") === "true";

      if (myComments && !userId) {
         return NextResponse.json({ comments: [], canDeleteComments: false });
      }

      const includeHidden = userId
         ? hasPermission(
              userPermissions,
              PERMISSIONS.COMMENTS_VIEW | PERMISSIONS.COMMENTS_MODERATE,
           )
         : false;
      const canDeleteComments = hasPermission(
         userPermissions,
         PERMISSIONS.COMMENTS_DELETE,
      );

      const comments = await getThreadComments(validatedThreadId.data, {
         userId: myComments ? userId : undefined,
         sortOrder,
         limit,
         offset,
         includeHidden,
      });

      return NextResponse.json({ comments, canDeleteComments });
   } catch (error) {
      console.error("Error fetching comments:", error);
      return NextResponse.json(
         { error: "Nepodařilo se načíst komentáře" },
         { status: 500 },
      );
   }
}

/**
 * POST /api/threads/[threadId]/comments
 * Vytvoření nového komentáře
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
   try {
      const { threadId } = await params;

      // Validace threadId
      const validatedThreadId = ThreadIdSchema.safeParse(threadId);
      if (!validatedThreadId.success) {
         return NextResponse.json(
            { error: "Neplatný formát identifikátoru diskuze" },
            { status: 400 },
         );
      }

      const session = await auth.api.getSession({ headers: request.headers });

      if (!session?.user?.id) {
         return NextResponse.json(
            { error: "Pro přidání komentáře se musíte přihlásit" },
            { status: 401 },
         );
      }

      const body = await request.json();

      // Validace těla požadavku
      const validatedBody = CreateCommentSchema.safeParse(body);
      if (!validatedBody.success) {
         return NextResponse.json(
            { error: validatedBody.error.issues[0].message },
            { status: 400 },
         );
      }

      const { content, parentId } = validatedBody.data;

      const comment = await addComment(
         validatedThreadId.data,
         session.user.id,
         content,
         parentId,
      );

      return NextResponse.json({ comment }, { status: 201 });
   } catch (error: any) {
      console.error("Error creating comment:", error);
      return NextResponse.json(
         { error: error.message || "Nepodařilo se vytvořit komentář" },
         { status: 500 },
      );
   }
}
