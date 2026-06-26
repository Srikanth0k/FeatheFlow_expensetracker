import { cn } from '../../utils/cn'
import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

export function Card({ className, variant = 'default', padding = 'md', hover, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--border-radius)] border border-[var(--color-border)]/50',
        variant === 'default' && 'bg-[var(--color-card)]',
        variant === 'glass' && 'glass',
        variant === 'gradient' && 'bg-gradient-to-br from-[var(--color-card)] to-[var(--color-background)]',
        padding === 'sm' && 'p-3',
        padding === 'md' && 'p-4 md:p-5',
        padding === 'lg' && 'p-5 md:p-6',
        padding === 'none' && 'p-0',
        hover && 'transition-all duration-200 hover:border-[var(--color-primary)]/40 hover:shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
