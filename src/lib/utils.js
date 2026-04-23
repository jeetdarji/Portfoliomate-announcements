import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges class names safely, resolving Tailwind conflicts.
 * Usage: cn('px-4 py-2', isActive && 'bg-brand-primary', className)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitize Supabase / PostgREST errors for user-facing display.
 * Raw RLS and PostgreSQL errors are replaced with a generic message.
 * The original error is logged to the console for debugging.
 */
export function sanitizeSupabaseError(error) {
  if (!error) return 'An unexpected error occurred.'

  const message = typeof error === 'string' ? error : error.message || String(error)
  const code = error?.code || ''

  // Log the raw error for developers
  if (import.meta.env.DEV) {
    console.error('[Supabase Error]', error)
  }

  // RLS policy violations (PostgREST 403 or Postgres 42501)
  if (
    code === '42501' ||
    code === 'PGRST301' ||
    message.includes('permission denied') ||
    message.includes('row-level security')
  ) {
    return "You don't have permission to perform this action."
  }

  // HaveIBeenPwned breached password check
  if (
    message.includes('breach') ||
    message.includes('compromised') ||
    message.includes('pwned') ||
    message.includes('leaked')
  ) {
    return 'This password has appeared in a data breach. Please choose a different password.'
  }

  return message
}