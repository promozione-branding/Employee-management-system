// app/api/auth/me/route.js

import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";

export async function GET(req) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
  return NextResponse.json({ success: true, data: user });
}
