import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    const textareaId = props.id ?? props.name
    const textareaStyles = `
      w-full px-lg py-md 
      bg-background-base 
      border-2 rounded-md 
      text-text-base 
      transition-colors duration-200
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-text-brand
      disabled:bg-background-disabled disabled:text-text-disabled disabled:cursor-not-allowed
      resize-vertical min-h-[100px]
      ${error 
        ? 'border-feedback-error-base focus-visible:border-feedback-error-base focus-visible:ring-feedback-error-base' 
        : 'border-border-base focus-visible:border-text-brand'
      }
    `
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="mb-sm block text-sm font-medium text-text-base">
            {label}
            {props.required && <span className="ml-xs text-text-brand">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          className={`${textareaStyles} ${className}`}
          {...props}
        />
        
        {error && (
          <p className="mt-xs text-sm text-feedback-error-text">
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p className="mt-xs text-sm text-text-muted">{hint}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
