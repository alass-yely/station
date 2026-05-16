export const sanitizePhoneInput = (value: string): string =>
  value
    .replace(/[^\d+]/g, "")
    .replace(/(?!^)\+/g, "")
    .trim();

export const normalizePhoneForApi = (value: string): string => {
  const sanitized = sanitizePhoneInput(value);
  if (sanitized.startsWith("00")) {
    return `+${sanitized.slice(2)}`;
  }

  return sanitized;
};

export const isValidPhone = (value: string): boolean => {
  const normalized = normalizePhoneForApi(value);
  return /^\+?\d{8,15}$/.test(normalized);
};
