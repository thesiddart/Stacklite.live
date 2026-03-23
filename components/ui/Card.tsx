import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  clickable?: boolean
  onClick?: () => void
}

export function Card({ children, className = '', clickable = false, onClick }: CardProps) {
  const baseStyles = 'bg-background-base rounded-lg shadow-sm border border-border-muted'
  const clickableStyles = clickable
    ? 'cursor-pointer hover:shadow-md hover:border-text-brand transition-all duration-200'
    : ''
  
  const Component = clickable ? 'button' : 'div'
  
  return (
    <Component
      className={`${baseStyles} ${clickableStyles} ${className}`}
      onClick={onClick}
      {...(clickable && { type: 'button' })}
    >
      {children}
    </Component>
  )
}
