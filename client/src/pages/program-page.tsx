 import { useState, useMemo } from "react";
import TopBar from "@/components/athlete-program/TopBar";
import AthleteInfoSidebar from "@/components/blocks/AthleteInfoSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { format, differenceInWeeks, addDays, startOfWeek, endOfWeek, isWithinInterval, getDay, startOfMonth, endOfMonth, addMonths, eachDayOfInterval } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { type Program, type AthleteWithPhase, type Block } from "@shared/schema";
import { getSessionData } from "@/lib/sessionData";

// Generate blocks from program
const generateBlocks = (program: Program) => {
  const startDate = new Date(program.startDate);
  const endDate = new Date(program.endDate);
  const totalWeeks = program.blockDuration;
  
  const blocks = [];
  const weeksPerBlock = Math.ceil(totalWeeks / 4); // Assuming 4 blocks
  
  for (let blockIdx = 0; blockIdx < 4; blockIdx++) {
    const blockStartDate = new Date(startDate);
    blockStartDate.setDate(startDate.getDate() + (blockIdx * weeksPerBlock * 7));
    
    let blockEndDate = new Date(blockStartDate);
    blockEndDate.setDate(blockStartDate.getDate() + (weeksPerBlock * 7) - 1);
    
    if (blockEndDate > endDate) {
      blockEndDate = new Date(endDate);
    }
    
    blocks.push({
      id: blockIdx + 1,
      name: `Block ${blockIdx + 1}`,
      startDate: blockStartDate,
      endDate: blockEndDate,
    });
  }
  
  return blocks;
};

export default function ProgramPage() {
  const [location, setLocation] = useLocation();
  const [selectedBlockIndex, setSelectedBlockIndex] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const detailsPanelWidth = 320;
  
  // Get block ID from URL params safely
  const blockId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('blockId') || params.get('id'); // Support both blockId and id for backward compatibility
  }, [location]);
  
  // Fetch athletes data to find the block
  const { data: athletesData, isLoading } = useQuery<AthleteWithPhase[]>({
    queryKey: ["/api/athletes"],
    enabled: !!blockId,
  });

  // Find the block and athlete from athletes data
  const blockData = useMemo(() => {
    if (!athletesData || !blockId) return null;
    
    for (const athleteData of athletesData) {
      const block = athleteData.blocks.find(b => b.id === blockId);
      if (block) {
        return { block, athlete: athleteData.athlete, allBlocks: athleteData.blocks };
      }
    }
    return null;
  }, [athletesData, blockId]);

  // Generate blocks for display (use all blocks from athlete, or generate from block if needed)
  const blocks = blockData ? blockData.allBlocks.map((b, idx) => ({
    id: idx + 1,
    name: b.name,
    startDate: new Date(b.startDate),
    endDate: new Date(b.endDate),
  })) : [];
  
  // Find the index of the current block
  const currentBlockIndex = blockData ? blocks.findIndex((b, idx) => {
    const originalBlock = blockData.allBlocks[idx];
    return originalBlock?.id === blockId;
  }) : 0;
  
  // Use current block index if found, otherwise use selectedBlockIndex
  const displayBlockIndex = currentBlockIndex >= 0 ? currentBlockIndex : selectedBlockIndex;
  
  // Get selected block
  const selectedBlock = blocks[displayBlockIndex];
  
  // Generate all days in the selected block
  const allDays = selectedBlock ? eachDayOfInterval({
    start: selectedBlock.startDate,
    end: selectedBlock.endDate
  }) : [];

  const handleDayClick = (day: Date) => {
    if (blockId) {
      setLocation(`/coach-session-view?blockId=${blockId}&day=${day.getDate()}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading program...</p>
        </div>
      </div>
    );
  }

  if (!blockData || !selectedBlock) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Block not found</p>
          <Button onClick={() => setLocation("/programs")} className="mt-4">
            Back to Programs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base">
      <TopBar
        currentTab="review"
        onTabChange={(tab) => {
          // Navigate back to athlete page with selected tab when switching
          const athleteId = blockData.athlete.id;
          if (tab === "summary") setLocation(`/programs/${athleteId}`);
          else setLocation(`/programs/${athleteId}?tab=${tab}`);
        }}
        onBack={() => setLocation(`/programs/${blockData.athlete.id}`)}
        phaseTitle="Phase 1 (25-26)"
        onOpenAthleteDetails={() => setDetailsOpen((prev) => !prev)}
        leftOffset={detailsOpen ? detailsPanelWidth : 0}
        athleteDetailsOpen={detailsOpen}
      />

      {detailsOpen && (
        <div
          className="fixed inset-y-0 left-0 z-40 bg-[#0d0d0c]"
          style={{ width: detailsPanelWidth }}
        >
          <div className="pt-14 h-full">
            <AthleteInfoSidebar
              athlete={blockData.athlete}
              currentPhase={undefined}
              blocks={blockData.allBlocks}
            />
          </div>
        </div>
      )}

      <main
        className={cn(
          "px-5 py-6 flex flex-col h-[calc(100vh-3.5rem)] bg-[#0d0d0c] pt-14 transition-[margin-left] duration-300"
        )}
        style={{ marginLeft: detailsOpen ? detailsPanelWidth : 0 }}
      >
        {blocks.length > 0 && (
          <div className="flex flex-col h-full space-y-4">
            {/* Block Selector */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <span className="text-sm font-medium text-[#f7f6f2] font-['Montserrat']">Block:</span>
              <select
                value={selectedBlockIndex}
                onChange={(e) => {
                  setSelectedBlockIndex(parseInt(e.target.value));
                }}
                className="rounded-md border border-[#292928] bg-[#171716] px-3 py-1.5 text-sm text-[#f7f6f2] font-['Montserrat']"
              >
                {blocks.map((block, index) => (
                  <option key={index} value={index} className="bg-[#171716]">
                    {block.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Table-like Calendar */}
            {selectedBlock && allDays.length > 0 && (
              <div className="border border-[#292928] rounded-lg overflow-x-auto overflow-y-auto flex-1 bg-[#0d0d0c]">
                <Table className="min-w-max">
                  <TableHeader className="sticky top-0 z-10 bg-[#0d0d0c]">
                    <TableRow className="border-b border-[#292928] hover:bg-transparent">
                      {allDays.map((day, index) => {
                        const dayName = format(day, 'EEE');
                        const dayDate = format(day, 'MM/dd/yyyy');
                        const sessionData = getSessionData(day.getDate());
                        const hasSession = sessionData.routines.length > 0;
                        
                        return (
                          <TableHead 
                            key={index}
                            className={cn(
                              "text-center min-w-[180px] px-3 py-2 border-r border-[#292928] last:border-r-0",
                              hasSession && "cursor-pointer hover:bg-[#171716]"
                            )}
                            onClick={() => hasSession && handleDayClick(day)}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm font-medium text-[#f7f6f2] font-['Montserrat']">{dayName}</span>
                              <span className="text-xs text-[#979795] font-['Montserrat']">{dayDate}</span>
                            </div>
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Exercises Row */}
                    <TableRow className="hover:bg-transparent">
                      {allDays.map((day, index) => {
                        const sessionData = getSessionData(day.getDate());
                        const hasSession = sessionData.routines.length > 0;
                        
                        return (
                          <TableCell 
                            key={index}
                            className={cn(
                              "px-3 py-2 align-top border-r border-[#292928] last:border-r-0",
                              hasSession && "cursor-pointer hover:bg-[#171716]"
                            )}
                            onClick={() => hasSession && handleDayClick(day)}
                          >
                            {hasSession ? (
                              <div className="space-y-2">
                                {sessionData.routines.map((routine, routineIdx) => (
                                  <div key={routineIdx} className="space-y-1">
                                    <div className="rounded-md bg-[#171716] p-2">
                                      <p className="text-xs font-medium capitalize mb-1 text-[#f7f6f2] font-['Montserrat']">{routine.name}</p>
                                      <div className="space-y-1">
                                        {routine.exercises.map((exercise, exerciseIdx) => (
                                          <div key={exerciseIdx} className="text-xs text-[#979795] font-['Montserrat']">
                                            <span className="font-medium text-[#f7f6f2]">{exercise.name}</span>
                                            <span className="ml-1">
                                              {exercise.sets} × {exercise.reps}
                                              {exercise.weight && ` @ ${exercise.weight}`}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-[#979795] text-center font-['Montserrat']">Rest</p>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
