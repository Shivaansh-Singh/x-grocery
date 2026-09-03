import crypto from "crypto";

/**
 * Generate a cryptographically secure 6-digit delivery OTP and its SHA-256 hash.
 */
export function generateDeliveryOtp(): { otp: string; hash: string } {
  // Generate random integer between 100000 and 999999 inclusive
  const otpNumber = crypto.randomInt(100000, 1000000);
  const otp = otpNumber.toString();

  const hash = hashDeliveryOtp(otp);

  return { otp, hash };
}

/**
 * Compute SHA-256 hash of a 6-digit OTP string.
 */
export function hashDeliveryOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp.trim()).digest("hex");
}

/**
 * Constant-time safe verification of entered OTP against stored hash or stored OTP.
 */
export function verifyDeliveryOtp(
  enteredOtp: string | undefined | null,
  storedHash: string | undefined | null,
  rawStoredOtp?: string | null
): boolean {
  if (!enteredOtp || typeof enteredOtp !== "string") return false;

  const cleanEntered = enteredOtp.trim();
  // Must be exactly 6 numeric digits
  if (!/^\d{6}$/.test(cleanEntered)) return false;

  const enteredHash = hashDeliveryOtp(cleanEntered);

  if (storedHash) {
    try {
      const a = Buffer.from(enteredHash, "hex");
      const b = Buffer.from(storedHash, "hex");
      if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
        return true;
      }
    } catch {
      if (enteredHash === storedHash) return true;
    }
  }

  // Fallback match if raw stored OTP is present
  if (rawStoredOtp && cleanEntered === rawStoredOtp.trim()) {
    return true;
  }

  return false;
}
