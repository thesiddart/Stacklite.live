'use client'

import * as React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils/cn'

const Dropdown = DropdownMenu.Root
const DropdownTrigger = DropdownMenu.Trigger
const DropdownGroup = DropdownMenu.Group
const DropdownLabel = DropdownMenu.Label
const DropdownDivider = DropdownMenu.Separator
const DropdownShortcut = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span className={cn('ml-auto text-xs text-text-muted', className)} {...props} />
)

const DropdownContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenu.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenu.Content>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <DropdownMenu.Portal>
    <DropdownMenu.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-40 rounded-lg border border-border-base bg-background-base p-1 shadow-lg focus-visible:outline-none',
        className
      )}
      {...props}
    />
  </DropdownMenu.Portal>
))
DropdownContent.displayName = DropdownMenu.Content.displayName

const DropdownItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenu.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenu.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenu.Item
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center gap-2 rounded-md px-3 py-2 text-sm text-text-base outline-none transition-colors focus:bg-background-highlight focus:text-text-base data-[disabled]:pointer-events-none data-[disabled]:text-text-disabled',
      className
    )}
    {...props}
  />
))
DropdownItem.displayName = DropdownMenu.Item.displayName

export {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownGroup,
  DropdownLabel,
  DropdownDivider,
  DropdownShortcut,
}
