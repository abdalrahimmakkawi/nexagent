// Admin configuration and utilities

export const ADMIN_EMAIL = 'abdalrahimmakaawi@gmail.com'

export function isAdmin(email: string): boolean {
  return email === ADMIN_EMAIL
}

export function getAdminRedirectUrl(email: string): string {
  return isAdmin(email) ? '/admin' : '/dashboard'
}

export function getAdminContactEmail(): string {
  return ADMIN_EMAIL
}
