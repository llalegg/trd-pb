import React, { useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { addDays, isWithinInterval, startOfWeek, format } from "date-fns";

type Block = { name: string; startDate: Date; endDate: Date };
type ActiveProgram = { programId: string; startDate: Date; endDate: Date };
type KeyEvent = { date: Date; label: string; tone?: "info" | "warning" | "success" };

interface HorizontalCalendarProps {
  startDate: Date | null;
  endDate: Date | null;
  blocks?: Block[];
  activePrograms?: ActiveProgram[];
  selectedAthletePhaseEndDate?: string | null;
  keyEvents?: KeyEvent[];
}

export default function HorizontalCalendar({
  startDate,
  endDate,
  blocks = [],
  activePrograms = [],
  selectedAthletePhaseEndDate,
  keyEvents = [],
}: HorizontalCalendarProps) {
  const calendarScrollRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    if (calendarScrollRef.current) {
      calendarScrollRef.current.scrollLeft = 0;
    }
  }, []);

  const rangeLabel = useMemo(() => {
    if (!startDate || !endDate) return null;
    return `${startDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} - ${endDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
  }, [startDate, endDate]);

  const keyEventToneToClass = (tone: KeyEvent["tone"]) => {
    switch (tone) {
      case "warning":
        return "bg-[#402f14] text-[#FEC84B]";
      case "success":
        return "bg-[#213725] text-[#4ade80]";
      default:
        return "bg-[#1e2b3a] text-[#7CD4FD]";
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-[11px] text-[#979795] font-['Montserrat'] py-2">
        <span>{rangeLabel || "Select start date to view calendar"}</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-[#979795] hover:text-[#f7f6f2] font-['Montserrat']"
            >
              <Info className="h-3 w-3 mr-1" />
              Legend
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3 z-[60]" align="end" side="top">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold font-['Montserrat']">Legend</h4>
              <div className="space-y-1 text-xs text-[#979795] font-['Montserrat']">
                <div>Blue bars: Blocks</div>
                <div>Blue tint: Program duration</div>
                <div>Striped: Existing programming</div>
                <div>Dashed orange: Phase boundary</div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="overflow-x-auto" ref={calendarScrollRef}>
        <div className="flex gap-2 min-w-max pb-2">
            {(() => {
              if (!startDate) {
                return (
                  <div className="w-full text-center py-8 text-xs text-[#979795]">
                    Please select a start date to view the calendar
                  </div>
                );
              }

              const start = new Date(startDate);
              start.setHours(0, 0, 0, 0);
              const end = endDate ? new Date(endDate) : addDays(start, 60);

              const days: Date[] = [];
              let currentDate = new Date(start);
              while (currentDate <= end) {
                days.push(new Date(currentDate));
                currentDate = addDays(currentDate, 1);
              }

              const blockColors = [
                "bg-blue-500",
                "bg-blue-600",
                "bg-blue-400",
                "bg-blue-700",
                "bg-blue-300",
                "bg-blue-800",
              ];
              const getBlockColor = (index: number) => blockColors[index % blockColors.length];

              const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
              const getWeekNumber = (day: Date) => {
                if (!startDate) return null;
                const weekStart = startOfWeek(day, { weekStartsOn: 1 });
                const programStart = startOfWeek(startDate, { weekStartsOn: 1 });
                const diffInMs = weekStart.getTime() - programStart.getTime();
                const diffInWeeks = Math.floor(diffInMs / (7 * 24 * 60 * 60 * 1000));
                return diffInWeeks >= 0 ? diffInWeeks + 1 : null;
              };
              let currentWeekNumber: number | null = null;

              return days.map((day, dayIndex) => {
                const dayOfWeek = day.getDay();
                const dayName = format(day, "EEE");
                const isWeekStart = dayOfWeek === 1;
                const weekNumber = getWeekNumber(day);
                const showWeekLabel = isWeekStart && weekNumber !== null && weekNumber !== currentWeekNumber;
                if (showWeekLabel) currentWeekNumber = weekNumber;

                const isInProgramDuration =
                  startDate && endDate && isWithinInterval(day, { start: startDate, end: endDate });
                const isProgramStart = startDate && isSameDay(day, startDate);

                const existingProgram = activePrograms.find((p) =>
                  isWithinInterval(day, { start: p.startDate, end: p.endDate })
                );
                const isPhaseBoundary =
                  selectedAthletePhaseEndDate &&
                  isSameDay(day, new Date(selectedAthletePhaseEndDate));

                const dayBlocks = blocks.filter((b) =>
                  isWithinInterval(day, { start: b.startDate, end: b.endDate })
                );
                const dayEvents = keyEvents.filter(event => isSameDay(day, event.date));

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "w-[150px] min-h-[160px] rounded-2xl border border-[#1f1f1e] p-4 flex flex-col relative shrink-0",
                      "bg-[#0b0b0a]",
                      isPhaseBoundary && "border-l-2 border-l-orange-500 border-dashed"
                    )}
                  >
                    {showWeekLabel && (
                      <div className="absolute top-2 left-3 bg-muted/80 text-[11px] font-medium px-2 py-0.5 rounded z-20 whitespace-nowrap">
                        Week {weekNumber}
                      </div>
                    )}

                    {isInProgramDuration && (
                      <div className="absolute inset-0 bg-blue-500/20 pointer-events-none rounded-md" />
                    )}

                    {existingProgram && (
                      <div
                        className="absolute inset-0 opacity-30 pointer-events-none rounded-md"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(45deg, #808080, #808080 10px, transparent 10px, transparent 20px)",
                        }}
                      />
                    )}

                    <div className="flex flex-col mb-3 relative z-10">
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{dayName}</div>
                      <div className="text-2xl font-semibold text-white leading-none">{format(day, "d")}</div>
                      <div className="text-xs text-muted-foreground">{format(day, "MMM")}</div>
                    </div>

                    {isProgramStart && (
                      <div className="absolute top-1 right-1 z-10 bg-blue-500/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                        Start
                      </div>
                    )}

                    <div className="flex-1 flex flex-col gap-1.5 relative z-10">
                      {dayBlocks.slice(0, 3).map((b, idx) => {
                        const isStart = isSameDay(day, b.startDate);
                        const isEnd = isSameDay(day, b.endDate);
                        const blockIndex = blocks.findIndex((blk) => blk.name === b.name);
                        const blockColor = getBlockColor(blockIndex);
                        return (
                          <div
                            key={`${b.name}-${idx}`}
                            className={cn(
                              "h-5 rounded-sm text-[10px] px-1 text-black flex items-center",
                              blockColor
                            )}
                            title={`${b.name}: ${format(b.startDate, "MMM d")} - ${format(
                              b.endDate,
                              "MMM d"
                            )}`}
                          >
                            {isStart && <span className="truncate mr-1">{b.name}</span>}
                            {!isStart && !isEnd && <span className="opacity-70">•</span>}
                            {isEnd && <span className="opacity-70 ml-auto">↘</span>}
                          </div>
                        );
                      })}
                      {dayBlocks.length > 3 && (
                        <div className="h-5 rounded-sm text-[10px] px-1 bg-muted text-muted-foreground flex items-center justify-center">
                          +{dayBlocks.length - 3} more
                        </div>
                      )}
                    </div>
                    {dayEvents.length > 0 && (
                      <div className="mt-3 space-y-1 relative z-10">
                        {dayEvents.map(event => (
                          <div
                            key={`${event.label}-${event.date.toISOString()}`}
                            className={cn(
                              "text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1",
                              keyEventToneToClass(event.tone)
                            )}
                          >
                            {event.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
  );
}


