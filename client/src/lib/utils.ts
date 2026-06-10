import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Builds a className string from any mix of strings, arrays and objects,
 * resolving conflicting Tailwind classes (the last one wins).
 *
 * @param inputs - Class values as accepted by clsx.
 * @returns The merged class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts a human-readable error message from an unknown caught value.
 * Prefers the backend response body (axios errors), then `Error.message`,
 * then falls back to the provided default.
 *
 * @param e - The caught value, typically an axios error.
 * @param fallback - Message to use when nothing better can be extracted.
 * @returns The message to show to the user.
 */
export function getApiError(e: unknown, fallback: string): string {
  if (
    e !== null &&
    typeof e === "object" &&
    "response" in e &&
    e.response !== null &&
    typeof e.response === "object" &&
    "data" in e.response &&
    typeof (e.response as Record<string, unknown>).data === "string"
  ) {
    return (e.response as Record<string, unknown>).data as string;
  }
  if (e instanceof Error) return e.message;
  return fallback;
}
