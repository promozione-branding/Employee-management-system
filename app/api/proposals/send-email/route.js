import Proposal from "@/models/admin/proposal/Proposal";
import Customer from "@/models/admin/Customer";
import nodemailer from "nodemailer";
import { renderToBuffer } from "@react-pdf/renderer";
import Service from "@/models/admin/proposal/Service";
import ProposalPdfTemplateServer from "@/components/pdf/ProposalPdfTemplateServer";
import { connectDB } from "@/lib/db";

export async function POST(req) {
  try {

    await connectDB();
    
    const { proposalId, email } = await req.json();

    const proposal = await Proposal.findById(proposalId)
      .populate({
        path: "services",
        model: "Service",
        select:
          "serviceTitle amount duration description discountAmount discountPercentage",
      })
      .populate({ path: "clientId", model: "Customer", select: "email" });

    if (!proposal) {
      return Response.json(
        {
          success: false,
          message: "Proposal not found",
        },
        { status: 404 },
      );
    }

    // 2. Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      <ProposalPdfTemplateServer data={proposal} />,
    );

    // 3. Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.YOUR_EMAIL_ADDRESS,
        pass: process.env.YOUR_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // 4. Send email with attachment
    const mailOptions = {
      from: `"promozione branding proposal" <inquiry.promozione@gmail.com>`,
      to: proposal?.clientId?.email,
      subject: `Your Proposal from Promozione Branding - #${proposal?.proposalNo}`,
      html: `
        <p>Dear ${proposal?.clientName} Sir,</p>
        <p>I hope this email finds you well.</p>
        <p>I am writing to you to share with you the proposal for the marketing services that we discussed. At Promozione Branding Pvt Ltd, we take great pride in offering customized solutions that align with your business goals. We are excited about the opportunity to work together and help your brand achieve its marketing objectives.</p>
        <p style="margin: 25px 0; text-align: center;">
          <a href="https://wa.me/919971700871?text=I%20accept%20proposal%20%23${proposal?.proposalNo}" style="background-color: #25D366; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 8px; font-size: 16px; font-weight: bold;">
            Accept Proposal
          </a>
        </p>
        <p>Please find attached Performa Invoice for your reference</p>
        <p>Best regards,</p>
        <p><strong>The Promozione Branding</strong><br>
        <a href="tel:01142603232">011 4260 3232</a></p>
      `,
      attachments: [
        {
          filename: `proposal-${proposal?.clientName}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    if (email?.trim()) {
      mailOptions.cc = email.trim();
    }

    await transporter.sendMail(mailOptions);

    proposal.proposalSent = true;
    await proposal.save();

    return Response.json({
      success: true,
      message: "Proposal has been send on email",
      proposal,
    });
  } catch (error) {
    console.log("error while sending mail", error);
    return Response.json(
      {
        success: false,
        message: error?.message || "Error while sending mail",
      },
      { status: 500 },
    );
  }
}
