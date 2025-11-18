import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "rounded-2xl border border-white/5 bg-[#080808] p-4 text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]",
        className
      )}
      classNames={{
        months:
          "flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between w-full",
        month: "flex-1 space-y-4",
        caption: "flex items-center justify-between px-1",
        caption_label: "text-sm font-semibold tracking-wide",
        nav: "flex items-center gap-2",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-separate border-spacing-y-1",
        head_row: "grid grid-cols-7 text-xs font-medium uppercase tracking-wide text-white/60 px-1",
        head_cell: "text-center",
        row: "grid grid-cols-7 gap-y-1 px-1",
        cell: "relative aspect-square",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-full w-full rounded-2xl text-sm font-medium transition-colors duration-200 aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-white text-black shadow-[0_12px_35px_rgba(255,255,255,0.25)] hover:bg-white",
        day_today:
          "border border-white/70 text-white font-semibold shadow-[0_6px_18px_rgba(255,255,255,0.25)]",
        day_outside: "text-white/20",
        day_disabled: "text-muted-foreground opacity-40",
        day_range_middle: "bg-white/15 text-white",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
