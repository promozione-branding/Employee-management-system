import Proposal from "@/models/Proposal";
import Customer from "@/models/Customer";
import nodemailer from "nodemailer";
import { renderToBuffer } from "@react-pdf/renderer";
import Service from "@/models/Service";
import ProposalPdfTemplateServer from "@/components/pdf/ProposalPdfTemplateServer";

export async function POST(req) {
  try {
    const { proposalId } = await req.json();

    const proposal = await Proposal.findById(proposalId)
      .populate({
        path: "services",
        model: "Service",
        select:
          "serviceTitle amount duration description discountAmount discountPercentage",
      })
      .populate({ path: "clientId", model: "Customer", select: "email" });

    console.log(proposal?.proposalNo, "proposal?.proposalNumber");

    if (!proposal) {
      return Response.json(
        {
          success: false,
          message: "Proposal not found",
        },
        { status: 404 }
      );
    }

    // 2. Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      <ProposalPdfTemplateServer data={proposal} />
    );

    // 3. Nodemailer transporter
    // const transporter = nodemailer.createTransport({
    //   host: "smtp.gmail.com",
    //   port: 587,
    //   secure: false,
    //   auth: {
    //     user: process.env.YOUR_EMAIL_ADDRESS,
    //     pass: process.env.YOUR_APP_PASSWORD,
    //   },
    // });

    // for render deployment
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    // 4. Send email with attachment
    const emailValue = await transporter.sendMail({
      from: `"promozione branding proposal" <inquiry.promozione@gmail.com>`,
      to: proposal?.clientId?.email,
      subject: `Your Proposal from Promozione Branding - #${proposal?.proposalNo}`,
      html: `
        <p>Dear ${proposal?.clientName},</p>
        <p>Thank you for your interest in our services. Please find your detailed proposal attached for your review.</p>
        <p>We are excited about the possibility of working with you. If you have any questions, please feel free to reach out.</p>
        <p style="margin: 25px 0; text-align: center;">
          <a href="https://wa.me/919971700871?text=I%20accept%20proposal%20%23${proposal?.proposalNo}" style="background-color: #25D366; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 8px; font-size: 16px; font-weight: bold;">
            Accept Proposal
          </a>
        </p>
        <p>Best regards,</p>
        <p><strong>The Promozione Branding Team</strong><br>
        <a href="https://promozionebranding.com">www.promozionebranding.com</a></p>
      `,
      attachments: [
        {
          filename: `proposal-${proposal?.clientName}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    return Response.json({
      success: true,
      message: "Proposal has been send on email",
      emailValue,
    });
  } catch (error) {
    console.log("error while sending mail", error);
    return Response.json(
      {
        success: false,
        message: "Error while sending mail",
      },
      { status: 500 }
    );
  }
}
