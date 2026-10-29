import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Keyword from "@/models/employee/seoEmployee/Keyword";
import SeoSheet from "@/models/employee/seoEmployee/SeoSheet";
import Customer from "@/models/admin/Customer";
import { getAuthUser } from "@/lib/getAuthUser";
import { sendKeywordMail } from "@/lib/mail/keywordMailer";

export async function POST(req) {
  try {
    await connectDB();
    const { projectId, clientId, keyword, type } = await req.json();

    const newKeyword = await Keyword.create({ keyword, type, projectId });

    await SeoSheet.findOneAndUpdate(
      { clientId },
      { $addToSet: { keywords: newKeyword._id } },
      { upsert: true, new: true },
    );

    // ── FIRE KEYWORD MAIL (non-blocking, never breaks the response) ──
    try {
      const authUser = await getAuthUser(req);
      const [actorUser, clientDoc] = await Promise.all([
        authUser?._id
          ? (await import("@/models/admin/User")).default
              .findById(authUser._id)
              .select("username email")
              .lean()
          : null,
        Customer.findById(clientId).select("name company").lean(),
      ]);

      const origin =
        req.headers.get("origin") ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "";
      const link = origin
        ? `${origin}/dashboard/employee/seo-sheet/${clientId}`
        : undefined;

      await sendKeywordMail({
        action: "created",
        keywordDoc: newKeyword,
        actorUser: actorUser || {},
        clientDoc: clientDoc || {},
        link,
      });
    } catch (mailErr) {
      console.error("[create-keyword] mail hook error:", mailErr);
    }
    // ──────────────────────────────────────────────────────────────

    return NextResponse.json(
      { success: true, message: "Keyword created", data: newKeyword },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
