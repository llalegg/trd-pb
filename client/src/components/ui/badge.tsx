import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  // Whitespace-nowrap: Badges should never wrap.
  "whitespace-nowrap inline-flex items-center gap-1.5 rounded-full px-[8px] h-[20px] text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-0",
  {
    variants: {
      variant: {
        default:
          "bg-white text-black",
        secondary: "bg-[#979795] text-[#f7f6f2]",
        tertiary: "bg-[#0d0d0c] text-[#f7f6f2]",
        destructive:
          "bg-destructive text-destructive-foreground",
        outline: "border-0 shadow-xs",
        neutral: "!bg-transparent !box-border !flex !items-center !justify-center !px-[8px] !h-[20px] !rounded-full !text-xs !font-['Montserrat'] !font-medium !leading-[1.32] !text-center !whitespace-nowrap !text-[#979795] !gap-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

function Badge({ className, variant, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </div>
  );
}

export { Badge, badgeVariants }
