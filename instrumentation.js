// instrumentation.js
//
// Runs once when the Next.js server starts, before any route (and so any Mongoose model) loads.
// Registers the global work-tracking plugin so every create / update / delete made by a
// logged-in user is recorded on /track-employee-work.

export async function register() {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return;
    const [{ default: mongoose }, { registerWorkTracking }] = await Promise.all([import('mongoose'), import('./lib/workTracking/plugin')]);
    registerWorkTracking(mongoose);
}
