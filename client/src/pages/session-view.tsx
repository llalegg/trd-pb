import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Play, CheckCircle, Check, Dumbbell, Target, Zap, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getSessionData } from "@/lib/sessionData";

// Exercise Card Component based on Figma design
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

function ExerciseCard({ exercise, isCompleted, onClick }: ExerciseCardProps) {
  // Calculate estimated time based on sets (rough estimate: 2 minutes per set)
  const estimatedTime = Math.ceil(exercise.sets * 2);
  
  return (
    <div 
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors",
        isCompleted ? "bg-transparent" : "bg-[#171716]"
      )}
      onClick={onClick}
    >
      {/* Exercise Info */}
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "text-[14px] font-semibold truncate",
          isCompleted ? "text-muted-foreground" : "text-foreground"
        )}>
          {exercise.name}
        </h4>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{estimatedTime} min</span>
          <span>•</span>
          <span>{exercise.reps} x {exercise.sets}</span>
        </div>
      </div>

      {/* Status Icon */}
      <div className="flex-shrink-0">
        {isCompleted ? (
          <Check className="h-5 w-5 text-muted-foreground" />
        ) : (
          <div className="w-8 h-8 bg-[#292928] rounded-full flex items-center justify-center">
            <Play className="h-4 w-4 text-foreground ml-0.5" />
          </div>
        )}
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
  
  // Get the selected day from URL params or default to current day (17)
  const urlParams = new URLSearchParams(window.location.search);
  const selectedDay = parseInt(urlParams.get('day') || '17', 10);
  
  // Get session data for the selected day
  const sessionData = getSessionData(selectedDay);

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

  const routineTypeOrder = ["strength", "movement", "throwing", "recovery"];

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

  const goToFocusView = () => {
    setLocation("/focus-view");
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
              Tuesday, Oct 17 Session
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


      {/* Removed top routine progress bar per request */}


      {/* Floating Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-40">
        <div className="px-4">
          <Button className="w-full" onClick={goToFocusView}>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base text-white font-['Montserrat'] capitalize">
                    {routine.type}
                  </h3>
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

              {/* Routine Progress by Sections */}
              <div className="mb-4">
                <div className="flex gap-1">
                  {routine.exercises.map((exercise: any, index: number) => {
                    // Make first exercise in Strength routine completed by default
                    const isExerciseCompleted = routine.type === "strength" && index === 0 
                      ? true 
                      : exercise.completedSets >= exercise.sets;
                    return (
                      <div
                        key={index}
                        className="flex-1 h-2 rounded-full bg-neutral-800 relative"
                      >
                        {isExerciseCompleted && (
                          <div 
                            className="h-2 bg-[#c4af6c] rounded-full transition-all duration-300 w-full"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Exercise List */}
              <div className="space-y-2">
                {(routine.exercises as any[]).map((exercise: any, index: number) => {
                  // Make first exercise in Strength routine completed by default
                  const isExerciseCompleted = routine.type === "strength" && index === 0 
                    ? true 
                    : exercise.completedSets >= exercise.sets;
                  
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
                      onClick={goToFocusView}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="px-4 py-4">
          <Button className="w-full h-12 text-base font-semibold" onClick={goToFocusView}>
            <Play className="h-5 w-5 mr-2" />
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
