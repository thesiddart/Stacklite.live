import React from 'react'

interface ModuleButton {
  id: string
  label: string
  icon: React.ReactNode
  active?: boolean
  onClick: () => void
}

interface DockProps {
  modules: ModuleButton[]
  className?: string
}

export function Dock({ modules, className = '' }: DockProps) {
  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 
        bg-background-base border-t border-border-muted shadow-lg
        flex items-center justify-center gap-lg px-lg py-md
        ${className}
      `}
      role="toolbar"
      aria-label="Module switcher"
    >
      {modules.map((module) => (
        <button
          key={module.id}
          onClick={module.onClick}
          className={`
            flex items-center gap-md px-lg py-md rounded-md font-medium
            transition-all duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-text-brand
            ${
              module.active
                ? 'bg-button-primary text-button-primary-fg'
                : 'bg-button-secondary text-button-secondary-fg hover:opacity-90'
            }
          `}
          aria-pressed={module.active}
          title={module.label}
        >
          {module.icon}
          <span className="hidden sm:inline">{module.label}</span>
        </button>
      ))}
    </div>
  )
}
