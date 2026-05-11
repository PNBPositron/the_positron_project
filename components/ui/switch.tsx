'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted inline-flex h-6 w-12 shrink-0 items-center border-3 border-black transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={
          'bg-background pointer-events-none block size-4 border-2 border-black transition-transform data-[state=checked]:translate-x-[calc(100%-8px)] data-[state=unchecked]:translate-x-1'
        }
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
