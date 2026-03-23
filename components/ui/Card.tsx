import React from 'react'
import { cn } from '@/lib/utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  clickable?: boolean
  onClick?: () => void
}

export function Card({ children, className = '', clickable = false, onClick }: CardProps) {
  const baseStyles =
    'rounded-xl border border-border-base bg-background-base shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background-base'
  const clickableStyles = clickable
    ? 'cursor-pointer transition-colors hover:bg-background-highlight hover:border-text-brand'
    : ''

  const Component = clickable ? 'button' : 'div'

  return (
    <Component
      className={cn(baseStyles, clickableStyles, className)}
      onClick={onClick}
      {...(clickable && { type: 'button' })}
    >
      {children}
    </Component>
  )
}

export function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex items-start justify-between gap-3 p-4', className)} {...props} />
}

export function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return <h3 className={cn('text-base font-semibold text-text-base', className)} {...props} />
}

export function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('text-sm text-text-muted', className)} {...props} />
}

export function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('p-4 pt-0', className)} {...props} />
}

export function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex items-center gap-2 p-4 pt-0', className)} {...props} />
}
