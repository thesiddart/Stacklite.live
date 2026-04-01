import React from 'react'

interface CanvasProps {
  children: React.ReactNode
  className?: string
}

export function Canvas({ children, className = '' }: CanvasProps) {
  return (
    <div
      className={`
        flex-1 overflow-auto p-3xl
        bg-background-base
        relative
        /* Dotted grid background */
        before:absolute before:inset-0 before:bg-[radial-gradient(circle,var(--grid-dot-color)_1px,transparent_1px)]
        before:bg-[length:16px_16px]
        before:pointer-events-none
        ${className}
      `}
      role="main"
    >
      {/* Content overlays grid */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
