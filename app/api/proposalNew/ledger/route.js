// app/api/proposalNew/ledger/route.js

import { connectDB } from '@/lib/db';
import LedgerNew from '@/models/admin/proposalNew/LedgerNew';
import Customer from '@/models/admin/Customer';
import User from '@/models/admin/User';
import ProposalNew from '@/models/admin/proposalNew/ProposalNew';
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/getAuthUser';
import { sendLedgerMail } from '@/lib/mail/ledgerMailer';

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const customerId = searchParams.get('customerId');

        if (!customerId) return NextResponse.json({ success: false }, { status: 400 });

        const entries = await LedgerNew.find({ customerId }).sort({
            date: 1,
            createdAt: 1,
        });

        // Balance is per proposal AND per ledger (genuine/confidential are
        // never summed together), starting from that proposal's value.
        const proposalIds = [
            ...new Set(
                entries
                    .map((e) => e.proposalId)
                    .filter(Boolean)
                    .map(String)
            ),
        ];
        const proposals = proposalIds.length
            ? await ProposalNew.find({ _id: { $in: proposalIds } })
                  .select('grandTotal')
                  .lean()
            : [];
        const baseByProposal = new Map(proposals.map((p) => [String(p._id), Number(p.grandTotal) || 0]));
        const runningByLedger = new Map();
        const calculatedEntries = entries.map((entry) => {
            const key = `${entry.proposalId || ''}|${Boolean(entry.isConfidential)}`;
            if (!runningByLedger.has(key)) {
                runningByLedger.set(key, baseByProposal.get(String(entry.proposalId)) || 0);
            }
            const balance = runningByLedger.get(key) + (entry.debit || 0) + (entry.extraAmount || 0) - (entry.credit || 0);
            runningByLedger.set(key, balance);
            return { ...entry.toObject(), balance };
        });

        return NextResponse.json({ success: true, data: calculatedEntries }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();

        const entry = await LedgerNew.create({
            customerId: body.customerId,
            proposalId: body.proposalId || null,
            date: body.date,
            particulars: body.particulars,
            voucher: body.voucher,
            debit: Number(body.debit) || 0,
            credit: Number(body.credit) || 0,
            extraAmount: Number(body.extraAmount) || 0,
            transactionId: body.transactionId,
            isConfidential: Boolean(body.isConfidential),
        });

        // ── FIRE LEDGER MAIL (non-blocking) ──
        try {
            const authUser = await getAuthUser(req);
            const [actorUser, clientDoc, proposalDoc] = await Promise.all([
                authUser?._id ? User.findById(authUser._id).select('username email').lean() : null,
                Customer.findById(body.customerId).select('name company').lean(),
                body.proposalId ? ProposalNew.findById(body.proposalId).select('proposalNumber grandTotal status').lean() : null,
            ]);

            const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
            const link = origin ? `${origin}/dashboard/customer/${body.customerId}` : undefined;

            await sendLedgerMail({
                action: 'created',
                ledgerDoc: entry,
                actorUser: actorUser || {},
                clientDoc: clientDoc || {},
                proposalDoc: proposalDoc || {},
                link,
            });
        } catch (mailErr) {
            console.error('[ledger-POST] mail hook error:', mailErr);
        }

        return NextResponse.json({ success: true, data: entry }, { status: 201 });
    } catch (error) {
        console.error('[ledger-POST] error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectDB();
        const body = await req.json();

        const existing = await LedgerNew.findById(body.entryId).lean();
        if (!existing) {
            return NextResponse.json({ success: false, message: 'Entry not found' }, { status: 404 });
        }

        // An edit never moves an entry between ledgers or proposals.
        const updated = await LedgerNew.findByIdAndUpdate(
            body.entryId,
            {
                date: body.date,
                particulars: body.particulars,
                voucher: body.voucher,
                debit: Number(body.debit) || 0,
                credit: Number(body.credit) || 0,
                extraAmount: Number(body.extraAmount) || 0,
                transactionId: body.transactionId,
                isConfidential: Boolean(existing.isConfidential),
                proposalId: existing.proposalId || null,
            },
            { new: true }
        );

        // ── FIRE LEDGER MAIL (non-blocking) ──
        try {
            if (updated) {
                const authUser = await getAuthUser(req);
                const [actorUser, clientDoc, proposalDoc] = await Promise.all([
                    authUser?._id ? User.findById(authUser._id).select('username email').lean() : null,
                    updated.customerId ? Customer.findById(updated.customerId).select('name company').lean() : null,
                    updated.proposalId ? ProposalNew.findById(updated.proposalId).select('proposalNumber grandTotal status').lean() : null,
                ]);

                const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
                const link = origin ? `${origin}/dashboard/customer/${updated.customerId}` : undefined;

                await sendLedgerMail({
                    action: 'updated',
                    ledgerDoc: updated,
                    actorUser: actorUser || {},
                    clientDoc: clientDoc || {},
                    proposalDoc: proposalDoc || {},
                    link,
                });
            }
        } catch (mailErr) {
            console.error('[ledger-PUT] mail hook error:', mailErr);
        }

        return NextResponse.json({ success: true, data: updated }, { status: 200 });
    } catch (error) {
        console.error('[ledger-PUT] error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });

        await LedgerNew.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: 'Deleted' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
