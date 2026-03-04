/**
 * Shared form validations - required fields, phone 10 digits, email, etc.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRequired(value: string | undefined | null, fieldName: string): string | null {
  const v = typeof value === 'string' ? value.trim() : value;
  if (v === undefined || v === null || v === '') {
    return `${fieldName} is required. Please fill this field.`;
  }
  return null;
}

export function validateEmail(value: string | undefined | null): string | null {
  const err = validateRequired(value, 'Email');
  if (err) return err;
  const v = (value || '').trim();
  if (!EMAIL_REGEX.test(v)) {
    return 'Please enter a valid email address.';
  }
  return null;
}

/** Phone: exactly 10 digits (digits only, no spaces). */
export function validatePhone10(value: string | undefined | null): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  if (trimmed === '') return null; // optional in some forms
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length !== 10) {
    return 'Phone number must be exactly 10 digits.';
  }
  return null;
}

/** Phone required + 10 digits */
export function validatePhone10Required(value: string | undefined | null): string | null {
  const err = validateRequired(value, 'Phone');
  if (err) return err;
  return validatePhone10(value);
}

export function validatePassword(value: string | undefined | null, minLength = 8, maxLength = 12): string | null {
  const err = validateRequired(value, 'Password');
  if (err) return err;
  const v = value || '';
  if (v.length < minLength) {
    return `Password must be at least ${minLength} characters.`;
  }
  if (maxLength && v.length > maxLength) {
    return `Password cannot be longer than ${maxLength} characters.`;
  }
  return null;
}

export function validatePasswordMatch(password: string, confirm: string): string | null {
  if (password !== confirm) return 'Passwords do not match.';
  return null;
}

/** Numeric field required and valid number */
export function validateRequiredNumber(
  value: string | number | undefined | null,
  fieldName: string,
  min?: number,
  max?: number
): string | null {
  const err = validateRequired(String(value ?? ''), fieldName);
  if (err) return err;
  const num = Number(value);
  if (Number.isNaN(num)) return `${fieldName} must be a valid number.`;
  if (min !== undefined && num < min) return `${fieldName} must be at least ${min}.`;
  if (max !== undefined && num > max) return `${fieldName} must be at most ${max}.`;
  return null;
}

/** Collect first error from multiple validations */
export function firstError(...results: (string | null)[]): string | null {
  for (const r of results) {
    if (r) return r;
  }
  return null;
}
