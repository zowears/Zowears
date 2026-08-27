/**
 * validation.js — Shared fraud-prevention validation utilities
 *
 * Covers:
 *  - Pakistani mobile number normalisation & validation
 *  - Standard email format check (client-side)
 *  - Haversine distance between two GPS coordinates
 *
 * All functions are pure and have no side-effects — safe to call on both
 * client and server (API routes).
 */

// ─── Pakistani Mobile Number ──────────────────────────────────────────────────

/**
 * Strip all formatting from a raw phone input and return a canonical
 * "+923XXXXXXXXX" string, or throw if the number doesn't match the
 * Pakistani mobile format.
 *
 * Accepted input variants:
 *   03001234567        (local, 11 digits starting with 0)
 *   923001234567       (92 country code, no plus)
 *   +923001234567      (E.164 format)
 *
 * The local part (after stripping the country prefix) must be exactly
 * 10 digits starting with "3" — covering all Pakistani mobile operators:
 *   30x (Jazz/Warid), 31x (Telenor), 32x (Ufone), 33x (Zong), 34x (SCO)
 *
 * @param {string} raw  Raw input from the form field
 * @returns {string}    Normalised "+923XXXXXXXXX" string
 * @throws {Error}      If the number is not a valid Pakistani mobile
 */
export function normalizePhone(raw) {
  if (!raw || typeof raw !== "string") throw new Error("Phone number is required");

  // Remove spaces, dashes, parentheses
  const stripped = raw.replace(/[\s\-()]/g, "").trim();

  let local; // 10-digit portion starting with "3"

  if (/^\+92/.test(stripped)) {
    // +92XXXXXXXXXX
    local = stripped.slice(3);
  } else if (/^92/.test(stripped) && stripped.length === 12) {
    // 92XXXXXXXXXX
    local = stripped.slice(2);
  } else if (/^0/.test(stripped)) {
    // 0XXXXXXXXXX
    local = stripped.slice(1);
  } else if (/^3/.test(stripped) && stripped.length === 10) {
    // Already just the local portion — 3XXXXXXXXX
    local = stripped;
  } else {
    throw new Error("Unrecognised phone format");
  }

  // Must be exactly 10 digits starting with "3"
  if (!/^3[0-9]{9}$/.test(local)) {
    throw new Error("Not a valid Pakistani mobile number");
  }

  return `+92${local}`;
}

/**
 * Validate and normalise a Pakistani mobile number.
 *
 * @param {string} raw
 * @returns {{ valid: boolean, normalized: string|null, error: string|null }}
 */
export function validatePakistaniPhone(raw) {
  try {
    const normalized = normalizePhone(raw);
    return { valid: true, normalized, error: null };
  } catch (err) {
    return { valid: false, normalized: null, error: err.message };
  }
}

// ─── Email Format (Client-Side) ───────────────────────────────────────────────

/**
 * Quick RFC-5322-ish regex check for obvious malformed emails.
 * Server-side deliverability is checked separately via verifyEmail().
 *
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmailFormat(email) {
  if (!email || typeof email !== "string") return false;
  // Robust enough for UX purposes — not a complete RFC-5322 implementation
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

// ─── Geolocation Distance ─────────────────────────────────────────────────────

const EARTH_RADIUS_KM = 6371;

/**
 * Calculate the great-circle distance between two GPS coordinates using the
 * Haversine formula.
 *
 * @param {number} lat1  Latitude of point A (degrees)
 * @param {number} lon1  Longitude of point A (degrees)
 * @param {number} lat2  Latitude of point B (degrees)
 * @param {number} lon2  Longitude of point B (degrees)
 * @returns {number}     Distance in kilometres
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Convenience: returns true if the two points are more than `thresholdKm`
 * apart (default 15 km — the RTO flag threshold for Zowears).
 *
 * @param {{ lat: number, lng: number }} coordsA
 * @param {{ lat: number, lng: number }} coordsB
 * @param {number} [thresholdKm=15]
 * @returns {boolean}
 */
export function isLocationMismatch(coordsA, coordsB, thresholdKm = 15) {
  if (!coordsA || !coordsB) return false;
  return haversineDistance(coordsA.lat, coordsA.lng, coordsB.lat, coordsB.lng) > thresholdKm;
}
