// lib/mailerNew.js

import nodemailer from "nodemailer";

let transporter = null;

export const getTransporter = () => {
  if (transporter) return transporter;

  const user = process.env.YOUR_EMAIL_ADDRESS;
  const pass = process.env.YOUR_APP_PASSWORD;

  if (!user || !pass) {
    console.error("❌ Mailer Error: Email credentials missing in .env.local");
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  return transporter;
};

export const MAIL_FROM = `"Inquiry Bazaar" <${process.env.YOUR_EMAIL_ADDRESS}>`;
