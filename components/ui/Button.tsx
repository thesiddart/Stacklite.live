import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background-base disabled:cursor-not-allowed disabled:border-border-disabled disabled:bg-background-disabled disabled:text-text-disabled',
  {
    variants: {
      variant: {
        primary: 'bg-button-primary text-button-primary-fg text-btn-primaryFg hover:bg-link-hover',
        secondary: 'bg-button-secondary text-button-secondary-fg hover:bg-background-muted',
        ghost: 'border border-transparent bg-transparent text-button-ghost-fg hover:bg-background-highlight',
        outline: 'border border-border-base bg-background-base text-text-base hover:bg-background-highlight',
        danger: 'bg-feedback-error-base text-text-inverse hover:bg-feedback-error-text',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-5 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  asChild?: boolean
  children: React.ReactNode
}

export function Button({
  variant,
  size,
  isLoading = false,
  asChild = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button'

  return (
    <Component
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : children}
    </Component>
  )
}

interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode
  label: string
}

export function IconButton({ icon, label, size = 'md', ...props }: IconButtonProps) {
  const sizeClass = size === 'sm' ? 'w-8' : size === 'lg' ? 'w-12' : 'w-10'

  return (
    <Button
      {...props}
      size={size}
      className={cn('px-0', sizeClass, props.className)}
      aria-label={label}
    >
      {icon}
    </Button>
  )
}
