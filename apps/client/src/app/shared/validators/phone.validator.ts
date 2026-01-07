import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validates if a phone number is a valid Tunisian phone number.
 * Rules:
 * - Must be 8 digits (ignoring spaces)
 * - Must start with 2, 5, 9, or 3
 *
 * @param phone The phone number string to validate
 * @returns Error message if invalid, null if valid
 */
export function getTunisianPhoneError(phone: string): string | null {
  if (!phone) return null;

  // Remove spaces and any non-digit characters for validation
  const cleanPhone = phone.replace(/\s/g, '');

  // Must be exactly 8 digits
  if (!/^\d{8}$/.test(cleanPhone)) {
    return 'Le numéro doit contenir exactement 8 chiffres';
  }

  // Must start with 5, 2, 3, or 9
  if (!/^[5239]/.test(cleanPhone)) {
    return 'Le numéro doit commencer par 5, 2, 9 ou 3';
  }

  return null;
}

/**
 * Angular Reactive Forms Validator for Tunisian phone numbers.
 * Expects the control's parent to have a 'countryCode' control.
 */
export function tunisianPhoneValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const phoneNumber = control.value;
  const countryCode = control.parent?.get('countryCode')?.value;

  // Only validate if there's a phone number
  if (!phoneNumber) {
    return null;
  }

  // Only apply Tunisia-specific validation if country code is +216
  // Default to validating if no country code found (assuming +216 context) or checks +216
  if (countryCode && countryCode !== '+216') {
    return null;
  }

  const error = getTunisianPhoneError(phoneNumber);
  return error ? { tunisianPhone: { message: error } } : null;
}
