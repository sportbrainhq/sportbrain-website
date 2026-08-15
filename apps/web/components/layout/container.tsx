import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** `wide` for full-bleed sections, `narrow` for reading-width prose. */
  size?: 'narrow' | 'default' | 'wide';
}

const sizes = {
  // ~65 characters at the base font size, which is the readable range for
  // long-form text.
  narrow: 'max-w-2xl',
  default: 'max-w-6xl',
  wide: 'max-w-screen-2xl',
} as const;

/** Horizontal page gutter and max width. A server component: no interactivity. */
export function Container({ children, className, size = 'default' }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizes[size], className)}>
      {children}
    </div>
  );
}
