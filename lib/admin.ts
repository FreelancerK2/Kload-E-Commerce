// Admin access control configuration
export const ADMIN_EMAILS = [
  'admin@kload.com',
  'lensomnang.ls@gmail.com', // Your actual email
  // Add more admin emails here as needed
  // 'manager@kload.com',
  // 'support@kload.com',
];

export function isAdminUser(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export function getAdminEmails(): string[] {
  return ADMIN_EMAILS;
}
