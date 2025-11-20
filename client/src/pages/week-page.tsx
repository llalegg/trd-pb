import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Play, Check, Dumbbell, Target, Zap, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";
import { getSessionData } from "@/lib/sessionData";
import { exerciseStateManager } from "@/lib/exerciseState";
import MobileTabBar from "@/components/MobileTabBar";

// Exercise Card Component (same as session-view)
interface ExerciseCardProps {
  exercise: {
    name: string;
    sets: number;
    reps: string;
    completedSets?: number;
  };
  isCompleted: boolean;
  onClick: () => void;
}

// Superset Card Component (same as session-view)
interface SupersetCardProps {
  superset: {
    name: string;
    sets: number;
    exercises: Array<{
      name: string;
      reps: string;
      additionalParam?: string;
    }>;
    completedSets?: number;
  };
  isCompleted: boolean;
  onClick: () => void;
}

function ExerciseCard({ exercise, isCompleted, onClick }: ExerciseCardProps) {
  // Calculate estimated time based on sets (rough estimate: 2 minutes per set)
  const estimatedTime = Math.ceil(exercise.sets * 2);
  
  return (
    <div 
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors",
        isCompleted ? "bg-[#121210]" : "bg-[#171716]"
      )}
      onClick={onClick}
    >
      {/* Exercise Info */}
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "text-[14px] font-semibold truncate font-['Montserrat']",
          isCompleted ? "text-[#979795]" : "text-[#f7f6f2]"
        )}>
          {exercise.name}
        </h4>
        <div className="flex items-center gap-1 text-xs text-[#979795] font-['Montserrat'] font-medium">
          <span>{estimatedTime}</span>
          <span>•</span>
          <span>{exercise.reps} x {exercise.sets}</span>
        </div>
      </div>

      {/* Status Icon */}
      <div className="flex-shrink-0">
        {isCompleted ? (
          <Check className="h-5 w-5 text-[#979795]" />
        ) : (
          <div className="w-8 h-8 bg-[#292928] rounded-full flex items-center justify-center">
            <Play className="h-4 w-4 text-[#f7f6f2] ml-0.5" />
          </div>
        )}
      </div>
    </div>
  );
}

function SupersetCard({ superset, isCompleted, onClick }: SupersetCardProps) {
  return (
    <div 
      className={cn(
        "bg-[#171716] rounded-xl overflow-hidden cursor-pointer transition-colors w-full",
        isCompleted && "opacity-60"
      )}
      onClick={onClick}
    >
      {/* Superset Header */}
      <div className="bg-[#121210] flex items-center justify-between px-4 py-3">
        <div className="flex flex-col gap-1">
          <p className="text-[14px] font-semibold text-[#585856] font-['Montserrat']">
            Superset
          </p>
          <p className="text-xs font-medium text-[#979795] font-['Montserrat']">
            {superset.sets} sets
          </p>
        </div>
        <div className="flex-shrink-0">
          {isCompleted ? (
            <Check className="h-5 w-5 text-[#979795]" />
          ) : (
            <div className="w-8 h-8 bg-[#292928] rounded-full flex items-center justify-center">
              <Play className="h-4 w-4 text-[#f7f6f2] ml-0.5" />
            </div>
          )}
        </div>
      </div>

      {/* Superset Exercises */}
      <div className="px-4 py-3 space-y-2">
        {superset.exercises.map((exercise, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-[#f7f6f2] font-['Montserrat']">{exercise.name}</p>
              <p className="text-xs text-[#979795] font-['Montserrat'] font-medium">
                {exercise.reps} {exercise.additionalParam && `• ${exercise.additionalParam}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mock week schedule data
const mockWeekSchedule = {
  "1-1": { // Block 1, Week 1
    blockId: 1,
    weekNumber: 1,
    startDate: "2025-01-15",
    endDate: "2025-01-21",
    days: [
      { date: "2025-01-15", dayOfWeek: "Wed", isRestDay: false },
      { date: "2025-01-16", dayOfWeek: "Thu", isRestDay: false },
      { date: "2025-01-17", dayOfWeek: "Fri", isRestDay: false },
      { date: "2025-01-18", dayOfWeek: "Sat", isRestDay: false },
      { date: "2025-01-19", dayOfWeek: "Sun", isRestDay: true },
      { date: "2025-01-20", dayOfWeek: "Mon", isRestDay: false },
      { date: "2025-01-21", dayOfWeek: "Tue", isRestDay: true },
    ]
  }
};

export default function WeekPage() {
  const [, setLocation] = useLocation();
  const [selectedDate, setSelectedDate] = useState(new Date("2025-01-17")); // Default to day 17
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Parse URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const blockId = parseInt(urlParams.get("block") || "1");
  const weekNumber = parseInt(urlParams.get("week") || "1");
  const weekKey = `${blockId}-${weekNumber}`;
  
  const weekData = mockWeekSchedule[weekKey as keyof typeof mockWeekSchedule];

  // Subscribe to exercise state changes
  useEffect(() => {
    const unsubscribe = exerciseStateManager.subscribe(() => {
      setRefreshTrigger(prev => prev + 1);
    });
    return () => { unsubscribe(); };
  }, []);

  if (!weekData) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="bg-[#171716] rounded-xl p-6 text-center">
          <h2 className="text-lg font-semibold mb-2 text-[#f7f6f2] font-['Montserrat']">Week not found</h2>
          <p className="text-[#979795] mb-4 font-['Montserrat'] font-medium">This week is not available yet.</p>
          <Button 
            onClick={() => setLocation("/athlete/home")}
            className="bg-[#e5e4e1] hover:bg-[#f7f6f2] text-[#0d0d0c] font-semibold font-['Montserrat']"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Get session data for the selected day
  const selectedDayNumber = selectedDate.getDate();
  const sessionData = getSessionData(selectedDayNumber);
  
  // Check if selected day is a rest day
  const selectedDaySchedule = weekData.days.find(day => isSameDay(new Date(day.date), selectedDate));
  const isRestDay = selectedDaySchedule?.isRestDay || false;

  // Navigation functions (same as session-view)
  const goToFocusView = (routineType?: string, exerciseName?: string) => {
    if (routineType && exerciseName) {
      setLocation(`/athlete/focus-view?routineType=${encodeURIComponent(routineType)}&exerciseName=${encodeURIComponent(exerciseName)}`);
    } else {
      setLocation("/athlete/focus-view");
    }
  };

  const goToSupersetFocusView = (routineType: string) => {
    setLocation(`/athlete/focus-view?superset=true&supersetType=${routineType}`);
  };

  // Get superset data (same as session-view)
  const getSuperset = (routineType: string) => {
    if (routineType === "movement") {
      return {
        name: "Movement Superset",
        sets: 4,
        exercises: [
          { name: "Band Pull-Apart", reps: "110", additionalParam: "Band" },
          { name: "Shoulder Circles", reps: "15", additionalParam: "Body weight" },
          { name: "Arm Swings", reps: "20", additionalParam: "Body weight" }
        ]
      };
    } else if (routineType === "strength") {
      return {
        name: "Strength & Conditioning Superset", 
        sets: 4,
        exercises: [
          { name: "Push-ups", reps: "12", additionalParam: "Body weight" },
          { name: "Pull-ups", reps: "8", additionalParam: "Body weight" }
        ]
      };
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-surface-base pb-20">
      {/* Header (same styling as session-view) */}
      <div className="sticky top-0 z-50 bg-[#0d0d0c] pt-12 pb-4">
        <div className="flex items-center justify-between px-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/athlete/home")}
            className="p-2 hover:bg-[#171716]"
          >
            <ArrowLeft className="h-4 w-4 text-[#f7f6f2]" />
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-[#f7f6f2] font-['Montserrat']">
              {format(selectedDate, "EEEE, MMM d")} Session
            </h1>
            <p className="text-sm text-[#979795] font-['Montserrat'] font-semibold">
              Block {weekData.blockId}, Week {weekData.weekNumber}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-[#171716]"
          >
            <Calendar className="h-4 w-4 text-[#f7f6f2]" />
          </Button>
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex gap-0 px-4 w-full mb-6">
        {weekData.days.map((day) => {
          const isSelected = isSameDay(new Date(day.date), selectedDate);
          const dayNumber = new Date(day.date).getDate();
          
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center">
              <p className="text-xs text-[#979795] mb-2 font-['Montserrat'] font-medium">{day.dayOfWeek}</p>
              <button
                onClick={() => setSelectedDate(new Date(day.date))}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold font-['Montserrat'] transition-colors",
                  isSelected
                    ? "bg-[#f7f6f2] text-[#0d0d0c]"
                    : "text-[#f7f6f2] hover:bg-[#171716]"
                )}
              >
                {dayNumber}
              </button>
            </div>
          );
        })}
      </div>

      {/* Rest Day Display */}
      {isRestDay && (
        <div className="px-4 py-4">
          <div className="bg-[#171716] flex flex-col gap-4 items-center justify-center p-6 rounded-xl w-full">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#292928] flex items-center justify-center">
              <span className="text-2xl">😴</span>
            </div>
            <p className="text-lg font-semibold mb-2 text-[#f7f6f2] font-['Montserrat']">Rest day</p>
            <p className="text-[#979795] text-center font-['Montserrat'] font-medium">
              Take time to recover and prepare for tomorrow's training.
            </p>
          </div>
        </div>
      )}

      {/* Session Content (same as session-view) */}
      {!isRestDay && (
        <div className="px-4 pb-4 space-y-6">
          {/* Removed progress bar to match session-view */}

          {/* Routines */}
          {sessionData.routines.map((routine, routineIndex) => (
            <div key={routineIndex} className="space-y-4">
              {/* Routine Header */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-base text-[#f7f6f2] font-['Montserrat'] capitalize">{routine.type}</h3>
                  <p className="text-[14px] text-[#979795] font-['Montserrat'] font-medium">
                    {routine.type === "movement" && "Dynamic Warm-up"}
                    {routine.type === "strength" && "Strength & conditioning (heaviest, most demanding)"}
                    {routine.type === "throwing" && "Throwing technique"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4">
                    <svg viewBox="0 0 16 16" className="w-4 h-4 text-[#979795]">
                      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1" fill="none" />
                      <path d="M8 4v4l3 2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-xs text-[#f7f6f2] font-['Montserrat'] font-medium">{routine.estimatedTime}</p>
                </div>
              </div>

              {/* Superset Cards */}
              {(routine.type === "movement" || routine.type === "strength") && (
                <SupersetCard
                  superset={getSuperset(routine.type)!}
                  isCompleted={exerciseStateManager.isExerciseCompleted(routine.type, getSuperset(routine.type)!.name)}
                  onClick={() => goToSupersetFocusView(routine.type)}
                />
              )}

              {/* Exercise Cards */}
              <div className="space-y-2">
                {routine.exercises.map((exercise, exerciseIndex) => {
                  const isCompleted = exerciseStateManager.isExerciseCompleted(routine.type, exercise.name);
                  
                  return (
                    <ExerciseCard
                      key={exerciseIndex}
                      exercise={exercise}
                      isCompleted={isCompleted}
                      onClick={() => goToFocusView(routine.type, exercise.name)}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Start Session Button */}
          <div className="pt-6">
            <Button 
              onClick={goToFocusView}
              className="w-full bg-[#e5e4e1] hover:bg-[#f7f6f2] text-[#0d0d0c] font-semibold font-['Montserrat']"
            >
              Start Session
            </Button>
          </div>
        </div>
      )}

      <MobileTabBar />
    </div>
  );
}