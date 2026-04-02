'use client'

import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils/cn'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  contentClassName?: string
}

export function Modal({ isOpen, onClose, title, children, size = 'md', contentClassName }: ModalProps) {
  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background-emphasis/60 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border-base bg-background-base shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background-base',
            sizeStyles[size],
            contentClassName
          )}
        >
          <div className="flex items-center justify-between border-b border-border-muted px-4 py-3">
            <Dialog.Title className="text-lg font-semibold text-text-base">{title}</Dialog.Title>
            <Dialog.Close
              className="rounded-md p-2 text-text-muted transition-colors hover:text-text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background-base"
              aria-label="Close modal"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Dialog.Close>
          </div>
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-4 py-3">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
