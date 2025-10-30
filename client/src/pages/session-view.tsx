import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Play, CheckCircle, Check, Dumbbell, Target, Zap, Calendar, FileText, RefreshCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getSessionData } from "@/lib/sessionData";
import { exerciseStateManager } from "@/lib/exerciseState";

// Exercise Card Component based on Figma design
interface ExerciseCardProps {
  exercise: {
    name: string;
    sets: number;
    reps: string;
    completedSets?: number;
  };
  isCompleted: boolean;
}

// Superset Card Component based on Figma design
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
}

function ExerciseCard({ exercise, isCompleted }: ExerciseCardProps) {
  if (isCompleted) {
    return (
      <div 
        className="bg-[#121210] flex items-center gap-2 h-[44px] px-3 py-[10px] rounded-xl"
      >
        {/* Completed Icon */}
        <div className="bg-[#1c1c1b] flex items-center justify-center p-1 rounded-full shrink-0 w-5 h-5">
          <Check className="w-4 h-4 text-[#979795]" />
        </div>
        
        {/* Exercise Name */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium text-[#585856] font-['Montserrat'] truncate leading-[1.46]">
            {exercise.name}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-[#171716] flex items-center gap-2 px-3 py-3 rounded-xl"
    >
      {/* Circle Icon */}
      <div className="shrink-0 w-5 h-5 bg-[#292928] rounded-full flex items-center justify-center">
        <div className="w-[6px] h-[6px] bg-[#c4af6c] rounded-full"></div>
      </div>
      
      {/* Exercise Name */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-[#f7f6f2] font-['Montserrat'] truncate leading-[1.46]">
          {exercise.name}
        </p>
      </div>
    </div>
  );
}

function SupersetCard({ superset, isCompleted }: SupersetCardProps) {
  return (
    <div className="flex flex-col w-full pb-4">
      {/* Superset Header - exact Figma specs */}
      <div className="flex items-center justify-between p-3 h-8 w-full">
        <div className="flex items-center gap-3">
          {/* Refresh icon */}
          <RefreshCw className="w-4 h-4 text-[#585856]" />
          <p className="text-[14px] font-semibold text-[#f7f6f2] font-['Montserrat'] leading-[1.46]">
            Superset
          </p>
        </div>
        <p className="text-xs font-medium text-[#979795] font-['Montserrat'] leading-[1.32]">
          {superset.sets} sets
        </p>
      </div>

      {/* Vertical line from superset header to first exercise */}
      <div className="flex justify-start pl-5">
        <div className="w-px h-2 bg-[#585856]"></div>
      </div>

      {/* Superset Exercises with vertical connecting lines */}
      <div className="flex flex-col">
        {superset.exercises.map((exercise, index) => (
          <div key={index}>
            {/* Exercise Item */}
            <ExerciseCard
              exercise={{
                name: exercise.name,
                sets: superset.sets,
                reps: exercise.reps,
                completedSets: superset.completedSets || 0
              }}
              isCompleted={isCompleted}
            />
            
            {/* Vertical connecting line after each exercise (except last) */}
            {index < superset.exercises.length - 1 && (
              <div className="flex justify-start pl-5">
                <div className="w-px h-2 bg-[#585856]"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Circular Progress Component
function CircularProgress({ progress, size = 20 }: { progress: number; size?: number }) {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="w-full h-full transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.16)"
          strokeWidth="2"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 1)"
          strokeWidth="2"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default function SessionView() {
  const [, setLocation] = useLocation();
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expandedRoutines, setExpandedRoutines] = useState<Record<string, boolean>>({});
  
  // Get the selected day from URL params or default to current day (17)
  const urlParams = new URLSearchParams(window.location.search);
  const selectedDay = parseInt(urlParams.get('day') || '17', 10);

  const toggleRoutineExpansion = (routineType: string) => {
    setExpandedRoutines(prev => ({
      ...prev,
      [routineType]: !prev[routineType]
    }));
  };
  
  // Get session data for the selected day
  const sessionData = getSessionData(selectedDay);

  // Subscribe to exercise completion changes
  useEffect(() => {
    const unsubscribe = exerciseStateManager.subscribe(() => {
      setRefreshTrigger(prev => prev + 1);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Handle scroll for navigation bar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const routineTypeIcons = {
    throwing: Target,
    movement: Zap,
    strength: Dumbbell,
    recovery: Zap,
  };

  const routineTypeOrder = ["movement", "strength", "throwing", "recovery"];

  // R-focus mapping for Movement and Strength routines
  const getRFocusText = (routineType: string): string | null => {
    switch (routineType) {
      case "movement":
        return "Dynamic Warm-up"; // R3
      case "strength":
        return "Core lift (heaviest, most demanding)"; // R4
      default:
        return null; // Only applicable for Movement and Strength
    }
  };

  // Sample superset data for Movement and Strength routines
  const getSuperset = (routineType: string) => {
    switch (routineType) {
      case "movement":
        return {
          name: "Movement Superset",
          sets: 3,
          exercises: [
            { name: "Hip circles", reps: "10 each", additionalParam: "30s rest" },
            { name: "Leg swings", reps: "12 each", additionalParam: "Forward/back" },
            { name: "Arm circles", reps: "15 each", additionalParam: "Both directions" }
          ],
          completedSets: 0
        };
      case "strength":
        return {
          name: "Strength & Conditioning Superset",
          sets: 4,
          exercises: [
            { name: "Push-ups", reps: "12", additionalParam: "Controlled tempo" },
            { name: "Pull-ups", reps: "8", additionalParam: "Full ROM" }
          ],
          completedSets: 0
        };
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      default:
        return <Play className="h-5 w-5 text-neutral-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      default:
        return "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400";
      default:
        return "text-neutral-400";
    }
  };

  const handleStartRoutine = (routineType: string) => {
    setSelectedRoutine(routineType);
    setLocation("/execution-view");
  };

  const goToFocusView = (routineType?: string, exerciseName?: string) => {
    if (routineType && exerciseName) {
      setLocation(`/focus-view?routineType=${encodeURIComponent(routineType)}&exerciseName=${encodeURIComponent(exerciseName)}`);
    } else {
      setLocation("/focus-view");
    }
  };

  const goToSupersetFocusView = (routineType: string) => {
    setLocation(`/focus-view?superset=true&supersetType=${routineType}`);
  };

  // Sort routines by recommended order
  const sortedRoutines = sessionData.routines.sort((a, b) => {
    const aIndex = routineTypeOrder.indexOf(a.type);
    const bIndex = routineTypeOrder.indexOf(b.type);
    return aIndex - bIndex;
  });

  const completedRoutines = sessionData.routines.filter(r => r.status === "completed").length;
  const totalRoutines = sessionData.routines.length;
  const progressPercentage = totalRoutines > 0 ? (completedRoutines / totalRoutines) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#0d0d0c]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0d0d0c] pt-3">
        {/* Navigation Bar */}
        <div className="flex items-center h-12 px-4">
          <button 
            onClick={() => setLocation("/home")}
            className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-[#f7f6f2]" />
          </button>
          <div className="flex-1 ml-2">
            <h1 className="text-lg font-semibold text-[#f7f6f2] font-['Montserrat'] text-left">
              Tuesday, Oct 17
            </h1>
            <p className="text-xs text-[#979795] font-['Montserrat'] font-semibold text-left">
              Block 1, Week 1
            </p>
          </div>
          <button 
            onClick={() => setLocation("/program-page")}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted/50 transition-colors"
          >
            <FileText className="w-6 h-6 text-[#f7f6f2]" />
          </button>
        </div>
      </div>

      {/* Global Progress Bar */}
      <div className="px-4 pb-4 pt-3">
        <div className="flex gap-1">
          {sessionData.routines.map((routine) => 
            routine.exercises.map((exercise: any, exerciseIndex: number) => {
              const isCompletedInState = exerciseStateManager.isExerciseCompleted(routine.type, exercise.name);
              const isExerciseCompleted = isCompletedInState || 
                (routine.type === "strength" && exerciseIndex === 0) || 
                exercise.completedSets >= exercise.sets;
              return (
                <div
                  key={`${routine.type}-${exerciseIndex}`}
                  className="flex-1 h-2 rounded-full bg-neutral-800 relative"
                >
                  {isExerciseCompleted && (
                    <div 
                      className="h-2 bg-[#c4af6c] rounded-full transition-all duration-300 w-full"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>


      {/* Floating Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-40">
        <div className="px-4">
          <Button className="w-full" onClick={() => goToFocusView()}>
            <Play className="h-4 w-4 mr-2" />
            Continue
          </Button>
        </div>
      </div>

      {/* Routine Cards */}
      <div className="px-4 pt-6 pb-[100px] space-y-8">
        {sortedRoutines.map((routine) => {
          const IconComponent = routineTypeIcons[routine.type as keyof typeof routineTypeIcons];
          const isCompleted = routine.status === "completed";
          
          const routineProgress = (() => {
            const list = (routine.exercises as any[]) as { sets: number; completedSets?: number }[];
            if (!list.length) return 0;
            const totals = list.reduce((acc, e) => {
              acc.completed += (e.completedSets || 0);
              acc.total += e.sets || 0;
              return acc;
            }, { completed: 0, total: 0 });
            if (totals.total === 0) return 0;
            return Math.round((totals.completed / totals.total) * 100);
          })();

          return (
            <div key={routine.type} className="space-y-4">
              {/* Routine Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-base text-white font-['Montserrat'] capitalize">
                    {routine.type}
                  </h3>
                  {getRFocusText(routine.type) && (
                    <p className="text-[14px] text-[#979795] font-['Montserrat'] font-medium">
                      {getRFocusText(routine.type)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4">
                    <svg viewBox="0 0 16 16" className="w-4 h-4 text-[#979795]">
                      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1" fill="none"/>
                      <path d="M8 4v4l3 2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p className="text-xs text-[#f7f6f2] font-['Montserrat'] font-medium">
                    {routine.estimatedTime}
                  </p>
                </div>
              </div>


              {/* Exercise List */}
              <div className="space-y-2">
                {(() => {
                  // Separate completed and incomplete exercises/supersets
                  const completedItems: JSX.Element[] = [];
                  const incompleteItems: JSX.Element[] = [];

                  // Add superset card for Movement and Strength routines
                  if (routine.type === "movement" || routine.type === "strength") {
                    const supersetCompleted = exerciseStateManager.isExerciseCompleted(routine.type, getSuperset(routine.type)!.name);
                    const supersetElement = (
                      <SupersetCard
                        key="superset"
                        superset={getSuperset(routine.type)!}
                        isCompleted={supersetCompleted}
                      />
                    );
                    
                    if (supersetCompleted) {
                      completedItems.push(supersetElement);
                    } else {
                      incompleteItems.push(supersetElement);
                    }
                  }

                  // Add individual exercises
                  (routine.exercises as any[]).forEach((exercise: any, index: number) => {
                    const isCompletedInState = exerciseStateManager.isExerciseCompleted(routine.type, exercise.name);
                    const isExerciseCompleted = isCompletedInState || 
                      (routine.type === "strength" && index === 0) || 
                      exercise.completedSets >= exercise.sets;
                    
                    const exerciseElement = (
                      <ExerciseCard
                        key={index}
                        exercise={{
                          name: exercise.name,
                          sets: exercise.sets,
                          reps: exercise.reps,
                          completedSets: exercise.completedSets
                        }}
                        isCompleted={isExerciseCompleted}
                      />
                    );

                    if (isExerciseCompleted) {
                      completedItems.push(exerciseElement);
                    } else {
                      incompleteItems.push(exerciseElement);
                    }
                  });

                  const isExpanded = expandedRoutines[routine.type] || false;
                  const hasCompletedItems = completedItems.length > 0;

                  return (
                    <>
                      {/* Show incomplete items first */}
                      {incompleteItems}
                      
                      {/* Show completed items section if any exist */}
                      {hasCompletedItems && (
                        <div className="space-y-2 w-full">
                          {/* Expandable header for completed items */}
                          <button
                            onClick={() => toggleRoutineExpansion(routine.type)}
                            className="flex items-center gap-2 w-full py-2 px-3 text-left hover:bg-[#1a1a19] rounded-lg transition-colors"
                          >
                            <ChevronDown 
                              className={`w-4 h-4 text-[#979795] transition-transform ${
                                isExpanded ? 'rotate-180' : ''
                              }`} 
                            />
                            <span className="text-sm font-medium text-[#979795] font-['Montserrat']">
                              Completed ({completedItems.length})
                            </span>
                          </button>
                          
                          {/* Completed items (collapsible) */}
                          {isExpanded && (
                            <div className="space-y-2 pl-6 w-full">
                              {completedItems.map((item, index) => (
                                <div key={index} className="w-full">
                                  {item}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="px-4 py-4">
          <Button className="w-full h-12 text-base font-semibold" onClick={() => goToFocusView()}>
            <Play className="h-5 w-5 mr-2" />
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
