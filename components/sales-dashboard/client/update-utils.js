// components/sales-dashboard/client/update-utils.js

export const toLocalISO = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return undefined;
    const [y, mo, d] = dateStr.split('-').map(Number);
    const [h, mi] = timeStr.split(':').map(Number);
    if ([y, mo, d, h, mi].some((n) => Number.isNaN(n))) return undefined;
    const local = new Date(y, mo - 1, d, h, mi, 0, 0);
    const pad = (n) => String(n).padStart(2, '0');
    const off = -local.getTimezoneOffset();
    const sign = off >= 0 ? '+' : '-';
    const abs = Math.abs(off);
    const offsetStr = `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
    return `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}:00${offsetStr}`;
};

// Free reverse geocode via Nominatim (no key). Respect 1 req/sec in production.
export async function reverseGeocode(lat, lng) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error('Reverse geocode failed');
        const data = await res.json();
        return data?.display_name || '';
    } catch (e) {
        console.log('reverseGeocode error:', e);
        return '';
    }
}

/**
 * Best-precision location capture using watchPosition.
 * Samples for `sampleMs` (default 4000ms) and keeps the reading with lowest accuracy (meters).
 * Falls back to the last reading if watch never fires with a "good" one.
 */
export function getBestPosition({ sampleMs = 4000, highAccuracy = true } = {}) {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !('geolocation' in navigator)) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }

        let best = null;
        let lastErr = null;
        let done = false;

        const finish = () => {
            if (done) return;
            done = true;
            try { navigator.geolocation.clearWatch(watchId); } catch (_) {}
            if (best) resolve(best);
            else if (lastErr) reject(lastErr);
            else reject(new Error('Could not determine location'));
        };

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const acc = pos.coords.accuracy ?? Infinity;
                if (!best || acc < best.coords.accuracy) {
                    best = pos;
                }
                // If we already have a very good reading (<15m), no need to wait the full window
                if (best && best.coords.accuracy <= 15) {
                    finish();
                }
            },
            (err) => {
                lastErr = err;
                // PERMISSION_DENIED → fail fast, no point waiting
                if (err.code === 1) finish();
            },
            {
                enableHighAccuracy: highAccuracy,
                timeout: 15000,
                maximumAge: 0,
            }
        );

        // hard cap — stop sampling after sampleMs
        setTimeout(finish, sampleMs);
    });
}

export async function captureLocation() {
    const pos = await getBestPosition({ sampleMs: 4000, highAccuracy: true });
    const { latitude, longitude, accuracy } = pos.coords;
    const address = await reverseGeocode(latitude, longitude);
    return {
        lat: latitude,
        lng: longitude,
        accuracy,
        address,
        capturedAt: new Date().toISOString(),
    };
}
