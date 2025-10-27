import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, ChevronLeft, Moon, Calendar, FileText, Play } from "lucide-react";
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

export default function AthleteView() {
  const [, setLocation] = useLocation();
  const [selectedMonth, setSelectedMonth] = useState("Oct");
  const [selectedDay, setSelectedDay] = useState(17);
  const [showCalendarBottomSheet, setShowCalendarBottomSheet] = useState(false);

  // Enhanced week days with routine counts and rest day indicators
  const weekDays = [
    { day: "M", date: 16, isCurrent: false, routineCount: 2, isRestDay: false, isCompleted: true },
    { day: "T", date: 17, isCurrent: true, routineCount: 3, isRestDay: false, isCompleted: false },
    { day: "W", date: 18, isCurrent: false, routineCount: 0, isRestDay: true, isCompleted: false },
    { day: "T", date: 19, isCurrent: false, routineCount: 2, isRestDay: false, isCompleted: false },
    { day: "F", date: 20, isCurrent: false, routineCount: 1, isRestDay: false, isCompleted: false },
    { day: "S", date: 21, isCurrent: false, routineCount: 0, isRestDay: true, isCompleted: false },
    { day: "S", date: 22, isCurrent: false, routineCount: 1, isRestDay: false, isCompleted: false },
  ];

  const currentRoutines = getExercisesForDay(selectedDay);

  return (
    <div className="bg-neutral-950 relative min-h-screen w-full">
      <div className="flex flex-col gap-4 items-start px-0 pt-10 pb-20 w-full">
        {/* Calendar Header */}
        <div className="flex gap-2 items-center w-full px-4">
          <button
            onClick={() => setShowCalendarBottomSheet(true)}
            className="flex gap-2 items-center hover:opacity-80 transition-opacity"
          >
            <Calendar className="h-5 w-5 text-white" />
            <p className="font-medium text-2xl leading-none text-white">
              {selectedMonth}
            </p>
          </button>

        </div>

        {/* Calendar Week View */}
        <div className="flex gap-2 items-center w-full overflow-x-auto pb-2 pl-4 pr-4">
          {weekDays.map((dayData, index) => (
            <button
              key={index}
              onClick={() => setSelectedDay(dayData.date)}
              className={`flex flex-col gap-1 items-center justify-center p-3 rounded-2xl min-w-[70px] h-[80px] shrink-0 transition-colors ${
                dayData.isCurrent
                  ? "border-2 border-accent-foreground bg-accent-foreground/10"
                  : selectedDay === dayData.date
                  ? "border border-accent-foreground bg-accent-foreground/5"
                  : "border border-border hover:border-accent-foreground/50"
              }`}
            >
                  <p className="text-xs sm:text-sm text-muted-foreground">{dayData.day}</p>
                  <p className="text-base sm:text-lg text-foreground font-semibold">{dayData.date}</p>
              
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
                <div className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-accent-foreground" />
              )}
            </button>
          ))}
        </div>

        {/* Stats Cards - Hidden */}
        {/* <div className="flex gap-3 w-full overflow-x-auto pb-2 pl-4 pr-4">
          <div className="bg-neutral-900 flex flex-col gap-2 items-start p-4 rounded-2xl min-w-[140px] shrink-0">
            <p className="text-sm text-muted-foreground">
              Weight lifted (lbs)
            </p>
            <p className="text-2xl sm:text-3xl leading-none text-foreground font-semibold">
              267
            </p>
          </div>
          <div className="bg-neutral-900 flex flex-col gap-2 items-start p-4 rounded-2xl min-w-[140px] shrink-0">
            <p className="text-sm text-muted-foreground">
              Distance (miles)
            </p>
            <p className="text-2xl sm:text-3xl leading-none text-foreground font-semibold">
              2.5
            </p>
          </div>
          <div className="bg-neutral-900 flex flex-col gap-2 items-start p-4 rounded-2xl min-w-[140px] shrink-0">
            <p className="text-sm text-muted-foreground">
              Height (ft/in)
            </p>
            <p className="text-2xl sm:text-3xl leading-none text-foreground font-semibold">
              5'10"
            </p>
          </div>
          <div className="bg-neutral-900 flex flex-col gap-2 items-start p-4 rounded-2xl min-w-[140px] shrink-0">
            <p className="text-sm text-muted-foreground">
              Sets Completed
            </p>
            <p className="text-2xl sm:text-3xl leading-none text-foreground font-semibold">
              12
            </p>
          </div>
          <div className="bg-neutral-900 flex flex-col gap-2 items-start p-4 rounded-2xl min-w-[140px] shrink-0">
            <p className="text-sm text-muted-foreground">
              Workout Time
            </p>
            <p className="text-2xl sm:text-3xl leading-none text-foreground font-semibold">
              2h 15m
            </p>
          </div>
        </div> */}

        {/* Training Session */}
        <div className="flex flex-col gap-3 items-start w-full px-4">
          <div className="flex items-center justify-between w-full">
            <p className="font-medium text-xs text-muted-foreground uppercase">
              TRAINING SESSION
            </p>
            <div className="flex gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Week 1
              </Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Block 1
              </Badge>
            </div>
          </div>

          {/* Throwing Movement & Strength Card */}
          <div className="bg-neutral-900 flex flex-col gap-6 items-end p-2 rounded-2xl w-full">
            <div className="flex flex-col gap-4 items-start w-full">
              <button className="flex gap-4 sm:gap-5 items-center w-full hover:bg-neutral-800/50 p-3 rounded-2xl transition-colors">
                <CircularProgress progress={6} size={32} />
                <div className="flex flex-col gap-1 grow items-start">
                  <p className="font-medium text-base sm:text-lg text-white">
                    Strength
                  </p>
                  <div className="flex gap-3 items-start text-sm text-muted-foreground">
                    <p>4 exercises</p>
                    <p>30 min</p>
                    <p>1/16 sets</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground shrink-0" />
              </button>
              <button className="flex gap-4 sm:gap-5 items-center w-full hover:bg-neutral-800/50 p-3 rounded-2xl transition-colors">
                <CircularProgress progress={0} size={32} />
                <div className="flex flex-col gap-1 grow items-start">
                  <p className="font-medium text-base sm:text-lg text-white">
                    Movement
                  </p>
                  <div className="flex gap-3 items-start text-sm text-muted-foreground">
                    <p>6 exercises</p>
                    <p>45 min</p>
                    <p>0/15 sets</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground shrink-0" />
              </button>
              <button className="flex gap-4 sm:gap-5 items-center w-full hover:bg-neutral-800/50 p-3 rounded-2xl transition-colors">
                <CircularProgress progress={24} size={32} />
                <div className="flex flex-col gap-1 grow items-start">
                  <p className="font-medium text-base sm:text-lg text-white">
                    Throwing
                  </p>
                  <div className="flex gap-3 items-start text-sm text-muted-foreground">
                    <p>6 exercises</p>
                    <p>45 min</p>
                    <p>4/17 sets</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground shrink-0" />
              </button>
            </div>

            {/* Continue Button */}
            <div className="w-full p-2">
              <Button
                className="bg-primary text-primary-foreground flex gap-2 h-12 items-center justify-center px-6 py-3 rounded-full w-full"
                onClick={() => setLocation(`/session-view?day=${selectedDay}`)}
              >
                <Play className="w-5 h-5" />
                <p className="font-medium text-base">Continue</p>
              </Button>
            </div>
          </div>
        </div>

        {/* Events */}
        <div className="flex flex-col gap-3 items-start w-full px-4">
          <p className="font-medium text-xs text-muted-foreground uppercase">
            EVENTS
          </p>
          <div className="bg-neutral-900 flex flex-col gap-4 items-center justify-center p-6 rounded-2xl w-full">
          </div>
        </div>
      </div>

      <CalendarBottomSheet
        isOpen={showCalendarBottomSheet}
        onClose={() => setShowCalendarBottomSheet(false)}
        selectedMonth={selectedMonth}
        selectedDay={selectedDay}
        onDaySelect={setSelectedDay}
        onMonthChange={setSelectedMonth}
      />

      <MobileTabBar />
    </div>
  );
}
