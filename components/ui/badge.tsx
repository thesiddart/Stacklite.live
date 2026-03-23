import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        soft: 'border-transparent',
        outline: 'bg-transparent',
        strong: 'border-transparent text-text-inverse',
      },
      tone: {
        neutral: 'bg-background-highlight text-text-base border-border-base',
        primary: 'bg-button-secondary text-button-secondary-fg border-border-base',
        success: 'bg-feedback-success-base text-feedback-success-text border-transparent',
        warning: 'bg-feedback-warning-base text-feedback-warning-text border-transparent',
        danger: 'bg-feedback-error-base text-feedback-error-text border-transparent',
        info: 'bg-feedback-info-base text-feedback-info-text border-transparent',
      },
    },
    compoundVariants: [
      { variant: 'outline', tone: 'neutral', className: 'bg-transparent text-text-base' },
      { variant: 'outline', tone: 'primary', className: 'bg-transparent text-text-brand border-text-brand' },
      { variant: 'outline', tone: 'success', className: 'bg-transparent border-feedback-success-base text-feedback-success-text' },
      { variant: 'outline', tone: 'warning', className: 'bg-transparent border-feedback-warning-base text-feedback-warning-text' },
      { variant: 'outline', tone: 'danger', className: 'bg-transparent border-feedback-error-base text-feedback-error-text' },
      { variant: 'outline', tone: 'info', className: 'bg-transparent border-feedback-info-base text-feedback-info-text' },
      { variant: 'strong', tone: 'primary', className: 'bg-button-primary text-button-primary-fg' },
      { variant: 'strong', tone: 'neutral', className: 'bg-background-emphasis text-text-inverse' },
      { variant: 'soft', tone: 'primary', className: 'bg-background-highlight text-text-brand' },
    ],
    defaultVariants: {
      variant: 'soft',
      tone: 'neutral',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, tone }), className)} {...props} />
}

export function BadgeDot({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('h-2 w-2 rounded-full bg-current', className)} {...props} />
}
