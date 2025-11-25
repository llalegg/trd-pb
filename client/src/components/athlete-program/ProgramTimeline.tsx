import React, { useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, eachDayOfInterval, isSameDay, startOfWeek, differenceInDays, addDays } from "date-fns";
import { Star } from "lucide-react";
import type { Block } from "@shared/schema";
import { getSessionData } from "@/lib/sessionData";

interface ProgramTimelineProps {
  blocks: Block[];
  selectedDay: Date | null;
  onDaySelect: (day: Date) => void;
  keyEvents?: Array<{ date: Date; label: string }>;
}

// Map routine types to letters
const getRoutineLetter = (type: string): string => {
  const typeLower = type.toLowerCase();
  if (typeLower.includes("movement")) return "M";
  if (typeLower.includes("throwing")) return "T";
  if (typeLower.includes("strength") || typeLower.includes("s&c")) return "H";
  if (typeLower.includes("speed")) return "S";
  if (typeLower.includes("recovery")) return "R";
  return "";
};

// Get routine intensity color
const getRoutineIntensityColor = (routine: any): string => {
  if (routine.intensity === "High Intensity" || routine.intensity === "Heavy") {
    return "bg-red-400";
  }
  if (routine.intensity === "Medium Intensity" || routine.intensity === "Light") {
    return "bg-blue-500";
  }
  if (routine.intensity === "Rest") {
    return "bg-green-300";
  }
  return "bg-blue-400";
};

export default function ProgramTimeline({
  blocks,
  selectedDay,
  onDaySelect,
  keyEvents = [],
}: ProgramTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [showLegend, setShowLegend] = React.useState(false);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Calculate date range from blocks
  const dateRange = useMemo(() => {
    if (blocks.length === 0) {
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      const end = new Date(today);
      end.setDate(end.getDate() + 45);
      return { start, end };
    }

    const sortedBlocks = [...blocks].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    const start = new Date(sortedBlocks[0].startDate);
    start.setHours(0, 0, 0, 0);
    
    const lastBlock = sortedBlocks[sortedBlocks.length - 1];
    const end = new Date(lastBlock.endDate);
    end.setHours(0, 0, 0, 0);
    
    // Extend range a bit for better visibility
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 7);
    
    return { start, end };
  }, [blocks, today]);

  // Generate all days in range
  const allDays = useMemo(() => {
    return eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
  }, [dateRange]);

  // Group days by weeks
  const weeks = useMemo(() => {
    const weekGroups: Date[][] = [];
    let currentWeek: Date[] = [];
    let currentWeekStart: Date | null = null;

    allDays.forEach((day) => {
      const weekStart = startOfWeek(day, { weekStartsOn: 1 });
      
      if (!currentWeekStart || weekStart.getTime() !== currentWeekStart.getTime()) {
        if (currentWeek.length > 0) {
          weekGroups.push(currentWeek);
        }
        currentWeek = [day];
        currentWeekStart = weekStart;
      } else {
        currentWeek.push(day);
      }
    });
    
    if (currentWeek.length > 0) {
      weekGroups.push(currentWeek);
    }
    
    return weekGroups;
  }, [allDays]);

  // Get week number for a day
  const getWeekNumber = (day: Date): number | null => {
    const weekStart = startOfWeek(day, { weekStartsOn: 1 });
    const programStart = startOfWeek(dateRange.start, { weekStartsOn: 1 });
    const diffInMs = weekStart.getTime() - programStart.getTime();
    const diffInWeeks = Math.floor(diffInMs / (7 * 24 * 60 * 60 * 1000));
    return diffInWeeks >= 0 ? diffInWeeks + 1 : null;
  };

  // Check if day is a block transition
  const isBlockTransition = (day: Date): boolean => {
    return blocks.some((block) => {
      const blockStart = new Date(block.startDate);
      blockStart.setHours(0, 0, 0, 0);
      return isSameDay(day, blockStart);
    });
  };

  // Get block for a day
  const getBlockForDay = (day: Date): Block | null => {
    return blocks.find((block) => {
      const start = new Date(block.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(block.endDate);
      end.setHours(0, 0, 0, 0);
      return day >= start && day <= end;
    }) || null;
  };

  // Scroll to today on mount
  useEffect(() => {
    if (timelineRef.current && selectedDay) {
      const dayElement = timelineRef.current.querySelector(`[data-day="${selectedDay.toISOString()}"]`);
      if (dayElement) {
        dayElement.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, []);

  // Scroll to selected day
  useEffect(() => {
    if (timelineRef.current && selectedDay) {
      const dayElement = timelineRef.current.querySelector(`[data-day="${selectedDay.toISOString()}"]`);
      if (dayElement) {
        dayElement.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [selectedDay]);

  const handleBlockClick = (block: Block) => {
    const blockStart = new Date(block.startDate);
    blockStart.setHours(0, 0, 0, 0);
    onDaySelect(blockStart);
  };

  const handleTodayClick = () => {
    onDaySelect(today);
  };

  // Get session data for a day
  const getDaySessionData = (day: Date) => {
    const dayOfMonth = day.getDate();
    return getSessionData(dayOfMonth);
  };

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">
          Program timeline
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#979795] font-['Montserrat']">
            {format(dateRange.start, "MMM d")} - {format(dateRange.end, "MMM d")}
          </span>
        </div>
      </div>

      {/* Block Selector Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {blocks.map((block, index) => (
          <Button
            key={block.id}
            variant="outline"
            size="sm"
            onClick={() => handleBlockClick(block)}
            className="h-7 px-3 text-xs border-[#292928] bg-[#171716] text-[#979795] hover:text-[#f7f6f2] hover:bg-[#1C1C1B] font-['Montserrat']"
          >
            {`Block ${block.blockNumber}`}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={handleTodayClick}
          className="h-7 px-3 text-xs border-[#292928] bg-[#171716] text-[#979795] hover:text-[#f7f6f2] hover:bg-[#1C1C1B] font-['Montserrat']"
        >
          Today
        </Button>
      </div>

      {/* Timeline */}
      <div className="border border-[#292928] rounded-lg bg-[#0d0d0c] overflow-x-auto min-h-[200px]" ref={timelineRef}>
        <div className="relative pt-12">
          <div className="flex gap-0 min-w-max">
            {weeks.map((weekDays, weekIndex) => {
              const weekNumber = getWeekNumber(weekDays[0]);
              const isFirstWeek = weekIndex === 0;
              const prevWeek = weekIndex > 0 ? weeks[weekIndex - 1] : null;
              const prevWeekBlock = prevWeek ? getBlockForDay(prevWeek[0]) : null;
              const currentWeekBlock = getBlockForDay(weekDays[0]);
              const showBlockTransition = prevWeekBlock && currentWeekBlock && prevWeekBlock.id !== currentWeekBlock.id;

              return (
                <div key={weekIndex} className="flex gap-0 relative">
                  {/* Block Transition Line */}
                  {showBlockTransition && !isFirstWeek && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-pink-500 z-10" />
                  )}

                  {/* Days in Week */}
                  {weekDays.map((day, dayIndex) => {
                    const isSelected = selectedDay && isSameDay(day, selectedDay);
                    const isToday = isSameDay(day, today);
                    const sessionData = getDaySessionData(day);
                    const hasKeyEvent = keyEvents.some((event) => isSameDay(day, event.date));
                    const dayBlock = getBlockForDay(day);
                    const isWeekStart = dayIndex === 0;
                    const isBlockStart = isBlockTransition(day);
                    const prevDay = dayIndex > 0 ? weekDays[dayIndex - 1] : (weekIndex > 0 ? weeks[weekIndex - 1][weeks[weekIndex - 1].length - 1] : null);
                    const prevDayBlock = prevDay ? getBlockForDay(prevDay) : null;
                    const showBlockLabel = isBlockStart && dayBlock && (!prevDayBlock || prevDayBlock.id !== dayBlock.id);

                    return (
                      <div key={day.toISOString()} className="relative">
                        {/* Block and Week Labels above first day of week */}
                        {isWeekStart && weekNumber && (
                          <div className="absolute -top-6 left-0 flex items-center gap-2 z-10">
                            {/* Block Label (if this is a block start) */}
                            {showBlockLabel && dayBlock && (
                              <span className="text-xs text-[#979795] font-['Montserrat'] font-medium whitespace-nowrap">
                                {`Block ${dayBlock.blockNumber}`}
                              </span>
                            )}
                            {/* Week Label with left border */}
                            <div className="text-xs text-[#f7f6f2] font-['Montserrat'] font-semibold whitespace-nowrap bg-[#0d0d0c] px-1 border-l-2 border-[#292928] pl-2">
                              Week {weekNumber}
                            </div>
                          </div>
                        )}
                        
                        <div
                          data-day={day.toISOString()}
                          onClick={() => onDaySelect(day)}
                          className={cn(
                            "w-[32px] border flex flex-col cursor-pointer transition-all relative min-h-[120px]",
                            "bg-[#171716] border-[#292928]",
                            isSelected && "ring-2 ring-primary border-primary",
                            isToday && !isSelected && "ring-1 ring-primary/50",
                            "hover:bg-[#1C1C1B]"
                          )}
                          style={{ padding: '2px' }}
                        >
                          {/* Date Number */}
                          <div className="text-center mb-2">
                            <div className="text-xs font-semibold text-[#f7f6f2] font-['Montserrat']">
                              {format(day, "d")}
                            </div>
                          </div>

                          {/* Routine Bars */}
                          <div className="flex-1 flex flex-col gap-1">
                            {sessionData.routines.slice(0, 3).map((routine, routineIdx) => {
                              const letter = getRoutineLetter(routine.type);
                              const color = getRoutineIntensityColor(routine);
                              return (
                                <div
                                  key={routineIdx}
                                  className={cn(
                                    "h-4 rounded text-[10px] flex items-center justify-center text-black font-semibold",
                                    color
                                  )}
                                  title={routine.name}
                                >
                                  {letter}
                                </div>
                              );
                            })}
                            {sessionData.routines.length > 3 && (
                              <div className="h-4 rounded bg-[#292928] text-[10px] flex items-center justify-center text-[#979795]">
                                +{sessionData.routines.length - 3}
                              </div>
                            )}
                          </div>

                          {/* Routine Type Indicators (vertical on left) */}
                          {sessionData.routines.length > 0 && (
                            <div className="absolute left-1 top-8 flex flex-col gap-1 text-[8px] text-[#979795] font-['Montserrat']">
                              {sessionData.routines.slice(0, 3).map((routine, idx) => {
                                const letter = getRoutineLetter(routine.type);
                                return (
                                  <div key={idx} className="leading-none">
                                    {letter}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Key Event Star */}
                          {hasKeyEvent && (
                            <div className="absolute top-1 right-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLegend(!showLegend)}
          className="h-7 px-3 text-xs text-[#979795] hover:text-[#f7f6f2] font-['Montserrat']"
        >
          {showLegend ? 'Hide' : 'Show'} Legend
        </Button>
        {showLegend && (
          <div className="flex items-center gap-4 text-xs text-[#979795] font-['Montserrat']">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#292928] rounded" />
              <span>Block 1 (expired)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded" />
              <span>Block 2 (current)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 rounded" />
              <span>Block 3 (upcoming)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

