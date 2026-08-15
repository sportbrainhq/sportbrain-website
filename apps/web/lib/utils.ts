import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names, resolving Tailwind conflicts so the last one wins.
 *
 * Same helper and same semantics as the SportBrainHQ UI library, so components
 * moved between the two behave identically.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
