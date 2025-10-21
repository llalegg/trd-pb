import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, ChevronLeft, Moon, Calendar, FileText } from "lucide-react";
import MobileTabBar from "@/components/MobileTabBar";
import CalendarBottomSheet from "@/components/CalendarBottomSheet";
import { getExercisesForDay } from "@/lib/sessionData";

// Image assets from Figma
const imgVector = "http://localhost:3845/assets/14a1440996fb831339d674011bb1aee591393b35.svg";
const imgVector1 = "http://localhost:3845/assets/50fdb6383d561681b93fcab7a2b2c98b2ad32725.svg";
const imgTimer = "http://localhost:3845/assets/3318047abfbab8ad4554ff44c19ceb6fb726445f.svg";
const imgCurrentDayIndicator = "http://localhost:3845/assets/de280e049fb3261c679d633b4f3a1843f9c02e36.svg";
const imgProgressChart = "http://localhost:3845/assets/a58d63cfbad335456531a7adb68e74b80af3830a.svg";
const imgPlay = "http://localhost:3845/assets/a550711f1ea8cd2067f00618e6675bddb3e494cc.svg";

function IconChevronRight({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="absolute bottom-1/4 left-[37.5%] right-[37.5%] top-1/4">
        <div className="absolute inset-[-8.33%_-16.67%]" style={{ "--stroke-0": "rgba(24, 24, 27, 1)" } as React.CSSProperties}>
          <img alt="" className="block max-w-none size-full" src={imgVector} />
        </div>
      </div>
    </div>
  );
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]">
        <div className="absolute inset-[-16.67%_-8.33%]" style={{ "--stroke-0": "rgba(24, 24, 27, 1)" } as React.CSSProperties}>
          <img alt="" className="block max-w-none size-full" src={imgVector1} />
        </div>
      </div>
    </div>
  );
}

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
    <div className="bg-zinc-950 relative min-h-screen w-full">
      <div className="flex flex-col gap-4 items-start px-0 pt-10 pb-20 w-full">
        {/* Calendar Header */}
        <div className="flex gap-2 items-center w-full px-4">
          <button
            onClick={() => setShowCalendarBottomSheet(true)}
            className="flex gap-2 items-center hover:opacity-80 transition-opacity"
          >
            <FileText className="h-5 w-5 text-white" />
            <p className="font-medium text-2xl leading-none text-white">
              {selectedMonth}
            </p>
          </button>

        </div>

        {/* Calendar Week View */}
        <div className="flex gap-2 items-center w-full overflow-x-auto pb-2 -mx-4 pl-4 pr-0">
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

        {/* Stats Cards */}
        <div className="flex gap-3 w-full overflow-x-auto pb-2 -mx-4">
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
        </div>

        {/* Training Session */}
        <div className="flex flex-col gap-3 items-start w-full px-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between w-full">
            <p className="font-medium text-xs text-muted-foreground uppercase">
              TRAINING SESSION
            </p>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-background border-border rounded-full px-3 py-1">
                Week 1
              </Badge>
            </div>
          </div>

          {/* Training Session Card */}
          <div className="flex flex-col gap-6 items-end w-full">
            {currentRoutines.length > 0 ? (
              <div className="flex flex-col gap-4 items-start w-full">
                {currentRoutines.map((routine, index) => {
                  // Get current day's completion status
                  const currentDayData = weekDays.find(day => day.date === selectedDay);
                  const isDayCompleted = currentDayData?.isCompleted || false;
                  
                  // If day is completed, show full progress (100%), otherwise show actual progress
                  const progress = isDayCompleted 
                    ? 100 
                    : routine.exercises.length > 0 
                      ? Math.round((routine.exercises.reduce((sum, ex) => sum + ex.completedSets, 0) / routine.exercises.reduce((sum, ex) => sum + ex.sets, 0)) * 100)
                      : 0;
                  
                  return (
                    <button
                      key={index}
                      className="flex gap-4 sm:gap-5 items-center w-full hover:bg-neutral-800/50 p-3 rounded-2xl transition-colors"
                      onClick={() => setLocation(`/session-view?day=${selectedDay}`)}
                    >
                      <CircularProgress progress={progress} size={32} />
                      <div className="flex flex-col gap-1 grow items-start">
                        <p className="font-medium text-base sm:text-lg text-white">
                          {routine.name}
                        </p>
                        <div className="flex gap-3 items-start text-sm text-muted-foreground">
                          <p>{routine.exerciseCount} exercises</p>
                          <p>{routine.estimatedTime}</p>
                          <p>{routine.exercises.reduce((sum, ex) => sum + ex.completedSets, 0)}/{routine.exercises.reduce((sum, ex) => sum + ex.sets, 0)} sets</p>
                        </div>
                      </div>
                      <IconChevronRight className="w-6 h-6 sm:w-7 sm:h-7 relative shrink-0" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-4 items-center justify-center w-full py-12">
                <Moon className="h-16 w-16 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium text-lg text-muted-foreground">Rest Day</p>
                  <p className="text-base text-muted-foreground">No training scheduled for this day</p>
                </div>
              </div>
            )}

            {/* Continue Button - only show if there are routines */}
            {currentRoutines.length > 0 && (
              <div className="w-full">
                <Button
                  className="bg-primary text-primary-foreground flex gap-2 h-12 items-center justify-center px-6 py-3 rounded-full w-full"
                  onClick={() => setLocation(`/session-view?day=${selectedDay}`)}
                >
                  <div className="w-5 h-5 relative shrink-0">
                    <div className="absolute bottom-[12.5%] left-1/4 right-[16.67%] top-[12.5%]">
                      <div className="absolute inset-[-5.54%_-7.13%]" style={{ "--stroke-0": "rgba(24, 24, 27, 1)" } as React.CSSProperties}>
                        <img alt="" className="block max-w-none size-full" src={imgPlay} />
                      </div>
                    </div>
                  </div>
                  <p className="font-medium text-base">Continue</p>
                </Button>
              </div>
            )}
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
