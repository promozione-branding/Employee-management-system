// lib/resolveUserName.js
// Resolve a human-friendly display name from a minimal authUser
// ({ _id, email, role }). Tries the User collection for `username`,
// then falls back to prettifying the email. Always returns a non-empty string.

import User from '@/models/admin/User';

function prettifyEmailName(email) {
    if (!email || typeof email !== 'string') return 'Unknown';
    const local = email.split('@')[0] || '';
    const parts = local.split(/[._-]+/).filter(Boolean);
    if (!parts.length) return 'Unknown';
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
}

export async function resolveUserName(authUser) {
    if (!authUser) return 'Unknown';

    try {
        if (authUser._id) {
            const u = await User.findById(authUser._id).select('username name basicDetails.name').lean();
            const name = u?.username || u?.name || u?.basicDetails?.name;
            if (name) return String(name).trim();
        }
    } catch (_) {
        // fall through to email-derived
    }

    return prettifyEmailName(authUser.email);
}
