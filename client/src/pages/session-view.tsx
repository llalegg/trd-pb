import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Play, CheckCircle, Dumbbell, Target, Zap, Edit3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getSessionData } from "@/lib/sessionData";

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
  
  // Get the selected day from URL params or default to current day (17)
  const urlParams = new URLSearchParams(window.location.search);
  const selectedDay = parseInt(urlParams.get('day') || '17', 10);
  
  // Get session data for the selected day
  const sessionData = getSessionData(selectedDay);

  const routineTypeIcons = {
    throwing: Target,
    movement: Zap,
    strength: Dumbbell,
    recovery: Zap,
  };

  const routineTypeOrder = ["throwing", "movement", "strength", "recovery"];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Play className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      default:
        return "Not started";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      default:
        return "text-muted-foreground";
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/home")}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-semibold">{sessionData.sessionName}</h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(sessionData.date), "EEEE, MMMM d, yyyy")}
            </p>
            <div className="flex gap-2 items-center justify-center mt-1">
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground rounded-full px-2 py-1 text-xs">
                Block 1
              </Badge>
              <Badge variant="outline" className="bg-background border-border rounded-full px-2 py-1 text-xs">
                Week 1
              </Badge>
            </div>
          </div>
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/program-page")}
              className="p-2"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Duration Summary Card */}
      <div className="px-4 py-4">
        <div className="bg-neutral-900 flex flex-col gap-2 items-start p-4 rounded-2xl">
          <p className="text-sm text-muted-foreground">
            Total Duration
          </p>
          <p className="text-2xl sm:text-3xl leading-none text-foreground font-semibold">
            {sessionData.totalDuration}
          </p>
        </div>
      </div>

      {/* Removed top routine progress bar per request */}


      {/* Floating Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-40">
        <div className="px-4">
          <Button className="w-full" onClick={goToFocusView}>
            <Play className="h-4 w-4 mr-2" />
            Continue
          </Button>
        </div>
      </div>

      {/* Routine Cards */}
      <div className="px-4 pb-4 space-y-6">
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
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-lg bg-muted flex items-center justify-center",
                    isCompleted && "opacity-60"
                  )}>
                    <IconComponent className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{routine.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {routine.exerciseCount} exercises • {routine.estimatedTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-medium", getStatusColor(routine.status))}>
                    {getStatusText(routine.status)}
                  </span>
                  {routine.status === "completed" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartRoutine(routine.type)}
                      className="p-2"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Routine Progress by Sections */}
              <div className="mb-4">
                <div className="flex gap-1">
                  {routine.exercises.map((exercise: any, index: number) => {
                    const exerciseProgress = exercise.sets > 0 ? (exercise.completedSets / exercise.sets) * 100 : 0;
                    return (
                      <div
                        key={index}
                        className="flex-1 h-2 rounded-full bg-muted relative"
                      >
                        <div 
                          className="h-2 bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${exerciseProgress}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {routine.exercises.reduce((sum: number, ex: any) => sum + ex.completedSets, 0)}/{routine.exercises.reduce((sum: number, ex: any) => sum + ex.sets, 0)} sets completed
                </p>
              </div>

              {/* Exercise List */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-2">
                  {(routine.exercises as any[]).map((exercise: any, index: number) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between gap-3 p-2 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <CircularProgress progress={exercise.progress || 0} size={20} />
                        <div className="min-w-0">
                          <p className="text-sm text-foreground truncate">{exercise.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {exercise.sets} sets × {exercise.reps}
                            {exercise.weight ? ` × ${exercise.weight} lbs` : ""}
                          </p>
                        </div>
                      </div>
                      <Button size="icon" variant={index === 0 ? "default" : "ghost"} onClick={goToFocusView}>
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Session Actions */}
      <div className="px-4 pb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <h3 className="font-semibold">Session complete?</h3>
              <p className="text-sm text-muted-foreground">
                Mark this session as complete when you've finished all routines.
              </p>
              <Button 
                className="w-full"
                disabled={completedRoutines < totalRoutines}
                onClick={() => {/* TODO: Complete session */}}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
