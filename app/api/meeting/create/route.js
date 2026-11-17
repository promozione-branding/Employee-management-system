// app/api/meeting/create/route.js

import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';
import Meeting from '@/models/admin/meeting/Meeting';
import Customer from '@/models/admin/Customer';
import User from '@/models/admin/User';
import nodemailer from 'nodemailer';
import { recordEdit } from '@/lib/auditLog';
import { getAuthUser } from '@/lib/getAuthUser';
import Employee from '@/models/employee/Employee';

// Primary admin — the ONLY person auto-CC'd on meetings.
const Admin_for_updateOfCallMeetingGeneral = (process.env.Admin_for_updateOfCallMeetingGeneral || 'sourabh@inquirybazaar.com')
    .toLowerCase()
    .trim();

export async function POST(req) {
    try {
        await connectDB();

        const body = await req.json();

        const {
            salesPersonId,
            salesPerson,
            clientId,
            updateType,
            status,
            note,
            reminderAt,
            meetingAt,
            subject,
            sendToSelf,
            ccAdmin,
            mailRecipients,
            location, // 👈 NEW — { lat, lng, accuracy, address, capturedAt }
        } = body;

        console.log('=== MEETING CREATE START ===');
        console.log('updateType:', updateType);
        console.log('sendToSelf:', sendToSelf, '| ccAdmin:', ccAdmin);

        // ── LOCATION LOGS (find exactly what came in during POST) ──
        console.log('📍 [location] raw from request:', JSON.stringify(location));
        console.log('📍 [location] type:', typeof location);
        if (location && typeof location === 'object') {
            console.log('📍 [location] lat:', location.lat, '| type:', typeof location.lat);
            console.log('📍 [location] lng:', location.lng, '| type:', typeof location.lng);
            console.log('📍 [location] accuracy:', location.accuracy);
            console.log('📍 [location] address:', location.address);
            console.log('📍 [location] capturedAt:', location.capturedAt);
        } else {
            console.log('📍 [location] NOT an object or missing');
        }

        // ── MANDATORY LOCATION VALIDATION (server-side, meeting only) ──
        if (updateType === 'meeting') {
            const latNum = Number(location?.lat);
            const lngNum = Number(location?.lng);
            const hasCoords = Number.isFinite(latNum) && Number.isFinite(lngNum);
            if (!hasCoords) {
                console.log('❌ [location] MISSING or INVALID for meeting — rejecting request');
                console.log('   received location:', JSON.stringify(location));
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Location is required for meeting update. Please capture location and try again.',
                    },
                    { status: 400 }
                );
            }
            console.log('✅ [location] VALID for meeting:', latNum, lngNum);
        }

        const findCustomer = await Customer.findById(clientId);
        if (!findCustomer) {
            return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
        }

        // ── Normalise location payload (only attach when present) ──
        const locationPayload =
            location && Number.isFinite(Number(location.lat)) && Number.isFinite(Number(location.lng))
                ? {
                      lat: Number(location.lat),
                      lng: Number(location.lng),
                      accuracy: location.accuracy != null ? Number(location.accuracy) : undefined,
                      address: location.address || '',
                      capturedAt: location.capturedAt ? new Date(location.capturedAt) : new Date(),
                  }
                : undefined;

        console.log('📍 [location] normalised payload to save:', JSON.stringify(locationPayload));

        const meetingUpdateDoc = {
            salesPersonId,
            salesPerson,
            clientId,
            updateType,
            status,
            note,
            reminderAt,
            meetingAt,
            // only set location when it exists — avoids overwriting on non-meeting updates
            ...(locationPayload ? { location: locationPayload } : {}),
        };

        console.log('🧾 [meetingUpdateDoc] keys:', Object.keys(meetingUpdateDoc));
        console.log('🧾 [meetingUpdateDoc] location present:', !!meetingUpdateDoc.location);

        const createMeeting = await Meeting.create({
            meetingUpdate: [meetingUpdateDoc],
        });

        console.log('✅ [meeting created] id:', createMeeting._id);
        console.log(
            '✅ [meeting created] location in DB:',
            JSON.stringify(createMeeting.meetingUpdate?.[0]?.location || null)
        );

        findCustomer.meetingUpdate = createMeeting._id;
        await findCustomer.save();

        // ── Audit Hook ──
        try {
            const authUser = await getAuthUser(req);
            if (authUser) {
                await recordEdit({
                    clientId,
                    module: 'meeting',
                    entityId: createMeeting._id,
                    action: 'CREATE',
                    summary: `Added ${updateType || 'general'} update${note ? `: "${note.substring(0, 40)}..."` : ''}`,
                    actor: { userId: authUser._id },
                    isConfidential: false,
                    afterSnapshot: createMeeting.meetingUpdate[0],
                    req,
                });
            }
        } catch (auditErr) {
            console.error('[edit-history] failed to record meeting:', auditErr);
        }

        // =========================================================
        // MAIL DECISION
        // =========================================================
        const mailEnabled = typeof sendToSelf === 'boolean' ? sendToSelf : updateType === 'meeting';

        if (mailEnabled) {
            const creator = await User.findById(salesPersonId).select('email username role');
            const creatorEmail = creator?.email?.toLowerCase().trim() || '';
            const creatorName = creator?.username || 'Unknown';
            const creatorRole = creator?.role || 'unknown';

            let primaryAdminEmail = '';
            const shouldIncludeAdmin = typeof ccAdmin === 'boolean' ? ccAdmin : updateType === 'meeting';
            if (shouldIncludeAdmin && Admin_for_updateOfCallMeetingGeneral) {
                primaryAdminEmail = Admin_for_updateOfCallMeetingGeneral;
            }

            const extraIds = Array.isArray(mailRecipients) ? mailRecipients : [];

            let extraEmails = [];
            if (extraIds.length) {
                const userHits = await User.find({ _id: { $in: extraIds } }).select('email');
                const empHits = await Employee.find({ _id: { $in: extraIds } }).select('basicDetails.email');

                extraEmails = [
                    ...userHits.map((u) => u.email?.toLowerCase().trim()),
                    ...empHits.map((e) => e.basicDetails?.email?.toLowerCase().trim()),
                ].filter(Boolean);
            }

            const ccCandidates = [primaryAdminEmail, ...extraEmails].filter(Boolean);
            const ccEmails = [...new Set(ccCandidates.filter((e) => e && e !== creatorEmail))];

            console.log('To (creator):', creatorEmail);
            console.log('CC:', ccEmails);

            if (creatorEmail || ccEmails.length > 0) {
                try {
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.YOUR_EMAIL_ADDRESS,
                            pass: process.env.YOUR_APP_PASSWORD,
                        },
                    });

                    const clientName = findCustomer?.name || findCustomer?.company || 'Client';
                    const typeLabel = updateType === 'meeting' ? 'Meeting' : updateType === 'call' ? 'Call' : 'General';
                    const defaultSubject = `${clientName} - ${typeLabel}`;
                    const finalSubject =
                        updateType === 'general' && subject && subject.trim() ? subject.trim() : defaultSubject;

                    // ── location block for the mail body ──
                    const locationRow = locationPayload
                        ? `
                          <tr>
                            <td style="padding: 8px 0; font-weight: bold;">Location</td>
                            <td style="padding: 8px 0;">
                              ${locationPayload.lat.toFixed(6)}, ${locationPayload.lng.toFixed(6)}
                              ${locationPayload.accuracy ? `(±${Math.round(locationPayload.accuracy)}m)` : ''}
                              <br/>
                              <span style="color:#555;">${locationPayload.address || ''}</span>
                              <br/>
                              <a href="https://www.google.com/maps?q=${locationPayload.lat},${locationPayload.lng}" target="_blank" rel="noopener">
                                Open in Google Maps
                              </a>
                            </td>
                          </tr>
                        `
                        : '';

                    await transporter.sendMail({
                        from: `"ERP Notifications" <${process.env.YOUR_EMAIL_ADDRESS}>`,
                        to: creatorEmail || process.env.YOUR_EMAIL_ADDRESS,
                        cc: ccEmails,
                        subject: finalSubject,
                        html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 20px;">
                <div style="background: #1d4ed8; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h2 style="margin: 0;">New ${typeLabel} Update</h2>
                  <p style="margin: 5px 0 0;">Created by <strong>${creatorName}</strong></p>
                </div>
                <div style="border: 1px solid #e5e7eb; border-top: none; padding: 25px; border-radius: 0 0 8px 8px;">
                  <p>A new ${updateType || 'update'} update has been created by <strong>${creatorName}</strong>.</p>
                  <h3 style="color: #1d4ed8;">Update Details</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    ${
                        updateType === 'general' && subject && subject.trim()
                            ? `<tr><td style="padding: 8px 0; font-weight: bold;">Subject</td><td style="padding: 8px 0;">${subject.trim()}</td></tr>`
                            : ''
                    }
                    <tr><td style="padding: 8px 0; font-weight: bold;">Created By</td><td style="padding: 8px 0;">${creatorName}${creatorEmail ? ` (${creatorEmail})` : ''}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Role</td><td style="padding: 8px 0;">${creatorRole}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Client</td><td style="padding: 8px 0;">${findCustomer.name || '-'}${findCustomer.company ? ` – ${findCustomer.company}` : ''}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Update Type</td><td style="padding: 8px 0;">${typeLabel}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Status</td><td style="padding: 8px 0;">${status || '-'}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">Meeting Date</td><td style="padding: 8px 0;">${meetingAt ? new Date(meetingAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '-'}</td></tr>
                    ${locationRow}
                    <tr><td style="padding: 8px 0; font-weight: bold;">Note</td><td style="padding: 8px 0;">${note || '-'}</td></tr>
                  </table>
                  <hr style="margin: 25px 0; border: none; border-top: 1px solid #e5e7eb;" />
                  <p>Please check the ERP dashboard for complete details.</p>
                </div>
              </div>
            `,
                    });

                    console.log('✅ EMAIL SENT → To:', creatorEmail, '| CC:', ccEmails);
                } catch (mailError) {
                    console.error('❌ EMAIL ERROR:', mailError.message);
                }
            } else {
                console.log('⚠️ No recipients — email skipped');
            }
        } else {
            console.log('📭 Mail disabled for this update — skipped');
        }

        console.log('=== MEETING CREATE END ===');

        return NextResponse.json(
            {
                success: true,
                message: 'Meeting created successfully',
                data: createMeeting,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('❌ CREATE MEETING ERROR:', error);
        return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 });
    }
}
