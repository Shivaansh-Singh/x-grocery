/**
 * Strict 10-digit Indian Mobile Number Validation.
 * - Must be exactly 10 digits
 * - Must start with 6, 7, 8, or 9
 * - Reject letters, spaces, hyphens, brackets, +91, 9-digit, 11-digit numbers
 */
export function validateIndianMobileNumber(mobile: string | null | undefined): boolean {
  if (!mobile) return false;
  const trimmed = mobile.trim();
  return /^[6-9][0-9]{9}$/.test(trimmed);
}

/**
 * Strict 6-digit Indian Pincode Validation.
 */
export function validateIndianPincode(pincode: string | null | undefined): boolean {
  if (!pincode) return false;
  const trimmed = pincode.trim();
  return /^[1-9][0-9]{5}$/.test(trimmed);
}
