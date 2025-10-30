import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, isSameDay, isSameMonth, isToday, addDays } from "date-fns";

// Mock data for all blocks and weeks
const mockProgramCalendar = {
  blocks: [
    {
      id: 1,
      name: "Block 1: Foundation",
      startDate: "2025-01-15",
      endDate: "2025-02-11",
      status: "active",
      weeks: [
        { week: 1, startDate: "2025-01-15", endDate: "2025-01-21", trainingDays: 4 },
        { week: 2, startDate: "2025-01-22", endDate: "2025-01-28", trainingDays: 4 },
        { week: 3, startDate: "2025-01-29", endDate: "2025-02-04", trainingDays: 4 },
        { week: 4, startDate: "2025-02-05", endDate: "2025-02-11", trainingDays: 4 }
      ]
    },
    {
      id: 2,
      name: "Block 2: Strength & Conditioning Development",
      startDate: "2025-02-12",
      endDate: "2025-03-11",
      status: "locked",
      weeks: [
        { week: 1, startDate: "2025-02-12", endDate: "2025-02-18", trainingDays: 4 },
        { week: 2, startDate: "2025-02-19", endDate: "2025-02-25", trainingDays: 4 },
        { week: 3, startDate: "2025-02-26", endDate: "2025-03-04", trainingDays: 4 },
        { week: 4, startDate: "2025-03-05", endDate: "2025-03-11", trainingDays: 4 }
      ]
    },
    {
      id: 3,
      name: "Block 3: Peak Performance",
      startDate: "2025-03-12",
      endDate: "2025-04-08",
      status: "locked",
      weeks: [
        { week: 1, startDate: "2025-03-12", endDate: "2025-03-18", trainingDays: 4 },
        { week: 2, startDate: "2025-03-19", endDate: "2025-03-25", trainingDays: 4 },
        { week: 3, startDate: "2025-03-26", endDate: "2025-04-01", trainingDays: 4 },
        { week: 4, startDate: "2025-04-02", endDate: "2025-04-08", trainingDays: 4 }
      ]
    },
    {
      id: 4,
      name: "Block 4: Maintenance",
      startDate: "2025-04-09",
      endDate: "2025-05-06",
      status: "locked",
      weeks: [
        { week: 1, startDate: "2025-04-09", endDate: "2025-04-15", trainingDays: 4 },
        { week: 2, startDate: "2025-04-16", endDate: "2025-04-22", trainingDays: 4 },
        { week: 3, startDate: "2025-04-23", endDate: "2025-04-29", trainingDays: 4 },
        { week: 4, startDate: "2025-04-30", endDate: "2025-05-06", trainingDays: 4 }
      ]
    }
  ]
};

interface ProgramCalendarModalProps {
  onClose: () => void;
  onWeekSelect?: (blockId: number, weekNumber: number) => void;
}

export default function ProgramCalendarModal({ onClose, onWeekSelect }: ProgramCalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const getWeekForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    for (const block of mockProgramCalendar.blocks) {
      for (const week of block.weeks) {
        if (dateStr >= week.startDate && dateStr <= week.endDate) {
          return { blockId: block.id, weekNumber: week.week, blockName: block.name, status: block.status };
        }
      }
    }
    return null;
  };

  const isTrainingDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    // Mock training days: Mon, Wed, Fri, Sat (4 days per week)
    const dayOfWeek = date.getDay();
    const weekInfo = getWeekForDate(date);
    if (!weekInfo) return false;
    
    // Check if it's a training day based on day of week
    return dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5 || dayOfWeek === 6; // Mon, Wed, Fri, Sat
  };

  const renderCalendarDays = () => {
    const days = [];
    const day = calendarStart;

    while (day <= calendarEnd) {
      const weekInfo = getWeekForDate(day);
      const isTraining = isTrainingDay(day);
      const isCurrentMonth = isSameMonth(day, currentDate);
      const isTodayDate = isToday(day);

      days.push(
        <div
          key={day.toISOString()}
          className={cn(
            "aspect-square flex flex-col items-center justify-center text-xs cursor-pointer transition-all duration-200",
            !isCurrentMonth && "text-muted-foreground opacity-50",
            isTodayDate && "ring-2 ring-primary rounded-full",
            weekInfo && isTraining && "bg-primary/10 rounded-lg"
          )}
          onClick={() => {
            if (weekInfo && onWeekSelect) {
              onWeekSelect(weekInfo.blockId, weekInfo.weekNumber);
              onClose();
            }
          }}
        >
          <span className="font-medium">{format(day, "d")}</span>
          {weekInfo && (
            <div className="flex flex-col items-center gap-1 mt-1">
              {isTraining && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              )}
              <span className="text-xs text-muted-foreground">
                B{weekInfo.blockId}W{weekInfo.weekNumber}
              </span>
            </div>
          )}
        </div>
      );

      day.setDate(day.getDate() + 1);
    }

    return days;
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
          <X className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold">Program calendar</h1>
        <div className="w-8" />
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-7 gap-1 mb-4">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-border">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/10 border border-primary" />
              <span className="text-sm">Training day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted" />
              <span className="text-sm">Rest day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full ring-2 ring-primary" />
              <span className="text-sm">Today</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
