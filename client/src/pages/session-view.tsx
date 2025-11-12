import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Play, CheckCircle, Check, Dumbbell, Target, Zap, Calendar, FileText, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getSessionData } from "@/lib/sessionData";
import { exerciseStateManager } from "@/lib/exerciseState";
import { useQuery } from "@tanstack/react-query";
import { type Program } from "@shared/schema";

// Exercise Card Component based on Figma design
interface ExerciseCardProps {
  exercise: {
    name: string;
    sets: number;
    reps: string;
    completedSets?: number;
    warmUpSets?: number;
    workingSets?: number;
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
        className="bg-[#121210] flex items-center gap-2 h-[36px] px-3 py-[8px] rounded-lg w-full text-left hover:bg-[#1a1a19] transition-all opacity-60 scale-[0.98]"
      >
        {/* Completed Icon */}
        <div className="bg-[#1c1c1b] flex items-center justify-center rounded-full shrink-0 w-4 h-4">
          <Check className="w-3 h-3 text-[#979795]" />
        </div>
        
        {/* Exercise Name */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#585856] font-['Montserrat'] truncate leading-[1.46] line-through">
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
        {/* Warm-Up Sets v. Working Sets */}
        {(exercise.warmUpSets || exercise.workingSets) && (
          <p className="text-[11px] font-medium text-[#979795] font-['Montserrat'] mt-0.5">
            {exercise.warmUpSets ? `Warm-Up: ${exercise.warmUpSets} sets` : ''}
            {exercise.warmUpSets && exercise.workingSets ? ' • ' : ''}
            {exercise.workingSets ? `Working: ${exercise.workingSets} sets` : ''}
          </p>
        )}
      </div>
    </button>
  );
}

function SupersetCard({ superset, isCompleted, routineType, onClick }: SupersetCardProps) {
  return (
    <button onClick={onClick} className="flex flex-col w-full text-left hover:bg-[#0f0f0e] rounded-lg transition-colors">
      {/* Compact Superset Header */}
      <div className="flex items-center justify-between px-3 py-2 w-full">
        <div className="flex items-center gap-2">
          {/* Compact bracket indicator */}
          <div className="flex items-center gap-0.5">
            <div className="w-[2px] h-3 bg-[#585856] rounded-full"></div>
            <RefreshCw className="w-3 h-3 text-[#585856]" />
            <div className="w-[2px] h-3 bg-[#585856] rounded-full"></div>
          </div>
          <p className="text-[14px] font-semibold text-[#f7f6f2] font-['Montserrat'] leading-[1.46]">
            Superset
          </p>
        </div>
        <p className="text-xs font-medium text-[#979795] font-['Montserrat'] leading-[1.32]">
          {superset.sets} sets
        </p>
      </div>

      {/* Compact Superset Exercises - inline with minimal spacing */}
      <div className="flex flex-col gap-1 px-3 pb-2 pointer-events-none">
        {superset.exercises.map((exercise, index) => (
          <div key={index} className={isCompleted ? "bg-[#121210] flex items-center gap-2 h-[36px] px-2 py-1 rounded-lg" : "bg-[#171716] flex items-center gap-2 h-[36px] px-2 py-1 rounded-lg"}>
            {/* Circle Icon */}
            <div className={isCompleted ? "bg-[#1c1c1b] flex items-center justify-center rounded-full shrink-0 w-4 h-4" : "shrink-0 w-4 h-4 bg-[#292928] rounded-full flex items-center justify-center"}>
              {isCompleted ? (
                <Check className="w-3 h-3 text-[#979795]" />
              ) : (
                <div className="w-[4px] h-[4px] bg-[#c4af6c] rounded-full"></div>
              )}
            </div>
            
            {/* Exercise Name */}
            <div className="flex-1 min-w-0">
              <p className={`text-[13px] font-['Montserrat'] truncate leading-[1.46] ${isCompleted ? 'font-medium text-[#585856] line-through' : 'font-semibold text-[#f7f6f2]'}`}>
                {exercise.name}
              </p>
            </div>
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
  const [showInstructionsOverlay, setShowInstructionsOverlay] = useState(false);
  const [collapsedRoutines, setCollapsedRoutines] = useState<Set<string>>(new Set());
  const [expandedEquipment, setExpandedEquipment] = useState<Set<string>>(new Set());
  
  const DEFAULT_DAY = 17;
  // Get the selected day from URL params or default to current day
  const urlParams = new URLSearchParams(window.location.search);
  const selectedDay = parseInt(urlParams.get('day') || String(DEFAULT_DAY), 10);

  
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

  const handleStartRoutine = (routineType: string): void => {
    setSelectedRoutine(routineType);
    setLocation("/execution-view");
  };

  const goToFocusView = (routineType?: string, exerciseName?: string): void => {
    if (routineType && exerciseName) {
      // Direct navigation for exercise cards
      setLocation(`/focus-view?routineType=${encodeURIComponent(routineType)}&exerciseName=${encodeURIComponent(exerciseName)}`);
    } else {
      // Show instructions overlay for Continue button
      setShowInstructionsOverlay(true);
    }
  };

  const handleContinueFromOverlay = (): void => {
    setShowInstructionsOverlay(false);
    setLocation("/focus-view");
  };

  const goToSupersetFocusView = (routineType: string): void => {
    setLocation(`/focus-view?superset=true&supersetType=${routineType}`);
  };

  const handleNavigateHome = (): void => {
    setLocation("/home");
  };

  // Fetch programs to get programId for navigation
  const { data: programs } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
  });

  const handleNavigateProgramPage = (): void => {
    // Get the first program's ID, or navigate to home if no programs exist
    if (programs && programs.length > 0) {
      setLocation(`/program-page?id=${programs[0].id}`);
    } else {
      // If no program found, navigate to home instead
      setLocation("/home");
    }
  };

  const handleToggleCompleted = (): void => {
    setShowCompleted(!showCompleted);
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

  interface ExerciseWithEquipment {
    name: string;
    equipment?: string[];
  }

  const getRoutineEquipment = (routineType: string, exercises: ExerciseWithEquipment[]): string[] => {
    const equipmentSet = new Set<string>();
    
    // Sample equipment based on routine type
    const equipmentMap: { [key: string]: string[] } = {
      strength: ["Dumbbells", "Barbell", "Weight Plates", "Bench", "Squat Rack"],
      movement: ["Resistance Bands", "Foam Roller", "Yoga Mat"],
      throwing: ["Baseball", "Glove", "Pitching Target"],
    };
    
    // Add equipment based on routine type
    if (equipmentMap[routineType]) {
      equipmentMap[routineType].forEach((eq) => equipmentSet.add(eq));
    }
    
    // Check if exercises have equipment property
    exercises.forEach((exercise: ExerciseWithEquipment) => {
      if (exercise.equipment && Array.isArray(exercise.equipment)) {
        exercise.equipment.forEach((eq: string) => equipmentSet.add(eq));
      }
    });
    
    return Array.from(equipmentSet);
  };

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0d0d0c] pt-3">
        {/* Navigation Bar */}
        <div className="flex items-center h-12 px-4">
          <button 
            onClick={handleNavigateHome}
            className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-muted/50 transition-colors"
            data-testid="nav-back-button"
          >
            <ArrowLeft className="w-6 h-6 text-[#f7f6f2]" />
          </button>
          <div className="flex-1 ml-2">
            <h1 className="text-lg font-semibold text-[#f7f6f2] font-['Montserrat'] text-left">
              Tuesday, Oct 16
            </h1>
            <p className="text-xs text-[#979795] font-['Montserrat'] font-semibold text-left">
              Block 1, Week 1
            </p>
          </div>
          <button 
            onClick={handleNavigateProgramPage}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted/50 transition-colors"
            data-testid="nav-program-button"
          >
            <FileText className="w-6 h-6 text-[#f7f6f2]" />
          </button>
        </div>
      </div>


      {/* Toggle Completed Exercises */}
      <div className="px-4 pb-4 pt-3">
        <div className="bg-[#1a1a19] rounded-lg p-3">
          <button
            onClick={handleToggleCompleted}
            className="flex items-center gap-2 text-sm text-[#979795] hover:text-[#f7f6f2] transition-colors"
            data-testid="toggle-completed-button"
          >
            <div className={`relative w-8 h-5 rounded-full transition-colors duration-200 ${showCompleted ? 'bg-[#c4af6c]' : 'bg-[#3d3d3c]'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${showCompleted ? 'translate-x-3' : 'translate-x-0.5'}`} />
            </div>
            <span className="font-['Montserrat'] font-medium">Show completed</span>
          </button>
        </div>
      </div>

      {/* Floating Start Session Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-40">
        <div className="px-4">
          <Button className="w-full" onClick={() => goToFocusView()} data-testid="start-session-button">
            <Play className="h-4 w-4 mr-2" />
            Start Session
          </Button>
        </div>
      </div>

      {/* Routine Cards */}
      <div className="px-4 pt-6 pb-[100px] space-y-6">
        {sortedRoutines.map((routine, routineIndex) => {
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

          const routineCompleted = routine.status === "completed";
          const isRoutineCollapsed = collapsedRoutines.has(routine.type) && routineCompleted && !showCompleted;
          
          return (
            <div 
              key={routine.type} 
              className={`space-y-3 ${routineCompleted ? 'opacity-75' : ''} ${routineIndex > 0 ? 'mt-8 pt-6 border-t border-[#292928]' : ''}`} 
              data-routine={routine.type}
            >
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
                  <div className="flex items-center gap-2 w-full">
                    {routineCompleted && (
                      <Check className="w-4 h-4 text-[#979795] flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[16px] font-semibold font-['Montserrat'] leading-[1.5] w-full capitalize ${routineCompleted ? 'text-[#979795]' : 'text-white'}`}>
                        {routine.type === 'strength' ? 'Strength & Conditioning' : routine.type}
                      </p>
                      {/* Exercise Variation Series */}
                      {(routine.routineType || routine.seriesType) && (
                        <p className="text-[12px] font-medium text-[#979795] font-['Montserrat'] leading-[1.32] mt-0.5">
                          {routine.routineType || routine.seriesType}
                          {routine.intensity && ` • ${routine.intensity}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side - Intensity Indicator (only for Lifting, Conditioning, Throwing) */}
                <div className="flex flex-col items-end gap-[8px] shrink-0">
                  {/* Intensity Indicator - NOT for Movement */}
                  {routine.type !== 'movement' && (
                    <div className="flex gap-[7px] items-center">
                      <div className="w-[20px] h-[20px] overflow-hidden relative">
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
                  )}
                </div>
              </div>

              {/* Equipment Card - Clickable Icon */}
              {(() => {
                const routineEquipment = getRoutineEquipment(routine.type, routine.exercises);
                const isEquipmentExpanded = expandedEquipment.has(routine.type);
                return routineEquipment.length > 0 ? (
                  <div className="mt-2">
                    <button
                      onClick={() => {
                        const newExpanded = new Set(expandedEquipment);
                        if (isEquipmentExpanded) {
                          newExpanded.delete(routine.type);
                        } else {
                          newExpanded.add(routine.type);
                        }
                        setExpandedEquipment(newExpanded);
                      }}
                      className="bg-[#121210] border border-[#292928] rounded-[12px] p-[8px] w-full flex items-center gap-2 hover:bg-[#171716] transition-colors"
                    >
                      {/* Clickable Equipment Icon */}
                      <div className="w-[20px] h-[20px] shrink-0 flex items-center justify-center">
                        <Dumbbell className="w-5 h-5 text-[#979795] hover:text-[#f7f6f2] transition-colors" />
                      </div>
                      <div className="flex-1 flex flex-wrap gap-[4px] items-center">
                        {isEquipmentExpanded ? (
                          routineEquipment.map((equipment, index) => (
                            <div
                              key={index}
                              className="backdrop-blur-[20px] bg-[rgba(0,0,0,0.25)] flex gap-[4px] items-center justify-center px-[8px] py-[2px] rounded-full shrink-0"
                            >
                              <p className="text-[12px] font-medium text-[#f7f6f2] font-['Montserrat'] leading-[1.32] whitespace-nowrap">
                                {equipment}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-[12px] font-medium text-[#979795] font-['Montserrat'] leading-[1.32]">
                            {routineEquipment.length} {routineEquipment.length === 1 ? 'item' : 'items'} needed
                          </p>
                        )}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-[#979795] transition-transform ${isEquipmentExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                ) : null;
              })()}

              {/* Exercise List with Completed Count */}
              {!isRoutineCollapsed && (() => {
                const allExercises = (routine.exercises as any[]) as { sets: number; completedSets?: number; name: string }[];
                const superset = (routine.type === "movement" || routine.type === "strength") ? getSuperset(routine.type) : null;
                
                // Count completed exercises
                let completedCount = 0;
                let totalCount = allExercises.length;
                
                if (superset) {
                  totalCount++;
                  const supersetCompleted = exerciseStateManager.isExerciseCompleted(routine.type, superset.name);
                  if (supersetCompleted) completedCount++;
                }
                
                allExercises.forEach((exercise) => {
                  const isCompletedInState = exerciseStateManager.isExerciseCompleted(routine.type, exercise.name);
                  const isExerciseCompleted = isCompletedInState || 
                    (routine.type === "strength" && exercise.name === "Romanian deadlifts") ||
                    (exercise.completedSets || 0) >= exercise.sets;
                  if (isExerciseCompleted) completedCount++;
                });
                
                const allCompleted = completedCount === totalCount;
                const isCollapsed = collapsedRoutines.has(routine.type) && allCompleted && !showCompleted;
                
                return (
                  <div className="space-y-1.5">
                    {/* Assigned v Completed Header */}
                    <div className="flex items-center justify-between px-2 py-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-[#979795] font-['Montserrat']">
                          Assigned: <span className="text-[#f7f6f2]">{totalCount}</span>
                        </p>
                        {completedCount > 0 && (
                          <>
                            <span className="text-[#585856]">•</span>
                            <p className="text-xs font-medium text-[#979795] font-['Montserrat']">
                              Completed: <span className="text-[#c4af6c]">{completedCount}</span>
                            </p>
                          </>
                        )}
                      </div>
                      {allCompleted && (
                        <button
                          onClick={() => {
                            const newCollapsed = new Set(collapsedRoutines);
                            if (isCollapsed) {
                              newCollapsed.delete(routine.type);
                            } else {
                              newCollapsed.add(routine.type);
                            }
                            setCollapsedRoutines(newCollapsed);
                          }}
                          className="text-xs font-medium text-[#979795] font-['Montserrat'] hover:text-[#f7f6f2] transition-colors"
                        >
                          {isCollapsed ? 'Show' : 'Hide'}
                        </button>
                      )}
                    </div>
                    
                    {/* Exercise Items */}
                    {!isCollapsed && (
                      <>
                        {/* Superset card */}
                        {superset && (routine.type === "movement" || routine.type === "strength") && (
                          (() => {
                            const supersetCompleted = exerciseStateManager.isExerciseCompleted(routine.type, superset.name);
                            if (!supersetCompleted || showCompleted) {
                              return (
                                <SupersetCard
                                  key="superset"
                                  superset={superset}
                                  isCompleted={supersetCompleted}
                                  routineType={routine.type}
                                  onClick={() => goToSupersetFocusView(routine.type)}
                                />
                              );
                            }
                            return null;
                          })()
                        )}

                        {/* Individual exercises */}
                        {allExercises.map((exercise: ExerciseWithEquipment, index: number) => {
                          const isCompletedInState = exerciseStateManager.isExerciseCompleted(routine.type, exercise.name);
                          const isExerciseCompleted = isCompletedInState || 
                            (routine.type === "strength" && exercise.name === "Romanian deadlifts") ||
                            (exercise.completedSets || 0) >= exercise.sets;
                          
                          if (!isExerciseCompleted || showCompleted) {
                            return (
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
                          }
                          return null;
                        })}
                      </>
                    )}
                  </div>
                );
              })()}
              {isRoutineCollapsed && (
                <div className="flex items-center justify-between px-2 py-2">
                  <p className="text-xs font-medium text-[#979795] font-['Montserrat']">
                    Routine completed
                  </p>
                  <button
                    onClick={() => {
                      const newCollapsed = new Set(collapsedRoutines);
                      newCollapsed.delete(routine.type);
                      setCollapsedRoutines(newCollapsed);
                    }}
                    className="text-xs font-medium text-[#979795] font-['Montserrat'] hover:text-[#f7f6f2] transition-colors"
                  >
                    Show
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Start Session Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="px-4 py-4">
          <Button className="w-full h-12 text-base font-semibold" onClick={() => goToFocusView()}>
            <Play className="h-5 w-5 mr-2" />
            Start Session
          </Button>
        </div>
      </div>

      {/* Instructions Overlay */}
      {showInstructionsOverlay && (
        <div className="fixed inset-0 z-50 bg-[#0d0d0c] bg-opacity-95 flex flex-col items-center justify-center px-4">
          <div className="max-w-md w-full space-y-6">
            {/* Title */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-[#f7f6f2] font-['Montserrat']">
                How to Add Information
              </h2>
              <p className="text-sm text-[#979795] font-['Montserrat']">
                Follow these steps to track your workout
              </p>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#292928] flex items-center justify-center text-sm font-semibold text-[#f7f6f2] shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-base font-medium text-[#f7f6f2] font-['Montserrat']">
                    Enter your reps and weight
                  </p>
                  <p className="text-sm text-[#979795] font-['Montserrat'] mt-1">
                    Tap on any cell in the table to edit values
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#292928] flex items-center justify-center text-sm font-semibold text-[#f7f6f2] shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-base font-medium text-[#f7f6f2] font-['Montserrat']">
                    Set your RPE (Rate of Perceived Exertion)
                  </p>
                  <p className="text-sm text-[#979795] font-['Montserrat'] mt-1">
                    Select from the dropdown to rate your effort level
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#292928] flex items-center justify-center text-sm font-semibold text-[#f7f6f2] shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-base font-medium text-[#f7f6f2] font-['Montserrat']">
                    Choose your rest time
                  </p>
                  <p className="text-sm text-[#979795] font-['Montserrat'] mt-1">
                    Use the rest time selector to set breaks between sets
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#292928] flex items-center justify-center text-sm font-semibold text-[#f7f6f2] shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <p className="text-base font-medium text-[#f7f6f2] font-['Montserrat']">
                    Complete your exercise
                  </p>
                  <p className="text-sm text-[#979795] font-['Montserrat'] mt-1">
                    Tap "Complete & Next" when finished with all sets
                  </p>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <div className="pt-4">
              <Button 
                className="w-full h-12 text-base font-semibold bg-[#e5e4e1] text-black hover:bg-[#d5d4d1] font-['Montserrat']"
                onClick={handleContinueFromOverlay}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
