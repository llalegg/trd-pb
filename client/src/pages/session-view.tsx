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
  routineType: string;
  onClick?: () => void;
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
  routineType: string;
  onClick?: () => void;
}

function ExerciseCard({ exercise, isCompleted, routineType, onClick }: ExerciseCardProps) {
  if (isCompleted) {
    return (
      <button 
        onClick={onClick}
        className="bg-[#121210] flex items-center gap-2 h-[44px] px-3 py-[10px] rounded-xl w-full text-left hover:bg-[#1a1a19] transition-colors"
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
      </button>
    );
  }

  return (
    <button 
      onClick={onClick}
      className="bg-[#171716] flex items-center gap-2 px-3 py-3 rounded-xl w-full text-left hover:bg-[#1f1f1e] transition-colors"
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
    </button>
  );
}

function SupersetCard({ superset, isCompleted, routineType, onClick }: SupersetCardProps) {
  return (
    <button onClick={onClick} className="flex flex-col w-full pb-4 text-left hover:bg-[#0f0f0e] rounded-lg transition-colors">
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
      <div className="flex flex-col pointer-events-none">
        {superset.exercises.map((exercise, index) => (
          <div key={index}>
            {/* Exercise Item */}
            <div className={isCompleted ? "bg-[#121210] flex items-center gap-2 h-[44px] px-3 py-[10px] rounded-xl" : "bg-[#171716] flex items-center gap-2 px-3 py-3 rounded-xl"}>
              {/* Circle Icon */}
              <div className={isCompleted ? "bg-[#1c1c1b] flex items-center justify-center p-1 rounded-full shrink-0 w-5 h-5" : "shrink-0 w-5 h-5 bg-[#292928] rounded-full flex items-center justify-center"}>
                {isCompleted ? (
                  <Check className="w-4 h-4 text-[#979795]" />
                ) : (
                  <div className="w-[6px] h-[6px] bg-[#c4af6c] rounded-full"></div>
                )}
              </div>
              
              {/* Exercise Name */}
              <div className="flex-1 min-w-0">
                <p className={`text-[14px] font-['Montserrat'] truncate leading-[1.46] ${isCompleted ? 'font-medium text-[#585856]' : 'font-semibold text-[#f7f6f2]'}`}>
                  {exercise.name}
                </p>
              </div>
            </div>
            
            {/* Vertical connecting line after each exercise (except last) */}
            {index < superset.exercises.length - 1 && (
              <div className="flex justify-start pl-5">
                <div className="w-px h-2 bg-[#585856]"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </button>
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
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Get the selected day from URL params or default to current day (17)
  const urlParams = new URLSearchParams(window.location.search);
  const selectedDay = parseInt(urlParams.get('day') || '17', 10);

  
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

  // Handle scroll to specific routine from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const scrollTo = urlParams.get('scrollTo');
    
    if (scrollTo) {
      // Wait for the component to render, then scroll to the routine
      setTimeout(() => {
        const routineElement = document.querySelector(`[data-routine="${scrollTo}"]`);
        if (routineElement) {
          routineElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
          
          // Add a highlight effect
          routineElement.classList.add('ring-2', 'ring-[#c4af6c]', 'ring-opacity-50');
          setTimeout(() => {
            routineElement.classList.remove('ring-2', 'ring-[#c4af6c]', 'ring-opacity-50');
          }, 2000);
        }
      }, 100);
    }
  }, []);

  const routineTypeIcons = {
    throwing: Target,
    movement: Zap,
    strength: Dumbbell,
    recovery: Zap,
  };

  const routineTypeOrder = ["movement", "strength", "throwing", "recovery"];

  // R-focus mapping for Movement and Strength routines
  const getRFocusParams = (routineType: string): string[] => {
    switch (routineType) {
      case "movement":
        return ["Dynamic Warm-up", "Mobility", "Activation"]; // R3 parameters
      case "strength":
        return ["Core lift", "Heavy load"]; // R4 parameters
      default:
        return [];
    }
  };

  // Get intensity level for each routine type
  const getIntensityLevel = (routineType: string): { level: number; color: string } => {
    switch (routineType) {
      case "movement":
        return { level: 2, color: "bg-[#4ade80]" }; // Light intensity - green
      case "strength":
        return { level: 4, color: "bg-[#f59e0b]" }; // High intensity - orange
      case "throwing":
        return { level: 3, color: "bg-[#3b82f6]" }; // Medium-high intensity - blue
      case "recovery":
        return { level: 1, color: "bg-[#6b7280]" }; // Low intensity - gray
      default:
        return { level: 2, color: "bg-[#6b7280]" };
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


      {/* Toggle Completed Exercises */}
      <div className="px-4 pb-4 pt-3">
        <div className="bg-[#1a1a19] rounded-lg p-3">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-sm text-[#979795] hover:text-[#f7f6f2] transition-colors"
          >
            <div className={`relative w-8 h-5 rounded-full transition-colors duration-200 ${showCompleted ? 'bg-[#c4af6c]' : 'bg-[#3d3d3c]'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${showCompleted ? 'translate-x-3' : 'translate-x-0.5'}`} />
            </div>
            <span className="font-['Montserrat']">Show completed</span>
          </button>
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
            const list = (routine.exercises as any[]) as { sets: number; completedSets?: number; name: string }[];
            if (!list.length) return 0;
            
            let completedExercises = 0;
            let totalExercises = 0;
            
            // Count completed exercises (not sets)
            list.forEach((exercise) => {
              const isCompletedInState = exerciseStateManager.isExerciseCompleted(routine.type, exercise.name);
              const isCompletedBySets = (exercise.completedSets || 0) >= exercise.sets;
              const isExerciseCompleted = isCompletedInState || isCompletedBySets || 
                (routine.type === "strength" && exercise.name === "Romanian deadlifts"); // Pre-completed exercise
              
              if (isExerciseCompleted) {
                completedExercises++;
              }
              totalExercises++;
            });
            
            // Add superset if it exists for movement and strength
            if (routine.type === "movement" || routine.type === "strength") {
              const supersetCompleted = exerciseStateManager.isExerciseCompleted(routine.type, `${routine.type === 'strength' ? 'Strength & Conditioning' : 'Movement'} Superset`);
              if (supersetCompleted) {
                completedExercises++;
              }
              totalExercises++;
            }
            
            if (totalExercises === 0) return 0;
            return Math.round((completedExercises / totalExercises) * 100);
          })();

          return (
            <div key={routine.type} className="space-y-4" data-routine={routine.type}>
              {/* Routine Header - Figma Design */}
              <div className="flex gap-[8px] items-center w-full">
                {/* Progress Circle */}
                <div className="relative w-[24px] h-[24px] shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 24 24">
                    {/* Background circle */}
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#3d3d3c"
                      strokeWidth="2"
                      fill="none"
                    />
                    {/* Progress circle */}
                    {routineProgress > 0 && (
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="#f7f6f2"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 10}`}
                        strokeDashoffset={`${2 * Math.PI * 10 * (1 - (routineProgress / 100))}`}
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />
                    )}
                  </svg>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-[8px] items-start justify-center flex-1 min-w-0">
                  <p className="text-[16px] font-semibold text-white font-['Montserrat'] leading-[1.5] w-full capitalize">
                    {routine.type === 'strength' ? 'Strength & Conditioning' : routine.type}
                  </p>
                  {getRFocusParams(routine.type).length > 0 && (
                    <div className="flex flex-wrap gap-[4px] items-start w-full">
                      {getRFocusParams(routine.type).map((param, index) => (
                        <div
                          key={index}
                          className="backdrop-blur-[20px] bg-[rgba(255,255,255,0.08)] flex gap-[4px] items-center justify-center px-[8px] py-[2px] rounded-full shrink-0"
                        >
                          <p className="text-[12px] font-medium text-[#979795] font-['Montserrat'] leading-[1.32] whitespace-nowrap">
                            {param}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Side - Intensity & Time */}
                <div className="flex flex-col items-end gap-[8px] shrink-0">
                  {/* Intensity Indicator */}
                  <div className="flex gap-[7px] items-center">
                    <div className="w-[20px] h-[20px] overflow-hidden relative">
                      {routine.type === 'movement' && (
                        <>
                          <div className="absolute bg-[#ff3636] h-[8px] left-[2px] rounded-[2px] top-[6px] w-[4px]" />
                          <div className="absolute bg-[#ff3636] h-[8px] left-[8px] rounded-[2px] top-[6px] w-[4px]" />
                          <div className="absolute bg-[#ff3636] h-[8px] left-[14px] rounded-[2px] top-[6px] w-[4px]" />
                        </>
                      )}
                      {routine.type === 'strength' && (
                        <>
                          <div className="absolute bg-[#13b557] h-[8px] left-[2px] rounded-[2px] top-[6px] w-[4px]" />
                          <div className="absolute bg-[#2a2a29] h-[8px] left-[8px] rounded-[2px] top-[6px] w-[4px]" />
                          <div className="absolute bg-[#2a2a29] h-[8px] left-[14px] rounded-[2px] top-[6px] w-[4px]" />
                        </>
                      )}
                      {routine.type === 'throwing' && (
                        <>
                          <div className="absolute bg-[#ff8d36] h-[8px] left-[2px] rounded-[2px] top-[6px] w-[4px]" />
                          <div className="absolute bg-[#ff8d36] h-[8px] left-[8px] rounded-[2px] top-[6px] w-[4px]" />
                          <div className="absolute bg-[#2a2a29] h-[8px] left-[14px] rounded-[2px] top-[6px] w-[4px]" />
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Time */}
                  <div className="flex gap-[7px] items-center">
                    <div className="w-[16px] h-[16px]">
                      <svg viewBox="0 0 16 16" className="w-4 h-4 text-[#979795]">
                        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1" fill="none"/>
                        <path d="M8 4v4l3 2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <p className="text-[12px] font-medium text-[#f7f6f2] font-['Montserrat'] leading-[1.32] whitespace-nowrap">
                      {routine.estimatedTime}
                    </p>
                  </div>
                </div>
              </div>


              {/* Exercise List */}
              <div className="space-y-2">
                {(() => {
                  const allItems: JSX.Element[] = [];

                  // Add superset card for Movement and Strength routines
                  if (routine.type === "movement" || routine.type === "strength") {
                    const supersetCompleted = exerciseStateManager.isExerciseCompleted(routine.type, getSuperset(routine.type)!.name);
                    
                    // Only show if not completed OR if showing completed
                    if (!supersetCompleted || showCompleted) {
                      const supersetElement = (
                        <SupersetCard
                          key="superset"
                          superset={getSuperset(routine.type)!}
                          isCompleted={supersetCompleted}
                          routineType={routine.type}
                          onClick={() => goToSupersetFocusView(routine.type)}
                        />
                      );
                      allItems.push(supersetElement);
                    }
                  }

                  // Add individual exercises in original order
                  (routine.exercises as any[]).forEach((exercise: any, index: number) => {
                    const isCompletedInState = exerciseStateManager.isExerciseCompleted(routine.type, exercise.name);
                    const isExerciseCompleted = isCompletedInState || 
                      (routine.type === "strength" && index === 0) || 
                      exercise.completedSets >= exercise.sets;
                    
                    // Only show if not completed OR if showing completed
                    if (!isExerciseCompleted || showCompleted) {
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
                          routineType={routine.type}
                          onClick={() => goToFocusView(routine.type, exercise.name)}
                        />
                      );
                      allItems.push(exerciseElement);
                    }
                  });

                  return allItems;
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
