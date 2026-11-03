// app/api/customer/work/seo-sheet/create-keyword/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Keyword from "@/models/employee/seoEmployee/Keyword";
import SeoSheet from "@/models/employee/seoEmployee/SeoSheet";
import Customer from "@/models/admin/Customer";
import { getAuthUser } from "@/lib/getAuthUser";
import { sendKeywordMail } from "@/lib/mail/keywordMailer";
import { findDuplicateKeyword, normalizeKeywordText } from "@/lib/seo/keyword";

export async function POST(req) {
  try {
    await connectDB();
    const { projectId, clientId, keyword, type } = await req.json();

    const cleanKeyword = normalizeKeywordText(keyword);
    if (!cleanKeyword) {
      return NextResponse.json(
        { success: false, message: "Please enter a keyword" },
        { status: 400 },
      );
    }

    // Duplicate check (case/spacing-insensitive): a keyword already added
    // for this client must not be added again, whoever adds it.
    const sheet = clientId
      ? await SeoSheet.findOne({ clientId }).select("keywords").lean()
      : null;

    const existingKeywords = sheet?.keywords?.length
      ? await Keyword.find({ _id: { $in: sheet.keywords } })
          .select("keyword")
          .lean()
      : projectId
        ? await Keyword.find({ projectId }).select("keyword").lean()
        : [];

    const duplicate = findDuplicateKeyword(existingKeywords, cleanKeyword);
    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: `Keyword "${duplicate.keyword}" already exists for this client`,
        },
        { status: 409 },
      );
    }

    const newKeyword = await Keyword.create({
      keyword: cleanKeyword,
      type,
      projectId,
    });

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
        req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "";
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
