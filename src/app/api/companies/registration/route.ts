import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
   ActiveOrganizationApplicationExistsError,
   submitOrganizationApplicationService,
} from "@/lib/services/adsService";
import { CreateOrganizationApplicationSchema } from "@/lib/schemas/organizationApplicationsSchema";

/**
 * POST /api/companies/registration
 * Odeslání žádosti o registraci firmy do reklamy sítě
 */
export async function POST(request: NextRequest) {
   try {
      const session = await auth.api.getSession({ headers: request.headers });

      if (!session?.user?.id) {
         return NextResponse.json(
            { error: "Nejste přihlášeni" },
            { status: 401 },
         );
      }

      const body = await request.json();
      const validatedBody = CreateOrganizationApplicationSchema.safeParse(body);

      if (!validatedBody.success) {
         return NextResponse.json(
            {
               error: "Neplatná data žádosti",
               details: validatedBody.error.issues,
            },
            { status: 400 },
         );
      }

      const application = await submitOrganizationApplicationService(
         session.user.id,
         validatedBody.data,
      );

      return NextResponse.json({ application }, { status: 201 });
   } catch (error: any) {
      if (error instanceof ActiveOrganizationApplicationExistsError) {
         return NextResponse.json(
            { error: "Aktivní žádost už existuje" },
            { status: 409 },
         );
      }

      console.error("Error creating company registration:", error);
      return NextResponse.json(
         { error: error?.message || "Nepodařilo se odeslat žádost" },
         { status: 400 },
      );
   }
}
