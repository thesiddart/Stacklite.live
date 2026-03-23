import React from 'react'

interface ModuleCardProps {
  id: string
  title: string
  icon?: React.ReactNode
  children?: React.ReactNode
  onClose?: () => void
  isCompact?: boolean
  className?: string
}

export function ModuleCard({
  id,
  title,
  icon,
  children,
  onClose,
  isCompact = false,
  className = '',
}: ModuleCardProps) {
  return (
    <div
      className={`
        bg-background-base border border-border-base rounded-lg shadow-md
        flex flex-col min-w-[280px] 
        ${isCompact ? 'h-auto' : 'h-auto max-h-[500px]'}
        ${className}
      `}
      data-module-id={id}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-lg py-md border-b border-border-muted">
        <div className="flex items-center gap-md">
          {icon && <div className="flex-shrink-0 text-text-brand">{icon}</div>}
          <h3 className="font-semibold text-text-base">{title}</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-xs text-text-muted hover:text-text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-brand rounded-md"
            aria-label={`Close ${title}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      {children && (
        <div
          className={`flex-1 px-lg py-md ${
            isCompact ? 'overflow-visible' : 'overflow-y-auto'
          }`}
        >
          {children}
        </div>
      )}
    </div>
  )
}
