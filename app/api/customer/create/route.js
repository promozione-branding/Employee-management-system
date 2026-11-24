// app/api/customer/create/route.js

import { connectDB } from '@/lib/db';
import Customer from '@/models/admin/Customer';
import User from '@/models/admin/User';
import { NextResponse } from 'next/server';
import { createAuditLog } from '@/utils/createAuditLog';
import { getAuthUser } from '@/lib/getAuthUser';
import nodemailer from 'nodemailer';
import { recordEmployeeWork } from '@/lib/employeeWorkTracker';

export async function POST(req) {
    try {
        await connectDB();

        // 🔐 AUTH USER
        const authUser = await getAuthUser(req);

        if (!authUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Unauthorized',
                },
                { status: 401 }
            );
        }

        const data = await req.json();

        // 🧼 WHITELIST — only allow known schema fields on create
        const ALLOWED_CREATE_FIELDS = [
            'name',
            'company',
            'GSTIN',
            'tanNo',
            'email',
            'phone',
            'website',
            'Address',
            'city',
            'state',
            'pincode',
            'country',
            'meetingDate',
            'category', 
            'isPaid',
            'notes',
            'salesExecutive',
        ];

        const safeData = {};
        for (const key of ALLOWED_CREATE_FIELDS) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                safeData[key] = data[key];
            }
        }

        // Only name + phone are compulsory; category/GST/city/... are optional.
        if (typeof safeData.name !== 'string' || !safeData.name.trim()) {
            return NextResponse.json({ success: false, message: 'Please enter client name', errors: [{ field: 'name', message: 'Please enter client name.' }] }, { status: 400 });
        }
        safeData.name = safeData.name.trim();

        const phone = String(safeData.phone ?? '').trim();
        if (!phone || !Number.isFinite(Number(phone))) {
            return NextResponse.json({ success: false, message: 'Please enter a valid client phone number', errors: [{ field: 'phone', message: 'Please enter a valid client phone number.' }] }, { status: 400 });
        }
        safeData.phone = Number(phone);

        // Drop blank optional fields so '' is never stored over real data.
        for (const field of ['company', 'GSTIN', 'tanNo', 'email', 'website', 'Address', 'city', 'state', 'pincode', 'country', 'category', 'meetingDate', 'notes']) {
            if (typeof safeData[field] === 'string') {
                safeData[field] = safeData[field].trim();
                if (!safeData[field]) delete safeData[field];
            }
        }
        if (safeData.email) safeData.email = safeData.email.toLowerCase();
        if (safeData.GSTIN) {
            safeData.GSTIN = safeData.GSTIN.toUpperCase();
            if (!/^[0-9A-Z]{15}$/.test(safeData.GSTIN)) {
                return NextResponse.json({ success: false, message: 'GSTIN must contain exactly 15 alphanumeric characters.', errors: [{ field: 'GSTIN', message: 'Please enter a valid 15-character GSTIN.' }] }, { status: 400 });
            }
        }
        if (safeData.category && safeData.category.length > 60) {
            return NextResponse.json({ success: false, message: 'Category must be at most 60 characters.', errors: [{ field: 'category', message: 'Category must be at most 60 characters.' }] }, { status: 400 });
        }
        if (typeof safeData.salesExecutive === 'string') {
            safeData.salesExecutive = safeData.salesExecutive.trim() ? [safeData.salesExecutive.trim()] : [];
        }
        safeData.isPaid = safeData.isPaid === true || safeData.isPaid === 'Paid' || safeData.isPaid === 'true';

        // 🆕 CREATE CUSTOMER
        const newCustomer = await Customer.create(safeData);

        await recordEmployeeWork({
            req,
            clientId: newCustomer._id,
            action: 'CLIENT_CREATED',
            summary: `Created client ${newCustomer.name}`,
            details: { company: newCustomer.company || '', category: newCustomer.category || '' },
            entityType: 'Customer',
            entityId: newCustomer._id,
        });

        // 🧾 CREATE AUDIT LOG
        await createAuditLog({
            entityType: 'Customer',
            entityId: newCustomer._id,
            action: 'CREATE',
            oldData: null,
            newData: newCustomer.toObject(),
            userId: authUser._id,
        });

        // =========================================================
        // 📧 GET ONLY ADMIN EMAILS
        // =========================================================

        const admins = await User.find({
            role: 'admin',
        }).select('email username');

        const adminEmails = [
            ...new Set(
                admins
                    .map((admin) => admin.email)
                    .filter(Boolean)
                    .map((email) => email.toLowerCase().trim())
            ),
        ];

        console.log('Admin notification emails:', adminEmails);

        // =========================================================
        // 📧 SEND EMAIL ONLY TO ADMINS
        // =========================================================

        if (adminEmails.length > 0) {
            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.YOUR_EMAIL_ADDRESS,
                        pass: process.env.YOUR_APP_PASSWORD,
                    },
                });

                const customerName = newCustomer.name || newCustomer.companyName || newCustomer.clientName || 'New Customer';

                const createdBy = authUser.username || authUser.email || 'ERP User';

                await transporter.sendMail({
                    from: `"ERP Notifications" <${process.env.YOUR_EMAIL_ADDRESS}>`,
                    to: adminEmails,
                    subject: `New Client Created - ${customerName}`,
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
                <h2 style="margin: 0;">New Client Created</h2>
                <p style="margin: 5px 0 0;">ERP Notification</p>
              </div>

              <div
                style="
                  border: 1px solid #e5e7eb;
                  border-top: none;
                  padding: 25px;
                  border-radius: 0 0 8px 8px;
                "
              >
                <p>A new client has been created in the ERP system.</p>

                <h3 style="color: #1d4ed8;">Client Details</h3>

                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Client Name</td>
                    <td style="padding: 8px 0;">${customerName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Client ID</td>
                    <td style="padding: 8px 0;">${newCustomer._id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Category</td>
                    <td style="padding: 8px 0;">${newCustomer.category || '—'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Created By</td>
                    <td style="padding: 8px 0;">${createdBy}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Created At</td>
                    <td style="padding: 8px 0;">
                      ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </td>
                  </tr>
                </table>

                <hr style="margin: 25px 0; border: none; border-top: 1px solid #e5e7eb;" />

                <p>Please check the ERP dashboard for complete client details.</p>

                <p style="margin-bottom: 0;">
                  Regards,<br />
                  <strong>ERP System</strong>
                </p>
              </div>
            </div>
          `,
                });

                console.log('✅ Client creation email sent to admins:', adminEmails);
            } catch (mailError) {
                console.error('❌ Client email sending error:', mailError.message);
            }
        } else {
            console.log('⚠️ No admin users found to send email');
        }

        // =========================================================
        // ✅ RESPONSE
        // =========================================================

        return NextResponse.json(
            {
                success: true,
                message: 'Customer created successfully',
                data: newCustomer,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create customer API error:', error);

        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Customer validation failed',
                    errors:
                        error.name === 'ValidationError'
                            ? Object.values(error.errors).map((err) => ({ field: err.path, message: err.message }))
                            : [{ field: error.path || 'unknown', message: error.message }],
                },
                { status: 400 }
            );
        }
        // Duplicate non-empty GSTIN (unique partial index) — say so, don't 500.
        if (error.code === 11000) {
            return NextResponse.json({ success: false, message: 'A client with this GST No. already exists.' }, { status: 409 });
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Server error',
                error: error.message,
            },
            { status: 500 }
        );
    }
}
