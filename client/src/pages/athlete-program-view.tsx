import React, { useMemo } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Calendar, Lock, ChevronRight, Zap, Dumbbell, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import MobileTabBar from "@/components/MobileTabBar";

const getBlockStatusBadge = (status: "active" | "complete" | "planned" | "draft") => {
  const variants: Record<"active" | "complete" | "planned" | "draft", { label: string; className: string }> = {
    active: { label: "Active", className: "bg-green-500/20 text-green-400 border-green-500/30" },
    complete: { label: "Complete", className: "bg-[#979795]/5 text-[#979795] border-transparent" },
    draft: { label: "Draft", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    planned: { label: "Planned", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  };
  const v = variants[status];
  return (
    <Badge variant="outline" className={cn("text-xs font-['Montserrat'] flex items-center gap-1", v.className)}>
      {v.label}
    </Badge>
  );
};

// Routine icons mapping
const routineIcons = {
  movement: Zap,
  strength: Dumbbell,
  throwing: Target,
};

// Mock data for athlete blocks

type MockWeek = {
  week: number;
  startDate: Date;
  endDate: Date;
  completed: boolean;
  routines: ("movement" | "strength" | "throwing")[];
};

type MockBlock = {
  id: string;
  blockNumber: number;
  name: string;
  status: "active" | "complete" | "planned" | "draft";
  startDate: Date;
  endDate: Date;
  duration: number;
  weeks?: MockWeek[];
};

const mockBlocks: MockBlock[] = [
  {
    id: "block-complete-1",
    blockNumber: 1,
    name: "Pre-Season Block 1",
    status: "complete",
    startDate: new Date("2025-09-20"),
    endDate: new Date("2025-10-18"),
    duration: 4,
  },
  {
    id: "block-active-1",
    blockNumber: 2,
    name: "Pre-Season Block 2",
    status: "active",
    startDate: new Date("2025-10-18"),
    endDate: new Date("2025-11-21"),
    duration: 5,
    weeks: [
      { week: 1, startDate: new Date("2025-10-18"), endDate: new Date("2025-10-24"), completed: true, routines: ["movement", "strength", "throwing"] },
      { week: 2, startDate: new Date("2025-10-25"), endDate: new Date("2025-10-31"), completed: true, routines: ["movement", "strength", "throwing"] },
      { week: 3, startDate: new Date("2025-11-01"), endDate: new Date("2025-11-07"), completed: true, routines: ["movement", "strength"] },
      { week: 4, startDate: new Date("2025-11-08"), endDate: new Date("2025-11-14"), completed: false, routines: ["movement", "strength", "throwing"] },
      { week: 5, startDate: new Date("2025-11-15"), endDate: new Date("2025-11-21"), completed: false, routines: ["movement", "throwing"] },
    ],
  },
  {
    id: "block-planned-1",
    blockNumber: 3,
    name: "Pre-Season Block 3",
    status: "planned",
    startDate: new Date("2025-11-27"),
    endDate: new Date("2025-12-25"),
    duration: 4,
  },
];

export default function AthleteProgramView() {
  const [, setLocation] = useLocation();

  // Get blocks - ordered from past to future (by startDate)
  const athleteBlocks = useMemo(() => {
    return [...mockBlocks].sort((a, b) => {
      return a.startDate.getTime() - b.startDate.getTime();
    });
  }, []);

  // Find the active block
  const activeBlock = useMemo(() => {
    return athleteBlocks.find(block => block.status === "active") || null;
  }, [athleteBlocks]);

  return (
    <div className="min-h-screen bg-surface-base pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0d0d0c] pt-3 pb-4">
        <div className="flex items-center h-12 px-4">
          <button 
            onClick={() => setLocation("/athlete/me")}
            className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-[#f7f6f2]" />
          </button>
          <h1 className="text-lg font-semibold text-[#f7f6f2] font-['Montserrat'] ml-2">
            Program
          </h1>
        </div>
      </div>

      {/* Blocks List */}
      <div className="px-4 py-4">
        {athleteBlocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Calendar className="h-12 w-12 text-[#979795] mb-4" />
            <p className="text-lg font-semibold text-[#f7f6f2] font-['Montserrat'] mb-2">
              No blocks found
            </p>
            <p className="text-sm text-[#979795] font-['Montserrat'] text-center">
              You don't have any program blocks yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {athleteBlocks.map((block) => {
              const startDate = block.startDate;
              const endDate = block.endDate;
              const isActive = block.status === "active";
              const isLocked = !isActive;
              
              // Calculate progress for stacked progress bar
              const completedWeeks = block.weeks?.filter(w => w.completed).length || 0;
              const totalWeeks = block.weeks?.length || block.duration;
              const progressPercentage = totalWeeks > 0 ? (completedWeeks / totalWeeks) * 100 : 0;

              return (
                <div
                  key={block.id}
                  className={cn(
                    "bg-[#1C1C1B] rounded-lg p-4",
                    !isActive && "opacity-60"
                  )}
                >
                  {/* Block Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-[#f7f6f2] font-['Montserrat']">
                          {block.name}
                        </h3>
                        {isLocked && (
                          <Lock className="h-4 w-4 text-[#979795]" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#979795] font-['Montserrat']">
                        <span>{format(startDate, "MMM d")}</span>
                        <span>–</span>
                        <span>{format(endDate, "MMM d, yyyy")}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {getBlockStatusBadge(block.status)}
                    </div>
                  </div>

                  {/* Stacked Progress Bar by Weeks */}
                  {isActive && block.weeks && block.weeks.length > 0 && (
                    <div className="mb-3">
                      <div className="flex gap-1 h-2">
                        {block.weeks.map((week, idx) => (
                          <div
                            key={week.week}
                            className={cn(
                              "flex-1 rounded-sm",
                              week.completed 
                                ? "bg-white" 
                                : "bg-[#292928]"
                            )}
                            style={{ width: `${100 / block.weeks!.length}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weeks List inside Block */}
                  {isActive && block.weeks && block.weeks.length > 0 && (
                    <div className="space-y-2">
                      {block.weeks.map((week) => (
                        <div
                          key={week.week}
                          className="bg-[#171716] flex gap-[12px] items-center p-[12px] rounded-[12px] cursor-pointer hover:bg-[#1a1a19] transition-colors"
                          onClick={() => {
                            setLocation(`/athlete/week-page?block=${block.blockNumber}&week=${week.week}`);
                          }}
                        >
                          <div className="flex-1 flex flex-col gap-[4px]">
                            <div className="flex items-center gap-2">
                              <p className="text-[14px] font-semibold text-[#f7f6f2] font-['Montserrat'] leading-[1.46]">
                                Week {week.week}
                              </p>
                            </div>
                            <div className="flex flex-col gap-[2px]">
                              <p className="text-[12px] font-medium text-[#979795] font-['Montserrat'] leading-[1.32]">
                                {format(week.startDate, "MMM d")} – {format(week.endDate, "MMM d")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Routine Icons */}
                            {week.routines && week.routines.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                {week.routines.map((routine) => {
                                  const Icon = routineIcons[routine];
                                  if (!Icon) return null;
                                  return (
                                    <Icon key={routine} className="h-4 w-4 text-[#979795]" />
                                  );
                                })}
                              </div>
                            )}
                            {week.completed && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-[#13b557]/20 rounded-full">
                                <span className="text-[10px] font-medium text-[#13b557] font-['Montserrat']">complete</span>
                              </div>
                            )}
                            <ChevronRight className="w-4 h-4 text-[#979795]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MobileTabBar />
    </div>
  );
}

