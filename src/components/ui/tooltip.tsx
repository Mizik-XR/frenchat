
"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root
Tooltip.displayName = TooltipPrimitive.Root.displayName

const TooltipTrigger = TooltipPrimitive.Trigger
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Créer un composant de tooltip composé pour une utilisation plus simple
const ComposedTooltip = ({ children, ...props }: TooltipPrimitive.TooltipProps) => (
  <TooltipProvider>
    <Tooltip {...props}>
      {children}
    </Tooltip>
  </TooltipProvider>
);

// Ajouter les propriétés pour permettre l'utilisation en composants imbriqués
ComposedTooltip.Trigger = TooltipTrigger;
ComposedTooltip.Content = TooltipContent;
ComposedTooltip.Provider = TooltipProvider;

export { ComposedTooltip as Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
