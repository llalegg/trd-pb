import { useState } from "react";
import { ChevronLeft, ChevronRight, Moon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: string;
  selectedDay: number;
  onDaySelect: (day: number) => void;
  onMonthChange: (month: string) => void;
}

// Generate random routine data for 4 weeks (28 days)
const generateRandomRoutines = () => {
  const routines = [];
  for (let i = 1; i <= 28; i++) {
    const isRestDay = Math.random() < 0.2; // 20% chance of rest day
    const routineCount = isRestDay ? 0 : Math.floor(Math.random() * 4) + 1; // 1-4 routines
    routines.push({
      day: i,
      isRestDay,
      routineCount,
      isCurrent: i === 17 // Current day
    });
  }
  return routines;
};

export default function CalendarBottomSheet({
  isOpen,
  onClose,
  selectedMonth,
  selectedDay,
  onDaySelect,
  onMonthChange
}: CalendarBottomSheetProps) {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(6); // July is index 6
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const routines = generateRandomRoutines();

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (currentMonthIndex > 0 ? currentMonthIndex - 1 : 11)
      : (currentMonthIndex < 11 ? currentMonthIndex + 1 : 0);
    
    setCurrentMonthIndex(newIndex);
    onMonthChange(months[newIndex]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-700 rounded-t-3xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleMonthChange('prev')}
              className="p-2 hover:bg-neutral-800 rounded-xl transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <h2 className="text-xl font-semibold text-white">{months[currentMonthIndex]} 2024</h2>
            <button
              onClick={() => handleMonthChange('next')}
              className="p-2 hover:bg-neutral-800 rounded-xl transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-xl transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Calendar Content */}
        <div className="p-6 overflow-y-auto">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
              <div key={day} className="text-center text-sm text-muted-foreground p-2 font-medium">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days - Show only 4 weeks (28 days) */}
          <div className="grid grid-cols-7 gap-1">
            {routines.map((dayData) => (
              <button
                key={dayData.day}
                onClick={() => {
                  onDaySelect(dayData.day);
                  onClose();
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-colors min-h-[60px] ${
                  dayData.day === selectedDay
                    ? "bg-primary text-primary-foreground"
                    : dayData.isCurrent
                    ? "bg-accent-foreground/10 text-accent-foreground border border-accent-foreground"
                    : "text-white hover:bg-neutral-800"
                }`}
              >
                <span className="text-sm font-medium mb-1">{dayData.day}</span>
                
                {/* Rest day moon icon or routine dots */}
                {dayData.isRestDay ? (
                  <Moon className="h-3 w-3 text-muted-foreground" />
                ) : dayData.routineCount > 0 ? (
                  <div className="flex gap-0.5">
                    {Array.from({ length: Math.min(dayData.routineCount, 3) }, (_, i) => (
                      <div key={i} className="h-1 w-1 rounded-full bg-accent-foreground" />
                    ))}
                    {dayData.routineCount > 3 && (
                      <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                    )}
                  </div>
                ) : (
                  <div className="h-1 w-1" />
                )}
                
                {dayData.isCurrent && (
                  <div className="h-1 w-1 rounded-full bg-accent-foreground mt-1" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
