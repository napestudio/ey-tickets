import { NextRequest, NextResponse } from "next/server";

import * as UserInvitation from "@/lib/api/user-invitations";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const id = formData.get("id") as string;
  const token = formData.get("t") as string;

  if (!id || !token) {
    console.error("Missing id or token");
    return NextResponse.json({ error: "Missing id or token" }, { status: 400 });
  }

  try {
    let i = await UserInvitation.getInvitationsById(id);
    if (new Date(i?.expiresAt!) > new Date()) {
      if (i?.token === token) {
        await UserInvitation.acceptInvitation(id);
        return NextResponse.redirect(
          new URL(`/ingresar/registro/${id}`, req.url),
          {
            status: 302,
          }
        );
      } else {
        return NextResponse.json({ error: "El token no coincide" });
      }
    } else {
      return NextResponse.json({ error: "La invitación expiró" });
    }
  } catch (error) {
    // Return a response when there is an error
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
