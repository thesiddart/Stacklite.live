import React from 'react'
import { cn } from '@/lib/utils/cn'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  containerClassName?: string
  iconClassName?: string
}

const baseSelectClassName =
  'theme-shell-field h-9 w-full appearance-none rounded-[6px] border border-[var(--surface-input-border)] bg-[var(--surface-input)] pl-4 pr-10 py-1 text-[14px] leading-5 text-text-base transition-colors focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-none disabled:cursor-not-allowed disabled:opacity-70'

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      containerClassName,
      iconClassName,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = props.id ?? props.name

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label htmlFor={selectId} className="mb-2 block text-sm font-medium text-text-base">
            {label}
            {props.required && <span className="ml-1 text-text-brand">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(baseSelectClassName, className)}
            {...props}
          >
            {children}
          </select>
          <span
            className={cn(
              'pointer-events-none absolute inset-y-0 right-4 flex items-center text-text-base',
              iconClassName
            )}
            aria-hidden
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        {error && <p className="mt-1 text-sm text-feedback-error-text">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-text-muted">{hint}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'