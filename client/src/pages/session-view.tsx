import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Play, CheckCircle, Dumbbell, Target, Zap, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Mock data for session
const mockSession = {
  date: "2025-01-20",
  dayOfWeek: "Monday",
  sessionName: "Monday training session",
  totalDuration: "2h 15m",
  routines: [
    {
      type: "throwing",
      name: "Throwing session",
      exerciseCount: 6,
      estimatedTime: "45 min",
      status: "not-started",
      description: "Focus on mechanics and velocity development",
      exercises: [
        "Dynamic warm-up throws",
        "Long toss progression",
        "Bullpen session",
        "Velocity tracking",
        "Mechanical drills",
        "Cool down throws"
      ]
    },
    {
      type: "movement",
      name: "Movement prep",
      exerciseCount: 4,
      estimatedTime: "30 min", 
      status: "not-started",
      description: "Dynamic warm-up and mobility work",
      exercises: [
        "Hip mobility circuit",
        "Shoulder activation",
        "Core stability work",
        "Movement patterns"
      ]
    },
    {
      type: "lifting",
      name: "Upper body strength",
      exerciseCount: 8,
      estimatedTime: "60 min",
      status: "not-started",
      description: "Progressive overload training",
      exercises: [
        "Bench press",
        "Pull-ups",
        "Shoulder press",
        "Rows",
        "Tricep extensions",
        "Bicep curls",
        "Lateral raises",
        "Face pulls"
      ]
    },
  ]
};

const routineTypeIcons = {
  throwing: Target,
  movement: Zap,
  lifting: Dumbbell,
};

const routineTypeColors = {
  throwing: "bg-blue-500",
  movement: "bg-green-500",
  lifting: "bg-orange-500",
};

const routineTypeOrder = ["throwing", "movement", "lifting"];

export default function SessionView() {
  const [, setLocation] = useLocation();
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);

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

  // Sort routines by recommended order
  const sortedRoutines = mockSession.routines.sort((a, b) => {
    const aIndex = routineTypeOrder.indexOf(a.type);
    const bIndex = routineTypeOrder.indexOf(b.type);
    return aIndex - bIndex;
  });

  const completedRoutines = mockSession.routines.filter(r => r.status === "completed").length;
  const totalRoutines = mockSession.routines.length;
  const progressPercentage = (completedRoutines / totalRoutines) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/athlete-view")}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-semibold">{mockSession.sessionName}</h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(mockSession.date), "EEEE, MMMM d, yyyy")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total duration: {mockSession.totalDuration}
            </p>
          </div>
          <div className="w-8" />
        </div>
      </div>

      {/* Subtle Progress Bar */}
      <div className="px-4 py-2">
        <div className="w-full bg-muted rounded-full h-1">
          <div 
            className="bg-primary h-1 rounded-full transition-all duration-300" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{completedRoutines} of {totalRoutines} completed</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
      </div>


      {/* Routine Cards */}
      <div className="px-4 pb-4 space-y-4">
        {sortedRoutines.map((routine) => {
          const IconComponent = routineTypeIcons[routine.type as keyof typeof routineTypeIcons];
          const colorClass = routineTypeColors[routine.type as keyof typeof routineTypeColors];
          const isCompleted = routine.status === "completed";
          
          return (
            <Card 
              key={routine.type}
              className={cn(
                "transition-all duration-200",
                isCompleted && "opacity-75",
                !isCompleted && "hover:shadow-md"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      colorClass,
                      isCompleted && "opacity-60"
                    )}>
                      <IconComponent className="h-6 w-6 text-white" />
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartRoutine(routine.type)}
                      className="p-2"
                    >
                      {isCompleted ? (
                        <Edit3 className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {routine.description}
                </p>

                {/* Exercise List */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Exercises:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {routine.exercises.map((exercise, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                      >
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                        <span className="text-sm text-foreground">{exercise}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
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
