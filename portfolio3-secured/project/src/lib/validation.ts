// Reasonable upper bounds for public form fields — prevents obviously
// abusive payloads (e.g. multi-megabyte "messages") from ever reaching
// the database, without restricting any legitimate use.
export const MAX_NAME_LENGTH = 100;
export const MAX_EMAIL_LENGTH = 254; // RFC 5321 max
export const MAX_SUBJECT_LENGTH = 150;
export const MAX_MESSAGE_LENGTH = 5000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim()) && email.length <= MAX_EMAIL_LENGTH;
}

export interface ContactFormInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

/**
 * Trims and validates a contact/order form payload. Returns an error
 * message if invalid, or null if the (trimmed) input is safe to submit.
 */
export function validateContactForm(input: ContactFormInput): string | null {
  if (!input.name.trim() || input.name.trim().length > MAX_NAME_LENGTH) {
    return `Please enter a name (max ${MAX_NAME_LENGTH} characters).`;
  }
  if (!isValidEmail(input.email)) {
    return 'Please enter a valid email address.';
  }
  if (input.subject && input.subject.trim().length > MAX_SUBJECT_LENGTH) {
    return `Subject is too long (max ${MAX_SUBJECT_LENGTH} characters).`;
  }
  if (!input.message.trim() || input.message.trim().length > MAX_MESSAGE_LENGTH) {
    return `Please enter a message (max ${MAX_MESSAGE_LENGTH} characters).`;
  }
  return null;
}
