import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Play, CheckCircle, Clock, Dumbbell, Target, Zap, Moon, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format, addDays, startOfWeek, endOfWeek, isToday, isSameDay } from "date-fns";
import MobileTabBar from "@/components/MobileTabBar";

// Mock data for athlete program
const mockProgram = {
  id: "1",
  programId: "P123456",
  athleteName: "Sarah Johnson",
  startDate: "2025-01-15",
  endDate: "2025-03-15",
  routineTypes: ["throwing", "movement", "lifting"],
  blockDuration: 8,
};

const mockWeekSchedule = [
  {
    date: "2025-01-20",
    dayOfWeek: "Monday",
    isRestDay: false,
    routines: [
      { type: "throwing", name: "Throwing Session", exerciseCount: 6, estimatedTime: "45 min", status: "not-started" },
      { type: "movement", name: "Movement Prep", exerciseCount: 4, estimatedTime: "30 min", status: "not-started" },
      { type: "lifting", name: "Upper Body Strength", exerciseCount: 8, estimatedTime: "60 min", status: "not-started" },
    ]
  },
  {
    date: "2025-01-21",
    dayOfWeek: "Tuesday",
    isRestDay: true,
    routines: []
  },
  {
    date: "2025-01-22",
    dayOfWeek: "Wednesday",
    isRestDay: false,
    routines: [
      { type: "throwing", name: "Throwing Session", exerciseCount: 5, estimatedTime: "40 min", status: "not-started" },
      { type: "movement", name: "Recovery Movement", exerciseCount: 3, estimatedTime: "25 min", status: "not-started" },
    ]
  },
  {
    date: "2025-01-23",
    dayOfWeek: "Thursday",
    isRestDay: false,
    routines: [
      { type: "lifting", name: "Lower Body Strength", exerciseCount: 7, estimatedTime: "55 min", status: "not-started" },
      { type: "movement", name: "Movement Prep", exerciseCount: 4, estimatedTime: "30 min", status: "not-started" },
    ]
  },
  {
    date: "2025-01-24",
    dayOfWeek: "Friday",
    isRestDay: false,
    routines: [
      { type: "throwing", name: "Throwing Session", exerciseCount: 6, estimatedTime: "45 min", status: "not-started" },
    ]
  },
  {
    date: "2025-01-25",
    dayOfWeek: "Saturday",
    isRestDay: true,
    routines: []
  },
  {
    date: "2025-01-26",
    dayOfWeek: "Sunday",
    isRestDay: true,
    routines: []
  },
];

const routineTypeIcons = {
  throwing: Target,
  movement: Zap,
  lifting: Dumbbell,
};

export default function AthleteView() {
  const [, setLocation] = useLocation();
  const [selectedDate, setSelectedDate] = useState(new Date("2025-01-20"));
  
  // Get current week's schedule
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  
  const currentWeekSchedule = mockWeekSchedule.map(day => ({
    ...day,
    dateObj: new Date(day.date)
  }));

  const todaySchedule = currentWeekSchedule.find(day => isToday(day.dateObj));
  const selectedDaySchedule = currentWeekSchedule.find(day => isSameDay(day.dateObj, selectedDate));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Play className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "complete":
        return "Complete";
      case "in-progress":
        return "In Progress";
      default:
        return "Not Started";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">


      {/* Day Selector */}
      <div className="p-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {currentWeekSchedule.map((day) => {
            const isSelected = isSameDay(day.dateObj, selectedDate);
            const isTodayDate = day.dateObj.getDate() === 20; // Current day is 20
            const isPastDay = day.dateObj.getDate() < 20; // Previous days are disabled
            const isDisabled = isPastDay;
            
            return (
              <Button
                key={day.date}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => !isDisabled && setSelectedDate(day.dateObj)}
                disabled={isDisabled}
                className={cn(
                  "flex-shrink-0 min-w-[80px] flex-col h-16 gap-1",
                  isTodayDate && "ring-2 ring-primary/50",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <span className="text-xs font-medium">{day.dayOfWeek.slice(0, 3)}</span>
                <span className="text-sm font-semibold">{day.dateObj.getDate()}</span>
                {day.isRestDay && (
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Training Session Card */}
      <div className="px-4 pb-4">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => !selectedDaySchedule?.isRestDay && setLocation("/session-view")}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {selectedDaySchedule?.isRestDay ? "Rest Day" : "Training Session"}
                </CardTitle>
                {!selectedDaySchedule?.isRestDay && (
                  <CardDescription>
                    Block 1 • Week 1
                  </CardDescription>
                )}
              </div>
              {!selectedDaySchedule?.isRestDay && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedDaySchedule?.isRestDay ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Moon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Rest Day</h3>
                <p className="text-muted-foreground">
                  Take time to recover and prepare for tomorrow's training.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDaySchedule?.routines.map((routine) => {
                  const IconComponent = routineTypeIcons[routine.type as keyof typeof routineTypeIcons];
                  
                  return (
                    <div 
                      key={routine.type}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{routine.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {routine.exerciseCount} exercises • {routine.estimatedTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(routine.status)}
                        <span className="text-xs text-muted-foreground">
                          {getStatusText(routine.status)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>



      <MobileTabBar />
    </div>
  );
}
