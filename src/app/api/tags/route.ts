import { NextRequest, NextResponse } from "next/server";
import { getAllTags } from "@/lib/repositories/tagsRepository";

/**
 * GET /api/tags
 * Získání seznamu všech dostupných tagů (veřejný koncový bod)
 */
export async function GET(request: NextRequest) {
  try {
    const tags = await getAllTags();
    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst štítky" },
      { status: 500 }
    );
  }
}
