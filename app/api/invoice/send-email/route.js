import InvoicePdfTemplateServer from "@/components/pdf/InvoicePdfTemplateServer";
import { connectDB } from "@/lib/db";
import Invoice from "@/models/invoice/Invoice";
import InvoiceService from "@/models/invoice/InvoiceService";
import { renderToBuffer } from "@react-pdf/renderer";
import nodemailer from "nodemailer";
import Customer from "@/models/Customer";

export async function POST(req) {
  try {
    await connectDB();
    const { invoiceId } = await req.json();

    const invoiceFromDb = await Invoice.findById(invoiceId)
      .populate({
        path: "services",
        model: "InvoiceService",
        select: "serviceName HSN price",
      })
      .populate({ path: "clientId", model: "Customer", select: "email" });

    if (!invoiceFromDb) {
      return Response.json(
        {
          message: "Invoice for Email pdf not found",
          success: false,
        },
        {
          status: 404,
        }
      );
    }


    // 2. Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      <InvoicePdfTemplateServer data={invoiceFromDb} />
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

    await transporter.sendMail({
      from: `"promozione branding proposal" <inquiry.promozione@gmail.com>`,
      to: invoiceFromDb?.clientId?.email,
      subject: `Your Invoice from Promozione Branding - #${invoiceFromDb?.invoiceNo}`,
      html: `
        <p>Dear ${invoiceFromDb?.clientName},</p>
        <p>Thank you for your business. Please find your invoice <strong>#${invoiceFromDb?.invoiceNo}</strong> attached for your records.</p>
        <p>If you have any questions about your invoice, please don't hesitate to contact us.</p>
        <p>We appreciate your prompt payment.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>The Promozione Branding Team</strong><br>
        <a href="https://promozionebranding.com">www.promozionebranding.com</a></p>
      `,
      attachments: [
        {
          filename: `invoice-${invoiceFromDb?.invoiceNo}-${invoiceFromDb?.clientName}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    return Response.json({
      success: true,
      message: "Invoice has been send on email",
    });
  } catch (error) {
    console.log(error);
    return Response.json(
      {
        success: false,
        message: "Error while send Invoice via mail",
      },
      {
        status: 500,
      }
    );
  }
}
