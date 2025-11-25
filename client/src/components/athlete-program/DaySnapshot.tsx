import React, { useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getSessionData, type Routine } from "@/lib/sessionData";

interface DaySnapshotProps {
  selectedDay: Date | null;
  onLogUpdate?: () => void;
  onViewPlan?: () => void;
}

type SnapshotTab = "all" | "movement" | "throwing" | "strength" | "recovery";

export default function DaySnapshot({ selectedDay, onLogUpdate, onViewPlan }: DaySnapshotProps) {
  const [activeTab, setActiveTab] = React.useState<SnapshotTab>("all");

  const sessionData = useMemo(() => {
    if (!selectedDay) return null;
    const dayOfMonth = selectedDay.getDate();
    return getSessionData(dayOfMonth);
  }, [selectedDay]);

  const filteredRoutines = useMemo(() => {
    if (!sessionData) return [];
    
    if (activeTab === "all") {
      return sessionData.routines;
    }
    
    return sessionData.routines.filter((routine) => {
      const type = routine.type.toLowerCase();
      switch (activeTab) {
        case "movement":
          return type === "movement";
        case "throwing":
          return type === "throwing";
        case "strength":
          return type === "strength" || type === "s&c";
        case "recovery":
          return type === "recovery";
        default:
          return true;
      }
    });
  }, [sessionData, activeTab]);

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

  if (!selectedDay || !sessionData) {
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

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SnapshotTab)}>
        <TabsList className="bg-[#171716] border border-[#292928] h-8">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-[#1C1C1B] data-[state=active]:text-[#f7f6f2] text-[#979795] px-3 text-xs font-['Montserrat']"
          >
            All
          </TabsTrigger>
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
            value="strength"
            className="data-[state=active]:bg-[#1C1C1B] data-[state=active]:text-[#f7f6f2] text-[#979795] px-3 text-xs font-['Montserrat']"
          >
            S&C
          </TabsTrigger>
          <TabsTrigger
            value="recovery"
            className="data-[state=active]:bg-[#1C1C1B] data-[state=active]:text-[#f7f6f2] text-[#979795] px-3 text-xs font-['Montserrat']"
          >
            Recovery
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content Display */}
      <div className="space-y-4">
        {filteredRoutines.length === 0 ? (
          <p className="text-sm text-[#979795] font-['Montserrat']">
            No routines scheduled for this day
          </p>
        ) : (
          filteredRoutines.map((routine, routineIndex) => (
            <RoutineCard
              key={routineIndex}
              routine={routine}
              onLogUpdate={onLogUpdate}
              onViewPlan={onViewPlan}
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
}: {
  routine: Routine;
  onLogUpdate?: () => void;
  onViewPlan?: () => void;
}) {
  return (
    <div className="bg-[#171716] border border-[#292928] rounded-lg p-4 space-y-3">
      {/* Routine Header */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">
            {routine.name}
          </h4>
          {routine.description && (
            <p className="text-xs text-[#979795] font-['Montserrat'] mt-1">
              {routine.description}
            </p>
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

      {/* Exercise Variations */}
      {routine.exercises.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#f7f6f2] font-['Montserrat'] uppercase tracking-wide">
            Exercise Variations
          </p>
          <div className="space-y-2">
            {routine.exercises.map((exercise, exerciseIndex) => (
              <div
                key={exerciseIndex}
                className="flex items-center justify-between text-sm text-[#979795] font-['Montserrat']"
              >
                <span className="text-[#f7f6f2] font-medium">{exercise.name}</span>
                <span>
                  {exercise.sets} × {exercise.reps}
                  {exercise.weight && ` @ ${exercise.weight}`}
                </span>
              </div>
            ))}
          </div>
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

