"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "size-full flex-1 bg-primary transition-all",
          // value={null} is Radix's indeterminate state. The default indicator
          // only translates by a number, so it would render as an empty bar —
          // sweep a partial bar instead to show work without claiming progress.
          value == null &&
            "w-1/3 flex-none animate-progress-sweep transition-none",
        )}
        style={
          value == null
            ? undefined
            : { transform: `translateX(-${100 - value}%)` }
        }
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
