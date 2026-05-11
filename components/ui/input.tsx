import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-10 w-full min-w-0 border-3 border-black bg-white px-3 py-2 text-base font-bold transition-all outline-none file:inline-flex file:h-8 file:border-2 file:border-black file:bg-primary file:text-primary-foreground file:text-sm file:font-bold disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm uppercase tracking-wider',
        'focus-visible:border-black focus-visible:ring-2 focus-visible:ring-primary',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
