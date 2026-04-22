import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";
import { getSafeImageSrc } from "@/lib/utils/image";

const UpdateImageSchema = z.object({
  imageUrl: z.string().min(1, "Chybí URL obrázku"),
});

/**
 * POST /api/user/update-image
 * Aktualizace obrázku uživatele
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
    const validatedData = UpdateImageSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const normalizedImageUrl = getSafeImageSrc(validatedData.data.imageUrl);
    if (!normalizedImageUrl) {
      return NextResponse.json(
        { error: "Neplatný nebo nepodporovaný formát URL obrázku" },
        { status: 400 }
      );
    }

    await db
      .update(users)
      .set({
        image: normalizedImageUrl,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(users.id, session.user.id),
          isNull(users.deletedAt)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating image:", error);
    return NextResponse.json(
      { error: "Nepodařilo se aktualizovat obrázek" },
      { status: 500 }
    );
  }
}
