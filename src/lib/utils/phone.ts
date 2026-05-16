export function sanitizePhoneInput(value: string): string {
  let cleaned = value.replace(/[^\d+\s-]/g, '');
  if (cleaned.includes('+')) {
    cleaned = `+${cleaned.replace(/\+/g, '')}`;
  }
  return cleaned.replace(/\s+/g, ' ').trim();
}

export function normalizePhoneForApi(value: string): string {
  return sanitizePhoneInput(value).replace(/[\s-]/g, '');
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8;
}
