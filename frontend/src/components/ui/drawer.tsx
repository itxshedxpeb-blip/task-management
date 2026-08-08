"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DrawerProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  panelClassName?: string
}

const Drawer = ({ children, open, onOpenChange, panelClassName }: DrawerProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity opacity-100"
        onClick={() => onOpenChange?.(false)}
      />
      
      {/* Drawer Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full sm:w-[47.5vw] sm:max-w-[960px] sm:min-w-[420px] bg-background shadow-2xl border-l border-border/50 transition-transform duration-300 ease-in-out translate-x-0",
          panelClassName
        )}
      >
        <div className="flex h-full flex-col">
          {children}
        </div>
      </div>
    </div>
  )
}

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b px-6 py-4",
        className
      )}
      {...props}
    />
  )
}

const DrawerTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h2
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
}

const DrawerDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

const DrawerClose = ({ onClick }: { onClick?: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  )
}

const DrawerContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto px-6 py-5 sm:px-7 sm:py-6",
        className
      )}
      {...props}
    />
  )
}

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "border-t px-6 py-4",
        className
      )}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
}
