import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/getAuthUser";
import { sendEmail } from "@/lib/sendEmail";
import TeamUpdate from "@/models/employee/TeamUpdate";

function buildTeamUpdateEmail({ title, description, link }) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin-bottom: 12px;">${title}</h2>
      <p style="margin-bottom: 12px;">${description}</p>
      ${
        link
          ? `<p style="margin-bottom: 12px;">
              <a href="${link}" target="_blank" rel="noopener noreferrer">${link}</a>
            </p>`
          : ""
      }
      <p>Promozione Branding Team</p>
    </div>
  `;
}

export async function POST(req) {
  try {
    await connectDB();

    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      clientId,
      updateType,
      link = "",
      recipients = [],
    } = body;

    if (!title || !description || !clientId || !updateType) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and description are required",
        },
        { status: 400 },
      );
    }

    const cleanedRecipients = Array.isArray(recipients)
      ? [...new Set(recipients.map((item) => item?.trim()).filter(Boolean))]
      : [];

    if (!cleanedRecipients.length) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one recipient is required",
        },
        { status: 400 },
      );
    }

    const teamUpdate = await TeamUpdate.create({
      title: title.trim(),
      description: description.trim(),
      link: link?.trim(),
      recipients: cleanedRecipients,
      createdBy: authUser._id,
      clientId,
      updateType
    });

    const html = buildTeamUpdateEmail({
      title: teamUpdate.title,
      description: teamUpdate.description,
      link: teamUpdate.link,
    });

    await Promise.all(
      cleanedRecipients.map((recipient) =>
        sendEmail(recipient, `Team Update: ${teamUpdate.title}`, html),
      ),
    );

    return NextResponse.json(
      {
        success: true,
        message: "Team update created and emails sent successfully",
        data: teamUpdate,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE TEAM UPDATE ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while creating team update",
      },
      { status: 500 },
    );
  }
}
