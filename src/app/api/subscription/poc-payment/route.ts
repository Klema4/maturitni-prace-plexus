import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { processPocPaymentService } from "@/lib/services/subscriptionsService";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const body = await request.json();
    const result = await processPocPaymentService(session.user.id, body);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Nepodařilo se zpracovat PoC platbu" },
      { status: 400 }
    );
  }
}
