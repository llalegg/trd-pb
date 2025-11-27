import React, { useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Edit3, Mic, AlertTriangle, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getSessionData, type Routine } from "@/lib/sessionData";

interface DaySnapshotProps {
  selectedDay: Date | null;
  onLogUpdate?: () => void;
  onViewPlan?: () => void;
  onQuickEdit?: () => void;
  onQuickNote?: (note: string) => void;
  exerciseFlags?: Map<string, Array<{ type: string; message: string }>>;
  structureVariables?: Record<string, string>;
}

type SnapshotTab = "movement" | "throwing" | "lifting" | "recovery";

export default function DaySnapshot({ 
  selectedDay, 
  onLogUpdate, 
  onViewPlan,
  onQuickEdit,
  onQuickNote,
  exerciseFlags,
  structureVariables,
}: DaySnapshotProps) {
  const [activeTab, setActiveTab] = React.useState<SnapshotTab>("movement");
  const [quickNote, setQuickNote] = React.useState("");

  const sessionData = useMemo(() => {
    if (!selectedDay) return null;
    const dayOfMonth = selectedDay.getDate();
    return getSessionData(dayOfMonth);
  }, [selectedDay]);

  // Group routines by type in fixed order
  const routinesByType = useMemo(() => {
    if (!sessionData) {
      return {
        movement: [],
        throwing: [],
        lifting: [],
        recovery: [],
      };
    }
    
    const grouped = {
      movement: [] as Routine[],
      throwing: [] as Routine[],
      lifting: [] as Routine[],
      recovery: [] as Routine[],
    };
    
    sessionData.routines.forEach((routine) => {
      const type = routine.type.toLowerCase();
      if (type === "movement") {
        grouped.movement.push(routine);
      } else if (type === "throwing") {
        grouped.throwing.push(routine);
      } else if (type === "strength" || type === "s&c") {
        grouped.lifting.push(routine);
      } else if (type === "recovery") {
        grouped.recovery.push(routine);
      }
    });
    
    return grouped;
  }, [sessionData]);

  const currentTabRoutines = useMemo(() => {
    return routinesByType[activeTab] || [];
  }, [routinesByType, activeTab]);

  // Count sets awaiting results
  const setsAwaitingResults = useMemo(() => {
    if (!sessionData) return 0;
    return sessionData.routines.reduce((total, routine) => {
      return total + routine.exercises.reduce((routineTotal, exercise) => {
        const completedSets = exercise.completedSets || 0;
        const totalSets = exercise.sets || 0;
        return routineTotal + Math.max(0, totalSets - completedSets);
      }, 0);
    }, 0);
  }, [sessionData]);

  const handleQuickNoteSubmit = () => {
    if (quickNote.trim() && onQuickNote) {
      onQuickNote(quickNote.trim());
      setQuickNote("");
    }
  };

  if (!selectedDay) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[#979795] font-['Montserrat']">
          Select a day from the timeline to view session details
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">
          Program Snapshot
        </h3>
        {onQuickEdit && (
          <Button
            size="sm"
            variant="outline"
            onClick={onQuickEdit}
            className="h-7 px-3 text-xs border-[#292928] bg-[#171716] text-[#979795] hover:text-[#f7f6f2] hover:bg-[#1C1C1B] font-['Montserrat']"
          >
            <Edit3 className="h-3 w-3 mr-1.5" />
            Quick Edit
          </Button>
        )}
      </div>

      {/* Quick Note Input */}
      {onQuickNote && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Mic className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#979795]" />
            <Input
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleQuickNoteSubmit();
                }
              }}
              placeholder="Yo, saw your hammies are burned up, let's reduce the workload on Deadlift. I've moved the volume down 20%."
              className="pl-9 h-8 text-xs bg-[#171716] border-[#292928] text-[#f7f6f2] placeholder:text-[#979795] font-['Montserrat']"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleQuickNoteSubmit}
            className="h-8 px-3 text-xs border-[#292928] bg-[#171716] text-[#979795] hover:text-[#f7f6f2] hover:bg-[#1C1C1B] font-['Montserrat']"
          >
            Send
          </Button>
        </div>
      )}

      {/* Tab Navigation - Fixed Order: Movement, Throwing, Lifting, Recovery */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SnapshotTab)}>
        <TabsList className="bg-[#171716] border border-[#292928] h-8">
          <TabsTrigger
            value="movement"
            className="data-[state=active]:bg-[#1C1C1B] data-[state=active]:text-[#f7f6f2] text-[#979795] px-3 text-xs font-['Montserrat']"
          >
            Movement
          </TabsTrigger>
          <TabsTrigger
            value="throwing"
            className="data-[state=active]:bg-[#1C1C1B] data-[state=active]:text-[#f7f6f2] text-[#979795] px-3 text-xs font-['Montserrat']"
          >
            Throwing
          </TabsTrigger>
          <TabsTrigger
            value="lifting"
            className="data-[state=active]:bg-[#1C1C1B] data-[state=active]:text-[#f7f6f2] text-[#979795] px-3 text-xs font-['Montserrat']"
          >
            Lifting
          </TabsTrigger>
          <TabsTrigger
            value="recovery"
            className="data-[state=active]:bg-[#1C1C1B] data-[state=active]:text-[#f7f6f2] text-[#979795] px-3 text-xs font-['Montserrat']"
          >
            Recovery
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content Display - Always show widget, even if empty */}
      <div className="space-y-4">
        {currentTabRoutines.length === 0 ? (
          <div className="bg-[#171716] border border-[#292928] rounded-lg p-8 text-center">
            <p className="text-sm text-[#979795] font-['Montserrat']">
              No {activeTab} routines scheduled for this day
            </p>
          </div>
        ) : (
          currentTabRoutines.map((routine, routineIndex) => (
            <RoutineCard
              key={routineIndex}
              routine={routine}
              onLogUpdate={onLogUpdate}
              onViewPlan={onViewPlan}
              exerciseFlags={exerciseFlags}
              structureVariables={structureVariables}
              isLifting={activeTab === "lifting"}
            />
          ))
        )}
      </div>
    </div>
  );
}

function RoutineCard({
  routine,
  onLogUpdate,
  onViewPlan,
  exerciseFlags,
  structureVariables,
  isLifting = false,
}: {
  routine: Routine;
  onLogUpdate?: () => void;
  onViewPlan?: () => void;
  exerciseFlags?: Map<string, Array<{ type: string; message: string }>>;
  structureVariables?: Record<string, string>;
  isLifting?: boolean;
}) {
  const routineFlags = exerciseFlags?.get(routine.name) || [];
  const hasFlags = routineFlags.length > 0;

  // R-Group labels mapping
  const rGroupLabels: Record<string, string> = {
    "R1": "Soft Tissue",
    "R2": "Warm-Up",
    "R3": "Activation",
    "R4": "Main Work",
    "R5": "Accessory",
    "R6": "Cool Down",
    "R7": "Recovery",
  };

  // Group exercises by R-Group if recovery routine
  const exercisesByRGroup = useMemo(() => {
    if (routine.type.toLowerCase() !== "recovery") {
      return null;
    }
    const groups: Record<string, typeof routine.exercises> = {};
    routine.exercises.forEach((ex) => {
      const rGroup = (ex as any).rGroup || "R4";
      if (!groups[rGroup]) {
        groups[rGroup] = [];
      }
      groups[rGroup].push(ex);
    });
    return groups;
  }, [routine]);

  return (
    <div className="bg-[#171716] border border-[#292928] rounded-lg p-4 space-y-3">
      {/* Routine Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">
              {routine.name}
            </h4>
            {hasFlags && (
              <Flag className="h-4 w-4 text-red-400 fill-red-400" />
            )}
          </div>
          {routine.description && (
            <p className="text-xs text-[#979795] font-['Montserrat'] mt-1">
              {routine.description}
            </p>
          )}
          {/* Structure Variables */}
          {structureVariables && Object.keys(structureVariables).length > 0 && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {Object.entries(structureVariables).map(([key, value]) => (
                <Badge
                  key={key}
                  variant="outline"
                  className="text-xs font-['Montserrat'] bg-[#171716] border-[#292928] text-[#979795]"
                >
                  {key}: {value}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {onLogUpdate && (
            <Button
              size="sm"
              variant="outline"
              onClick={onLogUpdate}
              className="h-7 px-3 text-xs border-[#292928] bg-[#171716] text-[#979795] hover:text-[#f7f6f2] hover:bg-[#1C1C1B] font-['Montserrat']"
            >
              Log update
              <ArrowRight className="ml-1.5 h-3 w-3" />
            </Button>
          )}
          {onViewPlan && (
            <Button
              size="sm"
              variant="outline"
              onClick={onViewPlan}
              className="h-7 px-3 text-xs border-[#292928] bg-[#171716] text-[#979795] hover:text-[#f7f6f2] hover:bg-[#1C1C1B] font-['Montserrat']"
            >
              View plan
              <ArrowRight className="ml-1.5 h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Exercise Flags */}
      {hasFlags && (
        <div className="bg-red-500/10 border border-red-500/30 rounded p-2 space-y-1">
          {routineFlags.map((flag, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-red-400 font-['Montserrat']">
              <AlertTriangle className="h-3 w-3" />
              <span>{flag.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Exercise Variations - Table format for rep schemes */}
      {routine.exercises.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#f7f6f2] font-['Montserrat'] uppercase tracking-wide">
            Exercise Variations
          </p>
          
          {/* Recovery: R-Group breakdown */}
          {exercisesByRGroup ? (
            <Accordion type="multiple" className="w-full">
              {Object.entries(exercisesByRGroup)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([rGroup, exercises]) => (
                  <AccordionItem key={rGroup} value={rGroup} className="border-[#292928]">
                    <AccordionTrigger className="text-xs text-[#f7f6f2] font-['Montserrat'] py-2">
                      {rGroup}: {rGroupLabels[rGroup] || rGroup}
                    </AccordionTrigger>
                    <AccordionContent>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-[#292928]">
                            <TableHead className="text-xs text-[#979795] font-['Montserrat']">Exercise</TableHead>
                            <TableHead className="text-xs text-[#979795] font-['Montserrat']">Sets</TableHead>
                            <TableHead className="text-xs text-[#979795] font-['Montserrat']">Reps</TableHead>
                            <TableHead className="text-xs text-[#979795] font-['Montserrat']">Load</TableHead>
                            <TableHead className="text-xs text-[#979795] font-['Montserrat']">Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {exercises.map((exercise, exerciseIndex) => {
                            const exFlags = exerciseFlags?.get(exercise.name) || [];
                            return (
                              <TableRow key={exerciseIndex} className="border-[#292928]">
                                <TableCell className="text-xs text-[#f7f6f2] font-['Montserrat']">
                                  <div className="flex items-center gap-2">
                                    {exercise.name}
                                    {exFlags.length > 0 && (
                                      <Flag className="h-3 w-3 text-red-400 fill-red-400" />
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs text-[#979795] font-['Montserrat']">{exercise.sets}</TableCell>
                                <TableCell className="text-xs text-[#979795] font-['Montserrat']">{exercise.reps}</TableCell>
                                <TableCell className="text-xs text-[#979795] font-['Montserrat']">{exercise.weight || "—"}</TableCell>
                                <TableCell className="text-xs text-[#979795] font-['Montserrat']">{(exercise as any).notes || "—"}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          ) : (
            /* Regular table format for other routines */
            <Table>
              <TableHeader>
                <TableRow className="border-[#292928]">
                  <TableHead className="text-xs text-[#979795] font-['Montserrat']">Exercise</TableHead>
                  <TableHead className="text-xs text-[#979795] font-['Montserrat']">Sets</TableHead>
                  <TableHead className="text-xs text-[#979795] font-['Montserrat']">Reps</TableHead>
                  <TableHead className="text-xs text-[#979795] font-['Montserrat']">Load</TableHead>
                  <TableHead className="text-xs text-[#979795] font-['Montserrat']">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routine.exercises.map((exercise, exerciseIndex) => {
                  const exFlags = exerciseFlags?.get(exercise.name) || [];
                  return (
                    <TableRow key={exerciseIndex} className="border-[#292928]">
                      <TableCell className="text-xs text-[#f7f6f2] font-['Montserrat']">
                        <div className="flex items-center gap-2">
                          {exercise.name}
                          {exFlags.length > 0 && (
                            <Flag className="h-3 w-3 text-red-400 fill-red-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-[#979795] font-['Montserrat']">{exercise.sets}</TableCell>
                      <TableCell className="text-xs text-[#979795] font-['Montserrat']">{exercise.reps}</TableCell>
                      <TableCell className="text-xs text-[#979795] font-['Montserrat']">{exercise.weight || "—"}</TableCell>
                      <TableCell className="text-xs text-[#979795] font-['Montserrat']">{(exercise as any).notes || "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Lifting divider */}
      {isLifting && routine.exercises.length > 0 && (
        <div className="border-t border-[#292928] pt-3">
          {/* Additional lifting sections can be added here */}
        </div>
      )}

      {/* Routine-specific details */}
      {routine.routineType && (
        <div className="text-xs text-[#979795] font-['Montserrat']">
          Type: {routine.routineType}
        </div>
      )}
      {routine.seriesType && (
        <div className="text-xs text-[#979795] font-['Montserrat']">
          Series: {routine.seriesType}
        </div>
      )}
      {routine.intensity && (
        <div className="text-xs text-[#979795] font-['Montserrat']">
          Intensity: {routine.intensity}
        </div>
      )}
    </div>
  );
}

