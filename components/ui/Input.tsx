import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const inputVariants = cva(
  'w-full rounded-md border bg-background-base px-3 py-2 text-sm text-text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background-base disabled:cursor-not-allowed disabled:border-border-disabled disabled:bg-background-disabled disabled:text-text-disabled',
  {
    variants: {
      state: {
        default: 'border-border-base',
        error:
          'border-feedback-error-base focus-visible:border-feedback-error-base focus-visible:ring-feedback-error-base',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
)

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    const inputId = props.id ?? props.name

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-text-base">
            {label}
            {props.required && <span className="ml-1 text-feedback-error-base">*</span>}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={cn(inputVariants({ state: error ? 'error' : 'default' }), className)}
          {...props}
        />

        {error && <p className="mt-1 text-sm text-feedback-error-text">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-text-muted">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export function InputWrapper({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border border-border-base bg-background-base px-3 py-2 focus-within:ring-2 focus-within:ring-text-brand focus-within:ring-offset-2 focus-within:ring-offset-background-base',
        className
      )}
      {...props}
    />
  )
}

