import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Calendar, Play, CheckCircle, Dumbbell, Target, Zap, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MobileTabBar from "@/components/MobileTabBar";
import { cn } from "@/lib/utils";
import { format, addDays, startOfWeek, endOfWeek, isToday, isSameDay } from "date-fns";
import { getExercisesForDay } from "@/lib/sessionData";

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

// Mock data for week view - Week starts Monday, ends Sunday
const mockWeekSchedule = {
  "1-1": { // Block 1, Week 1
    blockId: 1,
    weekNumber: 1,
    startDate: "2025-01-15",
    endDate: "2025-01-21",
    days: [
      {
        date: "2025-01-15",
        dayOfWeek: "Wednesday",
        isRestDay: false,
        routines: [
          { type: "movement", name: "Recovery session", exerciseCount: 3, estimatedTime: "20 min", status: "not-started" }
        ]
      },
      {
        date: "2025-01-16",
        dayOfWeek: "Thursday",
        isRestDay: false,
        routines: [
          { type: "lifting", name: "Lower body strength", exerciseCount: 6, estimatedTime: "45 min", status: "not-started" }
        ]
      },
      {
        date: "2025-01-17",
        dayOfWeek: "Friday",
        isRestDay: false,
        routines: [
          { type: "throwing", name: "Throwing session", exerciseCount: 6, estimatedTime: "45 min", status: "not-started" },
          { type: "movement", name: "Movement prep", exerciseCount: 4, estimatedTime: "30 min", status: "not-started" }
        ]
      },
      {
        date: "2025-01-18",
        dayOfWeek: "Saturday",
        isRestDay: false,
        routines: [
          { type: "lifting", name: "Upper body strength", exerciseCount: 8, estimatedTime: "60 min", status: "not-started" }
        ]
      },
      {
        date: "2025-01-19",
        dayOfWeek: "Sunday",
        isRestDay: true,
        routines: []
      },
      {
        date: "2025-01-20",
        dayOfWeek: "Monday",
        isRestDay: false,
        routines: [
          { type: "throwing", name: "Bullpen session", exerciseCount: 4, estimatedTime: "30 min", status: "not-started" }
        ]
      },
      {
        date: "2025-01-21",
        dayOfWeek: "Tuesday",
        isRestDay: true,
        routines: []
      }
    ]
  },
  "1-2": { // Block 1, Week 2
    blockId: 1,
    weekNumber: 2,
    startDate: "2025-01-22",
    endDate: "2025-01-28",
    days: [
      {
        date: "2025-01-22",
        dayOfWeek: "Wednesday",
        isRestDay: false,
        routines: [
          { type: "lifting", name: "Lower body power", exerciseCount: 5, estimatedTime: "40 min", status: "not-started" }
        ]
      },
      {
        date: "2025-01-23",
        dayOfWeek: "Thursday",
        isRestDay: false,
        routines: [
          { type: "throwing", name: "Bullpen session", exerciseCount: 4, estimatedTime: "30 min", status: "not-started" }
        ]
      },
      {
        date: "2025-01-24",
        dayOfWeek: "Friday",
        isRestDay: false,
        routines: [
          { type: "lifting", name: "Upper body power", exerciseCount: 6, estimatedTime: "50 min", status: "not-started" }
        ]
      },
      {
        date: "2025-01-25",
        dayOfWeek: "Saturday",
        isRestDay: false,
        routines: [
          { type: "movement", name: "Recovery session", exerciseCount: 3, estimatedTime: "20 min", status: "not-started" }
        ]
      },
      {
        date: "2025-01-26",
        dayOfWeek: "Sunday",
        isRestDay: true,
        routines: []
      },
      {
        date: "2025-01-27",
        dayOfWeek: "Monday",
        isRestDay: false,
        routines: [
          { type: "throwing", name: "Throwing session", exerciseCount: 6, estimatedTime: "45 min", status: "not-started" }
        ]
      },
      {
        date: "2025-01-28",
        dayOfWeek: "Tuesday",
        isRestDay: true,
        routines: []
      }
    ]
  },
  "1-3": { // Block 1, Week 3
    blockId: 1,
    weekNumber: 3,
    startDate: "2025-01-29",
    endDate: "2025-02-04",
    days: [
      {
        date: "2025-01-29",
        dayOfWeek: "Wednesday",
        isRestDay: false,
        routines: [
          { type: "lifting", name: "Lower body strength", exerciseCount: 7, estimatedTime: "55 min", status: "not-started" }
        ]
      },
      {
        date: "2025-01-30",
        dayOfWeek: "Thursday",
        isRestDay: false,
        routines: [
          { type: "throwing", name: "Bullpen session", exerciseCount: 5, estimatedTime: "35 min", status: "not-started" }
        ]
      },
      {
        date: "2025-01-31",
        dayOfWeek: "Friday",
        isRestDay: false,
        routines: [
          { type: "lifting", name: "Upper body strength", exerciseCount: 8, estimatedTime: "60 min", status: "not-started" }
        ]
      },
      {
        date: "2025-02-01",
        dayOfWeek: "Saturday",
        isRestDay: false,
        routines: [
          { type: "movement", name: "Recovery session", exerciseCount: 4, estimatedTime: "25 min", status: "not-started" }
        ]
      },
      {
        date: "2025-02-02",
        dayOfWeek: "Sunday",
        isRestDay: true,
        routines: []
      },
      {
        date: "2025-02-03",
        dayOfWeek: "Monday",
        isRestDay: false,
        routines: [
          { type: "throwing", name: "Throwing session", exerciseCount: 6, estimatedTime: "45 min", status: "not-started" }
        ]
      },
      {
        date: "2025-02-04",
        dayOfWeek: "Tuesday",
        isRestDay: true,
        routines: []
      }
    ]
  },
  "1-4": { // Block 1, Week 4
    blockId: 1,
    weekNumber: 4,
    startDate: "2025-02-05",
    endDate: "2025-02-11",
    days: [
      {
        date: "2025-02-05",
        dayOfWeek: "Wednesday",
        isRestDay: false,
        routines: [
          { type: "lifting", name: "Lower body power", exerciseCount: 6, estimatedTime: "45 min", status: "not-started" }
        ]
      },
      {
        date: "2025-02-06",
        dayOfWeek: "Thursday",
        isRestDay: false,
        routines: [
          { type: "throwing", name: "Bullpen session", exerciseCount: 4, estimatedTime: "30 min", status: "not-started" }
        ]
      },
      {
        date: "2025-02-07",
        dayOfWeek: "Friday",
        isRestDay: false,
        routines: [
          { type: "lifting", name: "Upper body power", exerciseCount: 7, estimatedTime: "55 min", status: "not-started" }
        ]
      },
      {
        date: "2025-02-08",
        dayOfWeek: "Saturday",
        isRestDay: false,
        routines: [
          { type: "movement", name: "Recovery session", exerciseCount: 3, estimatedTime: "20 min", status: "not-started" }
        ]
      },
      {
        date: "2025-02-09",
        dayOfWeek: "Sunday",
        isRestDay: true,
        routines: []
      },
      {
        date: "2025-02-10",
        dayOfWeek: "Monday",
        isRestDay: false,
        routines: [
          { type: "throwing", name: "Throwing session", exerciseCount: 6, estimatedTime: "45 min", status: "not-started" }
        ]
      },
      {
        date: "2025-02-11",
        dayOfWeek: "Tuesday",
        isRestDay: true,
        routines: []
      }
    ]
  },
  "2-1": { // Block 2, Week 1
    blockId: 2,
    weekNumber: 1,
    startDate: "2025-02-12",
    endDate: "2025-02-18",
    days: [
      {
        date: "2025-02-12",
        dayOfWeek: "Wednesday",
        isRestDay: false,
        routines: [
          { type: "lifting", name: "Lower body strength", exerciseCount: 8, estimatedTime: "60 min", status: "not-started" }
        ]
      },
      {
        date: "2025-02-13",
        dayOfWeek: "Thursday",
        isRestDay: false,
        routines: [
          { type: "throwing", name: "Bullpen session", exerciseCount: 5, estimatedTime: "35 min", status: "not-started" }
        ]
      },
      {
        date: "2025-02-14",
        dayOfWeek: "Friday",
        isRestDay: false,
        routines: [
          { type: "lifting", name: "Upper body strength", exerciseCount: 9, estimatedTime: "65 min", status: "not-started" }
        ]
      },
      {
        date: "2025-02-15",
        dayOfWeek: "Saturday",
        isRestDay: false,
        routines: [
          { type: "movement", name: "Recovery session", exerciseCount: 4, estimatedTime: "25 min", status: "not-started" }
        ]
      },
      {
        date: "2025-02-16",
        dayOfWeek: "Sunday",
        isRestDay: true,
        routines: []
      },
      {
        date: "2025-02-17",
        dayOfWeek: "Monday",
        isRestDay: false,
        routines: [
          { type: "throwing", name: "Throwing session", exerciseCount: 7, estimatedTime: "50 min", status: "not-started" }
        ]
      },
      {
        date: "2025-02-18",
        dayOfWeek: "Tuesday",
        isRestDay: true,
        routines: []
      }
    ]
  }
};

const routineTypeIcons = {
  throwing: Target,
  movement: Zap,
  lifting: Dumbbell,
  strength: Dumbbell,
  recovery: Zap,
};

  const routineTypeOrder = ["movement", "strength", "throwing", "lifting", "recovery"];

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
      return "";
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

export default function WeekPage() {
  const [, setLocation] = useLocation();
  const [selectedDate, setSelectedDate] = useState(new Date("2025-01-15"));
  const [showCalendar, setShowCalendar] = useState(false);

  // Parse URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const blockId = parseInt(urlParams.get("block") || "1");
  const weekNumber = parseInt(urlParams.get("week") || "1");
  const weekKey = `${blockId}-${weekNumber}`;
  
  const weekData = mockWeekSchedule[weekKey as keyof typeof mockWeekSchedule];
  
  if (!weekData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Week not found</h2>
            <p className="text-muted-foreground mb-4">This week is not available yet.</p>
            <Button onClick={() => setLocation("/program-page")}>
              Back to Program
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedDaySchedule = weekData.days.find(day => isSameDay(new Date(day.date), selectedDate));
  
  // Get detailed session data for the selected day
  const selectedDayNumber = selectedDate.getDate();
  const sessionRoutines = getExercisesForDay(selectedDayNumber);
  
  // Calculate total duration
  const totalDuration = sessionRoutines.reduce((total, routine) => {
    const timeStr = routine.estimatedTime;
    const minutes = parseInt(timeStr.match(/\d+/)?.[0] || '0');
    return total + minutes;
  }, 0);
  
  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes} min`;
  };

  return (
    <div className="bg-neutral-950 relative min-h-screen w-full pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-neutral-950 border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/program-page")}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-semibold">Block {weekData.blockId} • Week {weekData.weekNumber}</h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(weekData.startDate), "MMM d")} - {format(new Date(weekData.endDate), "MMM d, yyyy")}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCalendar(true)}
            className="p-2"
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex gap-2 items-center w-full overflow-x-auto pb-2 pl-4 pr-4">
        {weekData.days.map((day) => {
          const isSelected = isSameDay(new Date(day.date), selectedDate);
          const isTodayDate = new Date(day.date).getDate() === 15; // Current day is 15
          const isPastDay = new Date(day.date).getDate() < 15; // Previous days are disabled
          const isDisabled = isPastDay;
          const routineCount = day.routines.length;
          
          return (
            <button
              key={day.date}
              onClick={() => !isDisabled && setSelectedDate(new Date(day.date))}
              disabled={isDisabled}
              className={cn(
                "flex flex-col gap-1 items-center justify-center p-3 rounded-2xl min-w-[70px] h-[80px] shrink-0 transition-colors",
                isTodayDate
                  ? "border-2 border-accent-foreground bg-accent-foreground/10"
                  : isSelected
                  ? "border border-accent-foreground bg-accent-foreground/5"
                  : "border border-border hover:border-accent-foreground/50",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <p className="text-xs sm:text-sm text-muted-foreground">{day.dayOfWeek.slice(0, 3)}</p>
              <p className="text-base sm:text-lg text-foreground font-semibold">{new Date(day.date).getDate()}</p>
              
              {/* Rest day moon icon or routine dots */}
              {day.isRestDay ? (
                <div className="h-3 w-3 rounded-full bg-muted-foreground" />
              ) : routineCount > 0 ? (
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(routineCount, 3) }, (_, i) => (
                    <div key={i} className="h-1 w-1 rounded-full bg-accent-foreground" />
                  ))}
                  {routineCount > 3 && (
                    <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                  )}
                </div>
              ) : (
                <div className="h-1 w-1" />
              )}
              
              {isTodayDate && (
                <div className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-accent-foreground" />
              )}
            </button>
          );
        })}
      </div>

      {/* Duration and Exercises Summary Cards */}
      {!selectedDaySchedule?.isRestDay && sessionRoutines.length > 0 && (
        <div className="px-4 py-4">
          <div className="flex gap-3">
            <div className="bg-neutral-900 flex flex-col gap-2 items-start p-4 rounded-2xl flex-1">
              <p className="text-sm text-muted-foreground">
                Duration
              </p>
              <p className="text-2xl sm:text-3xl leading-none text-foreground font-semibold">
                {formatDuration(totalDuration)}
              </p>
            </div>
            <div className="bg-neutral-900 flex flex-col gap-2 items-start p-4 rounded-2xl flex-1">
              <p className="text-sm text-muted-foreground">
                Exercises
              </p>
              <p className="text-2xl sm:text-3xl leading-none text-foreground font-semibold">
                {sessionRoutines.reduce((sum, routine) => sum + routine.exerciseCount, 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rest Day Display */}
      {selectedDaySchedule?.isRestDay && (
        <div className="px-4 py-4">
          <div className="bg-neutral-900 flex flex-col gap-4 items-center justify-center p-6 rounded-2xl w-full">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl">😴</span>
            </div>
            <p className="text-lg font-semibold mb-2">Rest day</p>
            <p className="text-muted-foreground text-center">
              Take time to recover and prepare for tomorrow's training.
            </p>
          </div>
        </div>
      )}

      {/* Routine Cards */}
      {!selectedDaySchedule?.isRestDay && sessionRoutines.length > 0 && (
        <div className="px-4 pb-4 space-y-8">
          {sessionRoutines.map((routine) => {
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
                        onClick={() => setLocation("/execution-view")}
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
                </div>

                {/* Exercise List */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-2">
                    {(routine.exercises as any[]).map((exercise: any, index: number) => {
                      // Check if this is the first uncompleted exercise across all routines
                      const isFirstUncompleted = (() => {
                        // Find the first uncompleted exercise across all routines
                        for (const r of sessionRoutines) {
                          for (let i = 0; i < r.exercises.length; i++) {
                            const ex = r.exercises[i] as any;
                            const isCompleted = ex.completedSets >= ex.sets;
                            if (!isCompleted) {
                              // This is the first uncompleted exercise
                              return r.type === routine.type && i === index;
                            }
                          }
                        }
                        return false;
                      })();
                      
                      return (
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
                          <Button 
                            size="icon" 
                            variant={isFirstUncompleted ? "default" : "ghost"} 
                            onClick={() => setLocation("/focus-view")}
                          >
                            {exercise.completedSets >= exercise.sets ? (
                              <Edit3 className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <MobileTabBar />
    </div>
  );
}
