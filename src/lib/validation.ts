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
/**
 * Strict Order Item Quantity Validation for RushD Quick-Commerce.
 *
 * Invariants:
 * - Must be a JavaScript number (rejects strings, null, undefined, objects)
 * - Must be a finite number (rejects NaN, Infinity, -Infinity)
 * - Must be an integer (rejects decimals / fractions such as 0.5, 1.5)
 * - Must be >= MIN_ITEM_QUANTITY (1) (rejects zero and negative quantities)
 * - Must be <= MAX_ITEM_QUANTITY (99) (prevents integer overflow & resource abuse while permitting bulk)
 */
export const MIN_ITEM_QUANTITY = 1;
export const MAX_ITEM_QUANTITY = 99;

export interface QuantityValidationResult {
  valid: boolean;
  error?: string;
}

export function isValidItemQuantity(
  quantity: unknown,
  maxQuantity = MAX_ITEM_QUANTITY
): quantity is number {
  return (
    typeof quantity === "number" &&
    Number.isFinite(quantity) &&
    Number.isInteger(quantity) &&
    quantity >= MIN_ITEM_QUANTITY &&
    quantity <= maxQuantity
  );
}

export function validateItemQuantity(
  quantity: unknown,
  itemLabel?: string,
  maxQuantity = MAX_ITEM_QUANTITY
): QuantityValidationResult {
  const label = itemLabel ? `"${itemLabel}"` : "item";

  if (quantity === undefined || quantity === null) {
    return {
      valid: false,
      error: `Missing quantity for ${label}. Quantity is required and must be an integer between ${MIN_ITEM_QUANTITY} and ${maxQuantity}.`,
    };
  }

  if (typeof quantity !== "number") {
    return {
      valid: false,
      error: `Invalid quantity type for ${label}. Expected a numeric integer, received ${typeof quantity}.`,
    };
  }

  if (!Number.isFinite(quantity) || Number.isNaN(quantity)) {
    return {
      valid: false,
      error: `Invalid quantity for ${label}. Quantity must be a finite number.`,
    };
  }

  if (!Number.isInteger(quantity)) {
    return {
      valid: false,
      error: `Invalid quantity for ${label}. Quantity must be a whole integer, received ${quantity}.`,
    };
  }

  if (quantity < MIN_ITEM_QUANTITY) {
    return {
      valid: false,
      error: `Invalid quantity for ${label}. Quantity must be at least ${MIN_ITEM_QUANTITY} (received ${quantity}).`,
    };
  }

  if (quantity > maxQuantity) {
    return {
      valid: false,
      error: `Invalid quantity for ${label}. Quantity cannot exceed maximum allowed limit of ${maxQuantity} units per item (received ${quantity}).`,
    };
  }

  return { valid: true };
}
