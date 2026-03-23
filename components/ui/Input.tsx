import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    const inputId = props.id ?? props.name
    const inputStyles = `
      w-full px-lg py-md 
      bg-background-base 
      border-2 rounded-md 
      text-text-base 
      transition-colors duration-200
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-text-brand
      disabled:bg-background-disabled disabled:text-text-disabled disabled:cursor-not-allowed
      ${error 
        ? 'border-feedback-error-base focus-visible:border-feedback-error-base focus-visible:ring-feedback-error-base' 
        : 'border-border-base focus-visible:border-text-brand'
      }
    `
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-sm block text-sm font-medium text-text-base">
            {label}
            {props.required && <span className="text-feedback-error-base ml-xs">*</span>}
          </label>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={`${inputStyles} ${className}`}
          {...props}
        />
        
        {error && (
          <p className="mt-xs text-sm text-feedback-error-text">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-xs text-sm text-text-muted">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

Input.displayName = 'Input'
