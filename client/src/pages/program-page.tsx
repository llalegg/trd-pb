import { useState, useMemo } from "react";
import { ArrowLeft, Edit, ChevronLeft, ChevronRight } from "lucide-react";
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
import { type Program } from "@shared/schema";
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
  
  // Get program ID from URL params safely
  const programId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }, [location]);
  
  // Fetch program data
  const { data: programs, isLoading } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
    enabled: !!programId,
  });

  const programData = programs?.find(p => p.id === programId);
  const blocks = programData ? generateBlocks(programData) : [];
  
  // Get selected block
  const selectedBlock = blocks[selectedBlockIndex];
  
  // Generate all days in the selected block
  const allDays = selectedBlock ? eachDayOfInterval({
    start: selectedBlock.startDate,
    end: selectedBlock.endDate
  }) : [];

  const handleDayClick = (day: Date) => {
    if (programId) {
      setLocation(`/coach-session-view?programId=${programId}&day=${day.getDate()}`);
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

  if (!programData) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Program not found</p>
          <Button onClick={() => setLocation("/programs")} className="mt-4">
            Back to Programs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Compact Header */}
      <div className="sticky top-0 z-50 border-b border-[#292928] bg-[#0d0d0c]">
        <div className="flex h-14 items-center justify-between px-5">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/programs")}
              className="text-[#f7f6f2] hover:bg-[#171716] font-['Montserrat']"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-sm font-medium text-[#f7f6f2] font-['Montserrat']">
                {programData.programId}
              </h1>
              <span className="text-sm text-[#979795]">•</span>
              <span className="text-sm text-[#979795] font-['Montserrat']">{programData.athleteName}</span>
              <span className="text-sm text-[#979795]">•</span>
              <span className="text-sm text-[#979795] font-['Montserrat']">
                {format(new Date(programData.startDate), "MM/dd/yyyy")} - {format(new Date(programData.endDate), "MM/dd/yyyy")}
              </span>
              <span className="text-sm text-[#979795]">•</span>
              <div className="flex gap-1">
                {programData.routineTypes.map((type) => (
                  <Badge key={type} variant="tertiary" className="text-xs capitalize font-['Montserrat']">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => setLocation(`/add-program?edit=${programId}`)}
            className="bg-[#171716] text-[#f7f6f2] hover:bg-[#1a1a19] border-[#292928] font-['Montserrat']"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Program
          </Button>
        </div>
      </div>

      <main className="px-5 py-6 flex flex-col h-[calc(100vh-3.5rem)] bg-[#0d0d0c]">
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
