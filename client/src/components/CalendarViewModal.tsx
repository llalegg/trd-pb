import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Target, Zap, Dumbbell, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

interface CalendarViewModalProps {
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

// Mock data for calendar
const mockCalendarData = {
  "2025-01-20": {
    routines: ["throwing", "movement", "lifting"],
    isRestDay: false,
    isComplete: false
  },
  "2025-01-21": {
    routines: [],
    isRestDay: true,
    isComplete: false
  },
  "2025-01-22": {
    routines: ["throwing", "movement"],
    isRestDay: false,
    isComplete: true
  },
  "2025-01-23": {
    routines: ["lifting", "movement"],
    isRestDay: false,
    isComplete: false
  },
  "2025-01-24": {
    routines: ["throwing"],
    isRestDay: false,
    isComplete: false
  },
  "2025-01-25": {
    routines: [],
    isRestDay: true,
    isComplete: false
  },
  "2025-01-26": {
    routines: [],
    isRestDay: true,
    isComplete: false
  },
  // Add more days for the month
  "2025-01-27": {
    routines: ["throwing", "movement", "lifting"],
    isRestDay: false,
    isComplete: false
  },
  "2025-01-28": {
    routines: [],
    isRestDay: true,
    isComplete: false
  },
  "2025-01-29": {
    routines: ["throwing", "movement"],
    isRestDay: false,
    isComplete: false
  },
  "2025-01-30": {
    routines: ["lifting", "movement"],
    isRestDay: false,
    isComplete: false
  },
  "2025-01-31": {
    routines: ["throwing"],
    isRestDay: false,
    isComplete: false
  }
};

const routineTypeIcons = {
  throwing: Target,
  movement: Zap,
  lifting: Dumbbell,
};


export default function CalendarViewModal({ onClose, onDateSelect, selectedDate }: CalendarViewModalProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
    onClose();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const getDayData = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return mockCalendarData[dateKey as keyof typeof mockCalendarData] || {
      routines: [],
      isRestDay: false,
      isComplete: false
    };
  };

  const getRoutineIcon = (routineType: string) => {
    const IconComponent = routineTypeIcons[routineType as keyof typeof routineTypeIcons];
    return (
      <div key={routineType} className="w-2 h-2 rounded-full bg-muted" />
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Training Calendar</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Tap any day to view that day's training schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {monthDays.map((day) => {
              const dayData = getDayData(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              
              return (
                <Button
                  key={day.toISOString()}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    "h-12 flex-col gap-1 p-1",
                    !isCurrentMonth && "text-muted-foreground/50",
                    isSelected && "bg-primary text-primary-foreground",
                    dayData.isComplete && "bg-muted/20",
                    dayData.isRestDay && !isSelected && "bg-muted"
                  )}
                >
                  <span className="text-sm font-medium">
                    {format(day, "d")}
                  </span>
                  
                  {/* Routine Indicators */}
                  <div className="flex gap-0.5">
                    {dayData.isRestDay ? (
                      <Moon className="h-2 w-2 text-muted-foreground" />
                    ) : (
                      dayData.routines.slice(0, 3).map(routineType => 
                        getRoutineIcon(routineType)
                      )
                    )}
                  </div>
                  
                  {/* Completion Indicator */}
                  {dayData.isComplete && (
                      <div className="w-1 h-1 rounded-full bg-muted" />
                  )}
                </Button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold text-sm">Legend</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span>Throwing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span>Movement</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span>Lifting</span>
              </div>
              <div className="flex items-center gap-2">
                <Moon className="h-3 w-3 text-muted-foreground" />
                <span>Rest Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted/20" />
                <span>Completed Day</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-2 pt-4 border-t">
            <h4 className="font-semibold text-sm">This Month</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Training Days</p>
                <p className="font-semibold">20</p>
              </div>
              <div>
                <p className="text-muted-foreground">Completed</p>
                <p className="font-semibold">5</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
