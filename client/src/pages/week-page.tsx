import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MobileTabBar from "@/components/MobileTabBar";
import { cn } from "@/lib/utils";
import { format, addDays, startOfWeek, endOfWeek, isToday, isSameDay } from "date-fns";

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
  throwing: "🎯",
  movement: "⚡",
  lifting: "🏋️",
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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
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
      <div className="p-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {weekData.days.map((day) => {
            const isSelected = isSameDay(new Date(day.date), selectedDate);
            const isTodayDate = new Date(day.date).getDate() === 15; // Current day is 15
            const isPastDay = new Date(day.date).getDate() < 15; // Previous days are disabled
            const isDisabled = isPastDay;
            
            return (
              <Button
                key={day.date}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => !isDisabled && setSelectedDate(new Date(day.date))}
                disabled={isDisabled}
                className={cn(
                  "flex-shrink-0 min-w-[80px] flex-col h-16 gap-1",
                  isTodayDate && "ring-2 ring-primary/50",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <span className="text-xs font-medium">{day.dayOfWeek.slice(0, 3)}</span>
                <span className="text-sm font-semibold">{new Date(day.date).getDate()}</span>
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
                  {selectedDaySchedule?.isRestDay ? "Rest day" : "Training session"}
                </CardTitle>
                {!selectedDaySchedule?.isRestDay && (
                  <CardDescription>
                    Block {weekData.blockId} • Week {weekData.weekNumber}
                  </CardDescription>
                )}
              </div>
              {!selectedDaySchedule?.isRestDay && (
                <Badge variant="outline">View</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedDaySchedule?.isRestDay ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl">😴</span>
                </div>
                <p className="text-lg font-semibold mb-2">Rest day</p>
                <p className="text-muted-foreground">
                  Take time to recover and prepare for tomorrow's training.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDaySchedule?.routines.map((routine) => (
                  <div 
                    key={routine.type}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">{routineTypeIcons[routine.type as keyof typeof routineTypeIcons]}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{routine.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {routine.exerciseCount} exercises • {routine.estimatedTime}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {routine.status === "not-started" ? "Not started" : "In progress"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <MobileTabBar />
    </div>
  );
}
