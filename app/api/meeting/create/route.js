import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import Meeting from "@/models/admin/meeting/Meeting";
import Customer from "@/models/admin/Customer";
import User from "@/models/admin/User";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    await connectDB();

    const {
      salesPersonId,
      salesPerson,
      clientId,
      updateType,
      status,
      note,
      reminderAt,
      meetingAt,
    } = await req.json();

    // =========================================================
    // FIND CUSTOMER
    // =========================================================

    const findCustomer = await Customer.findById(clientId);

    if (!findCustomer) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer with provided clientId not found",
        },
        {
          status: 404,
        }
      );
    }

    // =========================================================
    // CREATE MEETING
    // =========================================================

    const createMeeting = await Meeting.create({
      meetingUpdate: [
        {
          salesPersonId,
          salesPerson,
          clientId,
          updateType,
          status,
          note,
          reminderAt,
          meetingAt,
        },
      ],
    });

    if (!createMeeting) {
      throw new Error("Error while creating the meeting");
    }

    // =========================================================
    // LINK MEETING TO CUSTOMER
    // =========================================================

    findCustomer.meetingUpdate = createMeeting._id;
    await findCustomer.save();

    // =========================================================
    // GET ALL ADMINS
    // =========================================================

    const admins = await User.find({
      role: "admin",
    }).select("email username");

    const adminEmails = admins
      .map((admin) => admin.email)
      .filter(Boolean)
      .map((email) => email.toLowerCase().trim());

    // Remove duplicate emails
    const recipientEmails = [...new Set(adminEmails)];

    console.log(
      "Meeting notification recipients:",
      recipientEmails
    );

    // =========================================================
    // SEND EMAIL TO ALL ADMINS
    // =========================================================

    if (recipientEmails.length > 0) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.YOUR_EMAIL_ADDRESS,
            pass: process.env.YOUR_APP_PASSWORD,
          },
        });

        await transporter.sendMail({
          from: `"ERP Notifications" <${process.env.YOUR_EMAIL_ADDRESS}>`,

          to: recipientEmails,

          subject: `New Meeting Created - ${salesPerson || "Sales Person"}`,

          html: `
            <div
              style="
                font-family: Arial, Helvetica, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 650px;
                margin: 0 auto;
                padding: 20px;
              "
            >

              <div
                style="
                  background: #1d4ed8;
                  color: white;
                  padding: 20px;
                  border-radius: 8px 8px 0 0;
                "
              >
                <h2 style="margin: 0;">
                  New Meeting Created
                </h2>

                <p style="margin: 5px 0 0;">
                  ERP Notification
                </p>
              </div>

              <div
                style="
                  border: 1px solid #e5e7eb;
                  border-top: none;
                  padding: 25px;
                  border-radius: 0 0 8px 8px;
                "
              >

                <p>
                  A new meeting has been created in the ERP system.
                </p>

                <h3 style="color: #1d4ed8;">
                  Meeting Details
                </h3>

                <table
                  style="
                    width: 100%;
                    border-collapse: collapse;
                  "
                >

                  <tr>
                    <td
                      style="
                        padding: 8px 0;
                        font-weight: bold;
                      "
                    >
                      Sales Person
                    </td>

                    <td style="padding: 8px 0;">
                      ${salesPerson || "-"}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding: 8px 0;
                        font-weight: bold;
                      "
                    >
                      Client ID
                    </td>

                    <td style="padding: 8px 0;">
                      ${clientId}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding: 8px 0;
                        font-weight: bold;
                      "
                    >
                      Update Type
                    </td>

                    <td style="padding: 8px 0;">
                      ${updateType || "-"}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding: 8px 0;
                        font-weight: bold;
                      "
                    >
                      Status
                    </td>

                    <td style="padding: 8px 0;">
                      ${status || "-"}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding: 8px 0;
                        font-weight: bold;
                      "
                    >
                      Meeting Date
                    </td>

                    <td style="padding: 8px 0;">
                      ${meetingAt
              ? new Date(meetingAt).toLocaleString(
                "en-IN",
                {
                  timeZone: "Asia/Kolkata",
                }
              )
              : "-"
            }
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding: 8px 0;
                        font-weight: bold;
                      "
                    >
                      Note
                    </td>

                    <td style="padding: 8px 0;">
                      ${note || "-"}
                    </td>
                  </tr>

                </table>

                <hr
                  style="
                    margin: 25px 0;
                    border: none;
                    border-top: 1px solid #e5e7eb;
                  "
                />

                <p>
                  Please check the ERP dashboard for complete meeting details.
                </p>

                <p style="margin-bottom: 0;">
                  Regards,<br />
                  <strong>ERP System</strong>
                </p>

              </div>

            </div>
          `,
        });

        console.log(
          "✅ Meeting creation email sent to all admins:",
          recipientEmails
        );
      } catch (mailError) {
        // Email failure should NOT fail meeting creation
        console.error(
          "❌ Meeting email sending error:",
          mailError.message
        );
      }
    } else {
      console.log("⚠️ No admin users found");
    }

    // =========================================================
    // SUCCESS RESPONSE
    // =========================================================

    return NextResponse.json(
      {
        success: true,
        message: "Meeting created successfully",
        data: createMeeting,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create meeting API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}