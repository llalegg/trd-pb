import React, { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { format, eachDayOfInterval, isSameDay, startOfWeek, differenceInDays, addDays, isBefore, isAfter } from "date-fns";
import { Star, CheckCircle, CheckCircle2, Camera, Flag, FileText, Plus, ChevronDown, ChevronRight } from "lucide-react";
import type { Block } from "@shared/schema";
import { getSessionData } from "@/lib/sessionData";

interface ProgramTimelineProps {
  blocks: Block[];
  selectedDay: Date | null;
  onDaySelect: (day: Date) => void;
  keyEvents?: Array<{ date: Date; label: string }>;
  onCreateBlock?: (date: Date) => void;
  keyDates?: Array<{ date: Date; label: string; type: string }>;
  dayStatuses?: Map<string, { hasData: boolean; isComplete: boolean; hasMedia: boolean; flagged: boolean; hasNote: boolean }>;
  phases?: Array<{ phaseNumber: number; blocks: Block[] }>;
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

// Get tooltip text for routine type letters
const getRoutineTooltip = (letter: string): string => {
  switch (letter) {
    case "M":
      return "Movement";
    case "T":
      return "Throwing";
    case "H":
      return "Heavy / Strength & Conditioning";
    case "S":
      return "Speed";
    case "R":
      return "Recovery";
    default:
      return "";
  }
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

// Mock special events (same for all athletes, only for this view)
const getMockSpecialEvents = (): Array<{ date: Date; label: string; type: string }> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return [
    {
      date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from today
      label: "Game vs. Red Sox",
      type: "game"
    },
    {
      date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from today
      label: "Movement Assessment",
      type: "assessment"
    },
    {
      date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from today
      label: "Game vs. Yankees",
      type: "game"
    },
    {
      date: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days from today
      label: "Velocity Testing",
      type: "assessment"
    },
    {
      date: new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000), // 28 days from today
      label: "Game vs. Blue Jays",
      type: "game"
    },
  ].map(event => {
    const date = new Date(event.date);
    date.setHours(0, 0, 0, 0);
    return { ...event, date };
  });
};

export default function ProgramTimeline({
  blocks,
  selectedDay,
  onDaySelect,
  keyEvents = [],
  onCreateBlock,
  keyDates = [],
  dayStatuses,
  phases,
}: ProgramTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Combine keyEvents with mock special events
  const mockEvents = useMemo(() => getMockSpecialEvents(), []);
  const allEvents = useMemo(() => {
    const combined = [...keyEvents.map(e => ({ ...e, type: "other" })), ...mockEvents];
    return combined.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [keyEvents, mockEvents]);

  // Sort blocks by startDate to ensure sequential order
  const sortedBlocks = useMemo(() => {
    return [...blocks].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [blocks]);

  // Group blocks by phase
  const blocksByPhase = useMemo(() => {
    if (phases && phases.length > 0) {
      return phases;
    }
    // Fallback: group by phaseNumber if available, otherwise single phase
    const phaseMap = new Map<number, Block[]>();
    sortedBlocks.forEach(block => {
      const phaseNum = (block as any).phaseNumber || 1;
      if (!phaseMap.has(phaseNum)) {
        phaseMap.set(phaseNum, []);
      }
      phaseMap.get(phaseNum)!.push(block);
    });
    return Array.from(phaseMap.entries()).map(([phaseNumber, blocks]) => ({
      phaseNumber,
      blocks,
    }));
  }, [sortedBlocks, phases]);

  // Calculate date range from blocks
  const dateRange = useMemo(() => {
    if (sortedBlocks.length === 0) {
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      const end = new Date(today);
      end.setDate(end.getDate() + 45);
      return { start, end };
    }

    const start = new Date(sortedBlocks[0].startDate);
    start.setHours(0, 0, 0, 0);
    
    const lastBlock = sortedBlocks[sortedBlocks.length - 1];
    const end = new Date(lastBlock.endDate);
    end.setHours(0, 0, 0, 0);
    
    // Extend range a bit for better visibility
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 7);
    
    return { start, end };
  }, [sortedBlocks, today]);

  // Find last programmed day
  const lastProgrammedDay = useMemo(() => {
    if (sortedBlocks.length === 0) return null;
    const lastBlock = sortedBlocks[sortedBlocks.length - 1];
    return new Date(lastBlock.endDate);
  }, [sortedBlocks]);

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

  // Get week number for a day (calculated per block)
  const getWeekNumber = useCallback((day: Date, block: Block | null): number | null => {
    if (!block) return null;
    const blockStart = startOfWeek(new Date(block.startDate), { weekStartsOn: 1 });
    const weekStart = startOfWeek(day, { weekStartsOn: 1 });
    const diffInMs = weekStart.getTime() - blockStart.getTime();
    const diffInWeeks = Math.floor(diffInMs / (7 * 24 * 60 * 60 * 1000));
    return diffInWeeks >= 0 ? diffInWeeks + 1 : null;
  }, []);

  // Get day number within block (1-indexed)
  const getDayNumber = (day: Date, block: Block | null): number | null => {
    if (!block) return null;
    const blockStart = new Date(block.startDate);
    blockStart.setHours(0, 0, 0, 0);
    const dayDate = new Date(day);
    dayDate.setHours(0, 0, 0, 0);
    if (dayDate < blockStart) return null;
    const diffInDays = Math.floor((dayDate.getTime() - blockStart.getTime()) / (24 * 60 * 60 * 1000));
    return diffInDays + 1; // 1-indexed
  };

  // Check if day is a block transition
  const isBlockTransition = (day: Date): boolean => {
    return sortedBlocks.some((block) => {
      const blockStart = new Date(block.startDate);
      blockStart.setHours(0, 0, 0, 0);
      return isSameDay(day, blockStart);
    });
  };

  // Check if day is a phase transition
  const isPhaseTransition = (day: Date): boolean => {
    if (blocksByPhase.length <= 1) return false;
    return blocksByPhase.some((phase) => {
      if (phase.blocks.length === 0) return false;
      const phaseStart = new Date(phase.blocks[0].startDate);
      phaseStart.setHours(0, 0, 0, 0);
      return isSameDay(day, phaseStart);
    });
  };

  // Get block for a day
  const getBlockForDay = (day: Date): Block | null => {
    return sortedBlocks.find((block) => {
      const start = new Date(block.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(block.endDate);
      end.setHours(0, 0, 0, 0);
      return day >= start && day <= end;
    }) || null;
  };

  // Check if day is expired (before today)
  const isExpired = (day: Date): boolean => {
    return isBefore(day, today);
  };

  // Check if day is the day after last programmed day
  const isAfterLastProgrammed = (day: Date): boolean => {
    if (!lastProgrammedDay) return false;
    const nextDay = addDays(lastProgrammedDay, 1);
    return isSameDay(day, nextDay);
  };

  // Get day status
  const getDayStatus = (day: Date) => {
    const dayKey = format(day, "yyyy-MM-dd");
    return dayStatuses?.get(dayKey) || {
      hasData: false,
      isComplete: false,
      hasMedia: false,
      flagged: false,
      hasNote: false,
    };
  };

  // Check if day has key date
  const hasKeyDate = (day: Date): { label: string; type: string } | null => {
    const found = keyDates.find(kd => isSameDay(kd.date, day));
    return found || null;
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

  const handlePhaseSelect = (phaseNumber: number) => {
    setSelectedPhase(phaseNumber);
    const phase = blocksByPhase.find(p => p.phaseNumber === phaseNumber);
    if (phase && phase.blocks.length > 0) {
      const firstBlockStart = new Date(phase.blocks[0].startDate);
      firstBlockStart.setHours(0, 0, 0, 0);
      onDaySelect(firstBlockStart);
    }
  };

  // Initialize expanded blocks (all expanded by default)
  useEffect(() => {
    if (sortedBlocks.length > 0 && expandedBlocks.size === 0) {
      const allBlockIds = new Set(sortedBlocks.map(b => b.id));
      setExpandedBlocks(allBlockIds);
    }
  }, [sortedBlocks, expandedBlocks.size]);

  // Group days by block and week for list view
  const daysByBlockAndWeek = useMemo(() => {
    const result: Array<{
      block: Block;
      weeks: Array<{
        weekNumber: number;
        days: Date[];
      }>;
    }> = [];

    sortedBlocks.forEach((block) => {
      const blockStart = new Date(block.startDate);
      blockStart.setHours(0, 0, 0, 0);
      const blockEnd = new Date(block.endDate);
      blockEnd.setHours(0, 0, 0, 0);

      // Get all days in this block
      const blockDays = allDays.filter((day) => {
        const dayDate = new Date(day);
        dayDate.setHours(0, 0, 0, 0);
        return dayDate >= blockStart && dayDate <= blockEnd;
      });

      // Group days by week within this block
      const weekMap = new Map<number, Date[]>();
      blockDays.forEach((day) => {
        const weekNumber = getWeekNumber(day, block);
        if (weekNumber !== null) {
          if (!weekMap.has(weekNumber)) {
            weekMap.set(weekNumber, []);
          }
          weekMap.get(weekNumber)!.push(day);
        }
      });

      // Convert to array and sort by week number
      const weeks = Array.from(weekMap.entries())
        .map(([weekNumber, days]) => ({
          weekNumber,
          days: days.sort((a, b) => a.getTime() - b.getTime()),
        }))
        .sort((a, b) => a.weekNumber - b.weekNumber);

      result.push({ block, weeks });
    });

    return result;
  }, [sortedBlocks, allDays, getWeekNumber]);

  // Toggle block expansion
  const toggleBlock = (blockId: string) => {
    setExpandedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(blockId)) {
        next.delete(blockId);
      } else {
        next.add(blockId);
      }
      return next;
    });
  };

  // Toggle week expansion
  const toggleWeek = (weekKey: string) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekKey)) {
        next.delete(weekKey);
      } else {
        next.add(weekKey);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">
          Program timeline
        </h3>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "calendar" | "list")}>
            <TabsList className="bg-[#171716] border border-[#292928] h-7">
              <TabsTrigger
                value="calendar"
                className="data-[state=active]:bg-[#1C1C1B] data-[state=active]:text-[#f7f6f2] text-[#979795] px-3 text-xs font-['Montserrat']"
              >
                Calendar
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className="data-[state=active]:bg-[#1C1C1B] data-[state=active]:text-[#f7f6f2] text-[#979795] px-3 text-xs font-['Montserrat']"
              >
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <span className="text-xs text-[#979795] font-['Montserrat']">
            {format(dateRange.start, "MMM d")} - {format(dateRange.end, "MMM d")}
          </span>
        </div>
      </div>

      {/* Phase Selector */}
      {blocksByPhase.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          {blocksByPhase.map((phase) => (
            <div key={phase.phaseNumber} className="flex items-center gap-1">
              <span className="text-xs text-[#979795] font-['Montserrat']">
                Phase {phase.phaseNumber}:
              </span>
              {phase.blocks.map((block, idx) => (
                <React.Fragment key={block.id}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBlockClick(block)}
                    className="h-6 px-2 text-xs text-[#979795] hover:text-[#f7f6f2] font-['Montserrat']"
                  >
                    {block.blockNumber}
                  </Button>
                  {idx < phase.blocks.length - 1 && (
                    <span className="text-xs text-[#979795]">|</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Block Selector Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {sortedBlocks.map((block) => (
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
          variant="default"
          size="sm"
          onClick={handleTodayClick}
          className="h-7 px-3 text-xs font-['Montserrat']"
        >
          Today
        </Button>
      </div>

      {/* Timeline */}
      {viewMode === "calendar" && (
        <div className="border border-[#292928] rounded-lg bg-[#0d0d0c] overflow-x-auto min-h-[200px]" ref={timelineRef}>
          <div className="relative pt-12">
            <div className="flex gap-0 min-w-max">
              {weeks.map((weekDays, weekIndex) => {
                const currentWeekBlock = getBlockForDay(weekDays[0]);
                const weekNumber = getWeekNumber(weekDays[0], currentWeekBlock);
                const dayNumber = getDayNumber(weekDays[0], currentWeekBlock);
                const isFirstWeek = weekIndex === 0;
                const prevWeek = weekIndex > 0 ? weeks[weekIndex - 1] : null;
                const prevWeekBlock = prevWeek ? getBlockForDay(prevWeek[0]) : null;
                const showBlockTransition = prevWeekBlock && currentWeekBlock && prevWeekBlock.id !== currentWeekBlock.id;
                const showPhaseTransition = prevWeekBlock && currentWeekBlock && isPhaseTransition(weekDays[0]);

                return (
                  <div key={weekIndex} className="flex gap-0 relative">
                    {/* Phase Transition Line (double line) */}
                    {showPhaseTransition && !isFirstWeek && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 z-10 flex flex-col justify-center gap-0.5">
                        <div className="h-0.5 bg-amber-500" />
                        <div className="h-0.5 bg-amber-500" />
                      </div>
                    )}
                    
                    {/* Block Transition Line (thick solid) */}
                    {showBlockTransition && !showPhaseTransition && !isFirstWeek && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500 z-10" />
                    )}

                    {/* Week Separation (subtle spacing) */}
                    {!isFirstWeek && !showBlockTransition && (
                      <div className="absolute left-0 top-0 bottom-0 w-px bg-[#292928]/50 z-0" />
                    )}

                    {/* Days in Week */}
                    {weekDays.map((day, dayIndex) => {
                      const isSelected = selectedDay && isSameDay(day, selectedDay);
                      const isToday = isSameDay(day, today);
                      const expired = isExpired(day);
                      const sessionData = getDaySessionData(day);
                      const hasKeyEvent = allEvents.some((event) => isSameDay(day, event.date));
                      const dayBlock = getBlockForDay(day);
                      const isWeekStart = dayIndex === 0;
                      const isBlockStart = isBlockTransition(day);
                      const prevDay = dayIndex > 0 ? weekDays[dayIndex - 1] : (weekIndex > 0 ? weeks[weekIndex - 1][weeks[weekIndex - 1].length - 1] : null);
                      const prevDayBlock = prevDay ? getBlockForDay(prevDay) : null;
                      const showBlockLabel = isBlockStart && dayBlock && (!prevDayBlock || prevDayBlock.id !== dayBlock.id);
                      const dayStatus = getDayStatus(day);
                      const keyDate = hasKeyDate(day);
                      const showEmptyIndicator = isAfterLastProgrammed(day);

                      return (
                        <div key={day.toISOString()} className="relative">
                          {/* Block and Week Labels above first day of week */}
                          {isWeekStart && weekNumber && dayNumber && (
                            <div className="absolute -top-6 left-0 flex items-center gap-2 z-10">
                              {/* Block Label (if this is a block start) */}
                              {showBlockLabel && dayBlock && (
                                <span className="text-xs text-[#979795] font-['Montserrat'] font-medium whitespace-nowrap">
                                  {`Block ${dayBlock.blockNumber}`}
                                </span>
                              )}
                              {/* Week Label with left border */}
                              <div className="text-xs text-[#f7f6f2] font-['Montserrat'] font-semibold whitespace-nowrap bg-[#0d0d0c] px-1 border-l-2 border-[#292928] pl-2">
                                Week {weekNumber}, Day {dayNumber}
                              </div>
                            </div>
                          )}
                          
                          <div
                            data-day={day.toISOString()}
                            onClick={() => onDaySelect(day)}
                            className={cn(
                              "w-[32px] border flex flex-col cursor-pointer transition-all relative min-h-[120px]",
                              expired ? "bg-[#1a1a19] border-[#292928]" : "bg-[#171716] border-[#292928]",
                              isSelected && "ring-2 ring-amber-500 border-amber-500 border-r-2 border-r-dashed bg-gradient-to-r from-amber-500/20 to-transparent",
                              isToday && !isSelected && "ring-1 ring-primary/50",
                              "hover:bg-[#1C1C1B]",
                              keyDate && "border-b-2 border-b-amber-500"
                            )}
                            style={{ padding: '2px' }}
                          >
                            {/* Date Number */}
                            <div className="text-center mb-2">
                              <div className={cn(
                                "text-xs font-semibold font-['Montserrat']",
                                expired ? "text-[#979795]" : "text-[#f7f6f2]"
                              )}>
                                {format(day, "d")}
                              </div>
                            </div>

                          {/* Routine Bars */}
                          <div className="flex-1 flex flex-col gap-1">
                            {sessionData.routines.slice(0, 3).map((routine, routineIdx) => {
                              const letter = getRoutineLetter(routine.type);
                              const color = getRoutineIntensityColor(routine);
                              const tooltipText = letter ? `${getRoutineTooltip(letter)}: ${routine.name}` : routine.name;
                              return (
                                <div
                                  key={routineIdx}
                                  className={cn(
                                    "h-4 rounded text-[10px] flex items-center justify-center text-black font-semibold",
                                    color
                                  )}
                                  title={tooltipText}
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

                          {/* Day Status Icons */}
                          <div className="absolute top-1 right-1 flex flex-col gap-0.5 items-end">
                            {dayStatus.hasData && (
                              dayStatus.isComplete ? (
                                <CheckCircle2 className="h-2.5 w-2.5 text-green-400 fill-green-400" />
                              ) : (
                                <CheckCircle className="h-2.5 w-2.5 text-green-400" />
                              )
                            )}
                            {dayStatus.hasMedia && (
                              <Camera className="h-2.5 w-2.5 text-blue-400" />
                            )}
                            {dayStatus.flagged && (
                              <Flag className="h-2.5 w-2.5 text-red-400 fill-red-400" />
                            )}
                            {dayStatus.hasNote && (
                              <FileText className="h-2.5 w-2.5 text-amber-400" />
                            )}
                          </div>

                          {/* Empty Programming Indicator */}
                          {showEmptyIndicator && onCreateBlock && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#171716]/80 rounded">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onCreateBlock(day);
                                }}
                                className="h-6 w-6 text-[#979795] hover:text-[#f7f6f2]"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          )}

                          {/* Key Event Star */}
                          {hasKeyEvent && (
                            <div className="absolute bottom-1 right-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            </div>
                          )}
                          
                          {/* Key Date Indicator */}
                          {keyDate && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
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
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="border border-[#292928] rounded-lg bg-[#0d0d0c] overflow-y-auto max-h-[600px]">
          <div className="divide-y divide-[#292928]">
            {daysByBlockAndWeek.map(({ block, weeks }) => {
              const isBlockExpanded = expandedBlocks.has(block.id);
              const blockStart = new Date(block.startDate);
              const blockEnd = new Date(block.endDate);
              const dateRangeStr = `${format(blockStart, "MMM d")} - ${format(blockEnd, "MMM d, yyyy")}`;

              return (
                <Collapsible
                  key={block.id}
                  open={isBlockExpanded}
                  onOpenChange={() => toggleBlock(block.id)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between px-4 py-3 hover:bg-[#171716] transition-colors">
                      <div className="flex items-center gap-3">
                        {isBlockExpanded ? (
                          <ChevronDown className="h-4 w-4 text-[#979795]" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-[#979795]" />
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">
                            Block {block.blockNumber}
                          </span>
                          <span className="text-xs text-[#979795] font-['Montserrat']">
                            {dateRangeStr}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-[#979795] font-['Montserrat']">
                        {weeks.reduce((sum, week) => sum + week.days.length, 0)} days
                      </span>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="divide-y divide-[#292928]/50">
                      {weeks.map((week) => {
                        const weekKey = `${block.id}-week-${week.weekNumber}`;
                        const isWeekExpanded = expandedWeeks.has(weekKey) || true; // Weeks expanded by default

                        return (
                          <div key={weekKey} className="bg-[#171716]/30">
                            {/* Week Header */}
                            <div className="px-8 py-2 border-b border-[#292928]/30">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-[#979795] font-['Montserrat'] uppercase tracking-wide">
                                  Week {week.weekNumber}
                                </span>
                                <span className="text-xs text-[#979795] font-['Montserrat']">
                                  ({week.days.length} days)
                                </span>
                              </div>
                            </div>

                            {/* Days in Week */}
                            <div className="divide-y divide-[#292928]/30">
                              {week.days.map((day) => {
                                const isSelected = selectedDay && isSameDay(day, selectedDay);
                                const expired = isExpired(day);
                                const sessionData = getDaySessionData(day);
                                const dayStatus = getDayStatus(day);
                                const keyDate = hasKeyDate(day);
                                const dayBlock = getBlockForDay(day);
                                const dayNumber = getDayNumber(day, dayBlock);
                                const dayOfWeek = format(day, "EEE");
                                const dayDate = format(day, "MMM d, yyyy");

                                return (
                                  <div
                                    key={day.toISOString()}
                                    onClick={() => onDaySelect(day)}
                                    className={cn(
                                      "px-8 py-3 flex items-center justify-between cursor-pointer transition-colors",
                                      isSelected && "bg-gradient-to-r from-amber-500/20 to-transparent border-l-4 border-l-amber-500",
                                      !isSelected && "hover:bg-[#171716]/50",
                                      expired && !isSelected && "bg-[#1a1a19]"
                                    )}
                                  >
                                    {/* Left: Date and Day Number */}
                                    <div className="flex items-center gap-4">
                                      <div className="flex flex-col">
                                        <span className={cn(
                                          "text-sm font-medium font-['Montserrat']",
                                          expired ? "text-[#979795]" : "text-[#f7f6f2]"
                                        )}>
                                          {dayOfWeek}, {dayDate}
                                        </span>
                                        {dayNumber && (
                                          <span className="text-xs text-[#979795] font-['Montserrat']">
                                            Day {dayNumber}
                                          </span>
                                        )}
                                      </div>
                                      {keyDate && (
                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded">
                                          <Star className="h-3 w-3 text-amber-400" />
                                          <span className="text-xs text-amber-400 font-['Montserrat']">
                                            {keyDate.label}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Middle: Routine Badges */}
                                    <div className="flex items-center gap-2">
                                      {sessionData.routines.length > 0 ? (
                                        sessionData.routines.slice(0, 3).map((routine, idx) => {
                                          const letter = getRoutineLetter(routine.type);
                                          const color = getRoutineIntensityColor(routine);
                                          const tooltipText = letter ? `${getRoutineTooltip(letter)}: ${routine.name}` : routine.name;
                                          return (
                                            <div
                                              key={idx}
                                              className={cn(
                                                "w-6 h-6 rounded text-[10px] flex items-center justify-center text-black font-semibold",
                                                color
                                              )}
                                              title={tooltipText}
                                            >
                                              {letter}
                                            </div>
                                          );
                                        })
                                      ) : (
                                        <span className="text-xs text-[#979795] font-['Montserrat']">No routines</span>
                                      )}
                                      {sessionData.routines.length > 3 && (
                                        <span className="text-xs text-[#979795] font-['Montserrat']">
                                          +{sessionData.routines.length - 3}
                                        </span>
                                      )}
                                    </div>

                                    {/* Right: Status Icons */}
                                    <div className="flex items-center gap-2">
                                      {dayStatus.hasData && (
                                        dayStatus.isComplete ? (
                                          <CheckCircle2 className="h-4 w-4 text-green-400 fill-green-400" />
                                        ) : (
                                          <CheckCircle className="h-4 w-4 text-green-400" />
                                        )
                                      )}
                                      {dayStatus.hasMedia && (
                                        <Camera className="h-4 w-4 text-blue-400" />
                                      )}
                                      {dayStatus.flagged && (
                                        <Flag className="h-4 w-4 text-red-400 fill-red-400" />
                                      )}
                                      {dayStatus.hasNote && (
                                        <FileText className="h-4 w-4 text-amber-400" />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLegend(!showLegend)}
          className="h-7 px-3 text-xs border-[#292928] bg-[#171716] text-[#979795] hover:text-[#f7f6f2] hover:bg-[#1C1C1B] hover:underline font-['Montserrat']"
        >
          {showLegend ? 'Hide' : 'Show'} Legend
        </Button>
        {showLegend && (
          <div className="space-y-4">
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
            
            {/* Special Events List */}
            {allEvents.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-[#f7f6f2] font-['Montserrat'] uppercase tracking-wide">
                  Special Events
                </h4>
                <div className="space-y-1.5">
                  {allEvents.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs text-[#979795] font-['Montserrat']"
                    >
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                      <span className="text-[#f7f6f2]">{event.label}</span>
                      <span className="ml-auto">{format(event.date, "MMM d")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

