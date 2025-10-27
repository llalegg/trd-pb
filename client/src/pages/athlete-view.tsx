import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Bell, Phone, Plus, User } from "lucide-react";
import MobileTabBar from "@/components/MobileTabBar";
import CalendarBottomSheet from "@/components/CalendarBottomSheet";
import { getExercisesForDay } from "@/lib/sessionData";

// Circular Progress Component
function CircularProgress({ progress, size = 32 }: { progress: number; size?: number }) {
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
          stroke="#292928"
          strokeWidth="2"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#c4af6c"
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

export default function AthleteView() {
  const [, setLocation] = useLocation();
  const [selectedMonth, setSelectedMonth] = useState("June");
  const [selectedDay, setSelectedDay] = useState(16);
  const [showCalendarBottomSheet, setShowCalendarBottomSheet] = useState(false);

  // Week days for horizontal selector (matching Figma design)
  const weekDays = [
    { day: "M", date: 15, isCurrent: false, isRestDay: false },
    { day: "T", date: 16, isCurrent: true, isRestDay: false },
    { day: "W", date: 17, isCurrent: false, isRestDay: true },
    { day: "T", date: 18, isCurrent: false, isRestDay: false },
    { day: "F", date: 19, isCurrent: false, isRestDay: false },
    { day: "S", date: 20, isCurrent: false, isRestDay: true },
    { day: "S", date: 21, isCurrent: false, isRestDay: false },
  ];

  const currentRoutines = getExercisesForDay(selectedDay);
  const currentDay = weekDays.find(day => day.date === selectedDay);
  const isRestDay = currentDay?.isRestDay || false;

  const handleDaySelect = (date: number) => {
    setSelectedDay(date);
  };

  return (
    <div className="bg-[#0d0d0c] relative min-h-screen w-full">
      <div className="flex flex-col gap-0 items-start px-0 pt-12 pb-20 w-full">
        {/* Header */}
        <div className="flex items-center justify-between w-full px-4 mb-6">
          <button
            onClick={() => setShowCalendarBottomSheet(true)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <h1 className="text-2xl font-bold text-[#f7f6f2] font-['Montserrat']">{selectedMonth}</h1>
            <ChevronDown className="w-5 h-5 text-[#979795]" />
          </button>
          <div className="relative">
            <button className="p-2 hover:bg-[#171716] rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-[#979795]" />
            </button>
            {/* Notification badge */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#c4af6c] rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-black font-['Montserrat']">1</span>
            </div>
          </div>
        </div>

        {/* Day Selector */}
        <div className="flex gap-0 px-4 w-full mb-6">
          {weekDays.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <p className="text-xs text-[#979795] mb-2 font-['Montserrat'] font-medium">{day.day}</p>
              <button
                onClick={() => handleDaySelect(day.date)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold font-['Montserrat'] transition-colors ${
                  day.isCurrent
                    ? "bg-[#f7f6f2] text-[#0d0d0c]"
                    : "text-[#f7f6f2] hover:bg-[#171716]"
                }`}
              >
                {day.date}
              </button>
            </div>
          ))}
        </div>

        {/* Training Session Card - Only show if not rest day */}
        {!isRestDay && (
          <div className="px-4 w-full mb-6">
            <div className="bg-[#171716] rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#f7f6f2] font-['Montserrat']">Training session</h2>
                </div>
                <Badge variant="secondary" className="bg-[#292928] text-[#f7f6f2] font-['Montserrat'] font-medium">
                  Block 1, Week 1
                </Badge>
              </div>

              {/* Routines */}
              <div className="space-y-3 mb-4">
                {currentRoutines.map((routine, index) => {
                  // Set all exercises as incomplete by default
                  const completedExercises = 0;
                  const totalExercises = routine.exercises.length;
                  const progress = 0;

                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CircularProgress progress={progress} />
                        <div>
                          <p className="text-sm font-medium text-[#f7f6f2] capitalize font-['Montserrat']">
                            {routine.type}
                          </p>
                          <p className="text-xs text-[#979795] font-['Montserrat'] font-medium">
                            {completedExercises}/{totalExercises} exercises
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4">
                          <svg viewBox="0 0 16 16" className="w-4 h-4 text-[#979795]">
                            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1" fill="none" />
                            <path d="M8 4v4l3 2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                          </svg>
                        </div>
                        <p className="text-xs text-[#f7f6f2] font-['Montserrat'] font-medium">{routine.estimatedTime}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button 
                onClick={() => setLocation("/session-view")}
                className="w-full bg-[#e5e4e1] hover:bg-[#f7f6f2] text-[#0d0d0c] font-semibold font-['Montserrat']"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Events Section */}
        <div className="px-4 w-full mb-6">
          <h3 className="text-lg font-semibold text-[#f7f6f2] font-['Montserrat'] mb-3">Events</h3>
          <div className="bg-[#171716] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#292928] rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-[#f7f6f2]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#f7f6f2] font-['Montserrat']">Call with John Andersen</p>
                <p className="text-xs text-[#979795] font-['Montserrat'] font-medium">4:00 – 5:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Tasks Section */}
        <div className="px-4 w-full mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-[#f7f6f2] font-['Montserrat']">My tasks</h3>
            <button className="w-6 h-6 bg-[#292928] rounded-full flex items-center justify-center">
              <Plus className="w-4 h-4 text-[#f7f6f2]" />
            </button>
          </div>
          <div className="bg-[#171716] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-[#979795] rounded"></div>
              <p className="text-sm text-[#f7f6f2] font-['Montserrat'] font-medium">Buy new baseball gloves for my game</p>
            </div>
          </div>
        </div>

        {/* Tread Tasks Section */}
        <div className="px-4 w-full mb-6">
          <h3 className="text-lg font-semibold text-[#f7f6f2] font-['Montserrat'] mb-3">Tread tasks</h3>
          <div className="bg-[#171716] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#c4af6c] rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-[#0d0d0c]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#f7f6f2] font-['Montserrat']">Exercise form check for John Andersen</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileTabBar />

      {showCalendarBottomSheet && (
        <CalendarBottomSheet
          isOpen={showCalendarBottomSheet}
          onClose={() => setShowCalendarBottomSheet(false)}
          selectedMonth={selectedMonth}
          selectedDay={selectedDay}
          onDaySelect={handleDaySelect}
          onMonthChange={setSelectedMonth}
        />
      )}
    </div>
  );
}