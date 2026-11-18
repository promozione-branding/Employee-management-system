// app/api/customer/work/employee-by-domain/route.js
import { connectDB } from '@/lib/db';
import Employee from '@/models/employee/Employee';
import { NextResponse } from 'next/server';

function normalize(v) {
    return String(v || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// ── Known catalogue keys + legacy values → canonical designation strings ──
// One row per service the app can produce. Old keys and new keys both map
// to the SAME designation so nothing regresses.
const DIRECT_MAP = {
    // ── new catalogue keys (config/new/proposalCatalogNew.js) ──
    website: ['webdeveloper', 'webdev', 'developer', 'website'],
    adsmanagement: ['adsmanager', 'ads', 'admanager', 'ppc'],
    socialmedia: ['socialmedia', 'socialmediamanager', 'socialmediaexecutive', 'smm'],
    seo: ['seo', 'seospecialist', 'seoexecutive'],

    // ── legacy project.service values ──
    webdev: ['webdeveloper', 'webdev', 'developer', 'website'], // "web-dev"
    webdeveloper: ['webdeveloper', 'webdev', 'developer', 'website'], // "WEB_DEVELOPER"
    socialmedia: ['socialmedia', 'socialmediamanager', 'socialmediaexecutive', 'smm'], // legacy "social-media" normalizes to same
    ads: ['adsmanager', 'ads', 'admanager', 'ppc'],
    other: [],
};

// Fallback classifier — used when the incoming string is not in DIRECT_MAP
// (covers custom-service:*, arbitrary strings, or future catalogue additions).
function fuzzyBuckets(raw) {
    const k = normalize(raw);
    const out = new Set();
    if (k.includes('website') || k.includes('webdev') || k.includes('webdesign') || k.includes('developer') || k.includes('wordpress')) out.add('website');
    if (k.includes('seo') || k.includes('search')) out.add('seo');
    if (k.includes('ads') || k.includes('ppc') || k.includes('paid')) out.add('adsmanagement');
    if (k.includes('social') || k.includes('linkedin') || k.includes('instagram')) out.add('socialmedia');
    const aliases = new Set();
    out.forEach((b) => (DIRECT_MAP[b] || []).forEach((a) => aliases.add(a)));
    return [...aliases];
}

function designationCandidates(rawDomain) {
    const key = normalize(rawDomain);
    if (DIRECT_MAP[key]) return DIRECT_MAP[key];
    return fuzzyBuckets(rawDomain); // may be [] → then no match
}

export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const domain = searchParams.get('domain');
        if (!domain) {
            return NextResponse.json({ success: false, message: 'Domain is required' }, { status: 400 });
        }

        const candidates = designationCandidates(domain);
        if (!candidates.length) {
            return NextResponse.json(
                { success: false, message: `No department mapping for "${domain}"` },
                { status: 404 }
            );
        }

        const all = await Employee.find({
            'basicDetails.resignedEmployee': false,
        }).select('employeeId basicDetails.name basicDetails.designation');

        const employees = all.filter((emp) => {
            const d = normalize(emp.basicDetails?.designation);
            if (!d) return false;
            return candidates.some((c) => d === c || d.includes(c) || c.includes(d));
        });

        if (!employees.length) {
            return NextResponse.json(
                { success: false, message: `No employees found matching "${domain}"` },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: employees }, { status: 200 });
    } catch (error) {
        console.log('EMPLOYEE BY DOMAIN ERROR:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}