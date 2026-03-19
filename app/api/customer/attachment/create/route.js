import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/getAuthUser";
import Attachment from "@/models/admin/Attachments";
import { sendAttachmentEmail } from "@/lib/email/sendAttachmentEmail";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      assetType,
      title,
      description,
      visibility,
      file,
      referenceLink,
      clientId,
      cc_email,
    } = body;

    // 🔒 Basic validation
    if (!assetType) {
      return NextResponse.json(
        { success: false, message: "assetType is required" },
        { status: 400 },
      );
    }

    // at least one of file or referenceLink required
    if (!file && !referenceLink) {
      return NextResponse.json(
        { success: false, message: "file or referenceLink is required" },
        { status: 400 },
      );
    }

    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // ✅ CLEAN cc_email (VERY IMPORTANT)
    const cleanEmails = Array.isArray(cc_email)
      ? cc_email
          .filter((e) => typeof e === "string" && e.trim())
          .map((e) => e.trim())
      : [];

    // 🆕 Create attachment
    const attachment = await Attachment.create({
      assetType,
      title,
      description,
      visibility,
      file,
      referenceLink,
      uploadedBy: authUser?._id,
      clientId,
      cc_email: cleanEmails,
    });

    // 📧 SEND EMAIL (non-blocking safe)
    if (cleanEmails.length > 0) {
      const html = `
        <h2>📎 New Attachment Uploaded</h2>
        <p><strong>Title:</strong> ${title || "N/A"}</p>
        <p><strong>Description:</strong> ${description || "N/A"}</p>
        <p><strong>Type:</strong> ${assetType}</p>
        ${
          referenceLink
            ? `<p><a href="${referenceLink}">View Attachment</a></p>`
            : ""
        }
      `;

      try {
        await sendAttachmentEmail({
          to: authUser?.email, // primary email
          cc: cleanEmails.slice(1), // rest as CC
          subject: "📎 New Attachment Added",
          html,
        });
      } catch (err) {
        console.error("Email failed but attachment created:", err);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Attachment created successfully",
        data: attachment,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("ATTACHMENT CREATE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 },
    );
  }
}
