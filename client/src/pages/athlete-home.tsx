import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Bell, Play, Plus, ChevronRight, Moon } from "lucide-react";
import MobileTabBar from "@/components/MobileTabBar";
import CalendarBottomSheet from "@/components/CalendarBottomSheet";
import { getExercisesForDay } from "@/lib/sessionData";

export default function AthleteView() {
  const [, setLocation] = useLocation();
  const [selectedMonth, setSelectedMonth] = useState("June");
  const [selectedDay, setSelectedDay] = useState(16);
  const [showCalendarBottomSheet, setShowCalendarBottomSheet] = useState(false);

  // Week days for horizontal selector (matching Figma design)
  const weekDays = [
    { day: "M", date: 15, isCurrent: selectedDay === 15, isRestDay: false, sessionState: 'completed' },
    { day: "T", date: 16, isCurrent: selectedDay === 16, isRestDay: false, sessionState: 'in-progress' },
    { day: "W", date: 17, isCurrent: selectedDay === 17, isRestDay: true, sessionState: 'rest' },
    { day: "T", date: 18, isCurrent: selectedDay === 18, isRestDay: false, sessionState: 'scheduled' },
    { day: "F", date: 19, isCurrent: selectedDay === 19, isRestDay: false, sessionState: 'scheduled' },
    { day: "S", date: 20, isCurrent: selectedDay === 20, isRestDay: false, sessionState: 'scheduled' },
    { day: "S", date: 21, isCurrent: selectedDay === 21, isRestDay: true, sessionState: 'rest' },
  ];

  const currentRoutines = getExercisesForDay(selectedDay);
  const currentDay = weekDays.find(day => day.date === selectedDay);
  const isRestDay = currentDay?.isRestDay || false;
  const sessionState = currentDay?.sessionState || 'new';

  // Calculate total exercises and completed exercises from session data
  const totalExercises = currentRoutines.reduce((total, routine) => total + routine.exercises.length, 0);
  const completedExercises = currentRoutines.reduce((total, routine) => {
    return total + routine.exercises.filter(exercise => {
      return exercise.completedSets === exercise.sets;
    }).length;
  }, 0);

  // Find the first incomplete exercise for navigation
  const findFirstIncompleteExercise = () => {
    for (const routine of currentRoutines) {
      for (const exercise of routine.exercises) {
        if ((exercise.completedSets || 0) < exercise.sets) {
          return exercise;
        }
      }
    }
    return null;
  };

  const hasCompletedExercises = completedExercises > 0;
  const firstIncompleteExercise = findFirstIncompleteExercise();
  const progressPercentage = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  const handleDaySelect = (date: number) => {
    setSelectedDay(date);
  };

  // Simple circular progress component
  const CircularProgress = ({ progress, size = 20 }: { progress: number; size?: number }) => {
    const radius = (size - 2) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#3d3d3c"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#c4af6c"
            strokeWidth="2"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="bg-surface-base relative min-h-screen w-full">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 h-[81px]">
        <button
          onClick={() => setShowCalendarBottomSheet(true)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <h1 className="text-[30px] font-semibold text-[#f7f6f2] font-['Montserrat'] leading-[1.32]">{selectedMonth}</h1>
          <ChevronDown className="w-6 h-6 text-[#f7f6f2]" />
        </button>
        <div className="relative">
          <button className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-[#171716] transition-colors">
            <Bell className="w-6 h-6 text-[#f7f6f2]" />
          </button>
          {/* Notification badge */}
          <div className="absolute top-[6px] right-[6px] min-w-[20px] h-5 bg-[#d6c281] rounded-full flex items-center justify-center px-[6px]">
            <span className="text-xs font-semibold text-black font-['Montserrat'] leading-[1.32]">1</span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col gap-3 px-4 pb-20">
        {/* Day Selector */}
        <div className="flex gap-2 pb-2">
          {weekDays.map((day, index) => (
            <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <p className="text-xs font-medium text-[#585856] font-['Montserrat'] leading-[1.32]">{day.day}</p>
              <button
                onClick={() => handleDaySelect(day.date)}
                className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-medium font-['Montserrat'] leading-[1.5] transition-colors border ${
                  day.isCurrent
                    ? "border-[#3d3d3c] bg-transparent text-[#f7f6f2] font-semibold"
                    : "border-[#1c1c1b] bg-transparent text-[#585856]"
                }`}
              >
                {day.date}
              </button>
            </div>
          ))}
        </div>

        {/* Training Section - Only show if not rest day */}
        {!isRestDay && (
          <div className="flex flex-col gap-[12px]">
            {/* Training Card */}
            <div 
              className="flex flex-col gap-[8px] overflow-hidden rounded-[16px] w-full cursor-pointer"
              onClick={() => setLocation("/session-view")}
            >
              {/* Card Header */}
              <div className="bg-[#121210] flex items-center justify-between px-[12px] py-[8px] rounded-[12px]">
                <div className="flex gap-[12px] items-center w-[180.5px]">
                  <div className="relative w-[20px] h-[20px]">
                    <div className="border border-[#3d3d3c] border-solid rounded-full w-full h-full"></div>
                    {(sessionState === 'completed' || completedExercises > 0) && (
                      <div className="absolute inset-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 20 20">
                          <circle
                            cx="10"
                            cy="10"
                            r="8"
                            stroke="#f7f6f2"
                            strokeWidth="2"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 8}`}
                            strokeDashoffset={`${2 * Math.PI * 8 * (1 - (sessionState === 'completed' ? 1 : completedExercises / totalExercises))}`}
                            strokeLinecap="round"
                            className="transition-all duration-300"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start justify-center">
                    <p className="text-[16px] font-semibold text-[#f7f6f2] font-['Montserrat'] leading-[1.5]">
                      Training session
                    </p>
                    <p className="text-[12px] font-medium text-[#979795] font-['Montserrat'] leading-[1.32]">
                      {sessionState === 'completed' ? `${totalExercises}/${totalExercises} exercises` : 
                       `${completedExercises}/${totalExercises} exercises`}
                    </p>
                  </div>
                </div>
                <div className="bg-[#e5e4e1] flex gap-[8px] h-[32px] items-center justify-center px-[12px] py-[8px] rounded-full">
                  <div className="w-[16px] h-[16px]">
                    <Play size={16} className="text-black" />
                  </div>
                  <p className="text-[12px] font-semibold text-black font-['Montserrat'] leading-[1.32]">
                    {(sessionState === 'completed' || completedExercises > 0) ? 'Continue' : 'Start'}
                  </p>
                </div>
              </div>

              {/* Exercise Items */}
              {/* Movement */}
              <div 
                className="bg-[#171716] flex gap-[12px] items-center p-[12px] rounded-[12px] cursor-pointer hover:bg-[#1a1a19] transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocation("/session-view?scrollTo=movement");
                }}
              >
                <div className="w-[20px] h-[20px] overflow-hidden relative">
                  <div className="absolute bg-[#ff3636] h-[8px] left-[2px] rounded-[2px] top-[6px] w-[4px]" />
                  <div className="absolute bg-[#ff3636] h-[8px] left-[8px] rounded-[2px] top-[6px] w-[4px]" />
                  <div className="absolute bg-[#ff3636] h-[8px] left-[14px] rounded-[2px] top-[6px] w-[4px]" />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div className="flex gap-[8px] items-center w-[146px]">
                    <p className="text-[14px] font-semibold text-[#f7f6f2] font-['Montserrat'] leading-[1.46] overflow-hidden text-ellipsis whitespace-nowrap">
                      Movement
                    </p>
                  </div>
                  <div className="flex gap-[8px] items-center">
                    <div className="flex gap-[4px] items-center">
                        <div className="backdrop-blur-[20px] bg-[rgba(255,255,255,0.08)] flex gap-[4px] items-center justify-center px-[8px] py-[2px] rounded-full w-fit">
                          <p className="text-[12px] font-medium text-[#979795] font-['Montserrat'] leading-[1.32] whitespace-nowrap">
                            Corrective A
                          </p>
                        </div>
                    </div>
                    <div className="backdrop-blur-[20px] bg-[rgba(255,255,255,0.08)] flex gap-[4px] items-center justify-center px-[8px] py-[2px] rounded-full w-fit">
                      <p className="text-[12px] font-medium text-[#979795] font-['Montserrat'] leading-[1.32] whitespace-nowrap">
                        30m
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#979795] ml-2" />
                  </div>
                </div>
              </div>

              {/* Lifting & Conditioning Combined */}
              <div className="bg-[#171716] rounded-[12px] overflow-hidden">
                {/* Lifting */}
                <div 
                  className="flex gap-[12px] items-center p-[12px] cursor-pointer hover:bg-[#1a1a19] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation("/session-view?scrollTo=strength");
                    }}
                >
                  <div className="w-[20px] h-[20px] overflow-hidden relative">
                    <div className="absolute bg-[#13b557] h-[8px] left-[2px] rounded-[2px] top-[6px] w-[4px]" />
                    <div className="absolute bg-[#2a2a29] h-[8px] left-[8px] rounded-[2px] top-[6px] w-[4px]" />
                    <div className="absolute bg-[#2a2a29] h-[8px] left-[14px] rounded-[2px] top-[6px] w-[4px]" />
                  </div>
                  <div className="flex flex-row items-center self-stretch flex-1">
                    <div className="flex h-full items-start justify-between w-[305px]">
                      <p className="text-[14px] font-semibold text-[#f7f6f2] font-['Montserrat'] leading-[1.46] overflow-hidden text-ellipsis whitespace-nowrap">
                        Lifting
                      </p>
                      <div className="flex gap-[8px] items-center">
                          <div className="backdrop-blur-[20px] bg-[rgba(255,255,255,0.08)] flex gap-[4px] items-center justify-center px-[8px] py-[2px] rounded-full w-fit">
                            <p className="text-[12px] font-medium text-[#979795] font-['Montserrat'] leading-[1.32] whitespace-nowrap">
                              Upper body
                            </p>
                          </div>
                        <div className="backdrop-blur-[20px] bg-[rgba(255,255,255,0.08)] flex gap-[4px] items-center justify-center px-[8px] py-[2px] rounded-full w-fit">
                          <p className="text-[12px] font-medium text-[#979795] font-['Montserrat'] leading-[1.32] whitespace-nowrap">
                            30m
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#979795] ml-2" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-[rgba(255,255,255,0.04)] mx-[12px]" />

                {/* Conditioning */}
                <div 
                  className="flex gap-[12px] items-center p-[12px] cursor-pointer hover:bg-[#1a1a19] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation("/session-view?scrollTo=strength");
                    }}
                >
                  <div className="w-[20px] h-[20px] overflow-hidden relative">
                    <div className="absolute bg-[#ff8d36] h-[8px] left-[2px] rounded-[2px] top-[6px] w-[4px]" />
                    <div className="absolute bg-[#ff8d36] h-[8px] left-[8px] rounded-[2px] top-[6px] w-[4px]" />
                    <div className="absolute bg-[#2a2a29] h-[8px] left-[14px] rounded-[2px] top-[6px] w-[4px]" />
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <p className="text-[14px] font-semibold text-[#f7f6f2] font-['Montserrat'] leading-[1.46] overflow-hidden text-ellipsis whitespace-nowrap">
                      Conditioning
                    </p>
                    <div className="flex gap-[8px] items-center">
                      <div className="backdrop-blur-[20px] bg-[rgba(255,255,255,0.08)] flex gap-[4px] items-center justify-center px-[8px] py-[2px] rounded-full w-fit">
                        <p className="text-[12px] font-medium text-[#979795] font-['Montserrat'] leading-[1.32] whitespace-nowrap">
                          30m
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#979795] ml-2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Throwing */}
              <div 
                className="bg-[#171716] flex gap-[12px] items-center p-[12px] rounded-[12px] cursor-pointer hover:bg-[#1a1a19] transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocation("/session-view?scrollTo=throwing");
                }}
              >
                <div className="w-[20px] h-[20px] overflow-hidden relative">
                  <div className="absolute bg-[#ff8d36] h-[8px] left-[2px] rounded-[2px] top-[6px] w-[4px]" />
                  <div className="absolute bg-[#ff8d36] h-[8px] left-[8px] rounded-[2px] top-[6px] w-[4px]" />
                  <div className="absolute bg-[#2a2a29] h-[8px] left-[14px] rounded-[2px] top-[6px] w-[4px]" />
                </div>
                <div className="flex-1 flex flex-col gap-[6px] items-start">
                  <div className="flex items-start justify-between w-full">
                    <p className="text-[14px] font-semibold text-[#f7f6f2] font-['Montserrat'] leading-[1.46] overflow-hidden text-ellipsis whitespace-nowrap">
                      Throwing
                    </p>
                    <div className="flex gap-[8px] items-center">
                        <div className="backdrop-blur-[20px] bg-[rgba(255,255,255,0.08)] flex gap-[4px] items-center justify-center px-[8px] py-[2px] rounded-full w-fit">
                          <p className="text-[12px] font-medium text-[#979795] font-['Montserrat'] leading-[1.32] whitespace-nowrap">
                            Player Series A
                          </p>
                        </div>
                      <div className="backdrop-blur-[20px] bg-[rgba(255,255,255,0.08)] flex gap-[4px] items-center justify-center px-[8px] py-[2px] rounded-full w-fit">
                        <p className="text-[12px] font-medium text-[#979795] font-['Montserrat'] leading-[1.32] whitespace-nowrap">
                          30m
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#979795] ml-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rest Day Section - Only show if rest day */}
        {isRestDay && (
          <div className="flex flex-col gap-[12px]">
            <div className="flex flex-col gap-[8px] overflow-hidden rounded-[16px] w-[361px]">
              <div className="bg-[#121210] flex items-center justify-center px-[12px] py-[16px] rounded-[12px]">
                <div className="flex flex-col items-center gap-[8px]">
                  <Moon className="w-8 h-8 text-[#979795]" />
                  <div className="flex flex-col items-center">
                    <p className="text-[16px] font-semibold text-[#f7f6f2] font-['Montserrat'] leading-[1.5]">
                      Rest day
                    </p>
                    <p className="text-[12px] font-medium text-[#979795] font-['Montserrat'] leading-[1.32]">
                      Recovery and regeneration
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events Section */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-[#979795] font-['Montserrat'] leading-[1.46]">Events</p>
          <div className="bg-[rgba(99,85,41,0.1)] border border-[#443d28] rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-base font-semibold text-[#f7f6f2] font-['Montserrat'] leading-[1.5]">Call with John Andersen</p>
                <p className="text-xs font-medium text-[#979795] font-['Montserrat'] leading-[1.32]">4:00 – 5:00 PM</p>
              </div>
              <ChevronRight className="w-[18px] h-[18px] text-[#585856]" />
            </div>
          </div>
        </div>

        {/* My Tasks Section */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-[#979795] font-['Montserrat'] leading-[1.46]">My tasks</p>
          <div className="bg-[rgba(255,255,255,0.04)] rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 border border-[#3d3d3c] rounded-full"></div>
              <div className="flex-1">
                <p className="text-base font-semibold text-[#f7f6f2] font-['Montserrat'] leading-[1.5]">Buy new baseball gloves for my game</p>
              </div>
              <ChevronRight className="w-[18px] h-[18px] text-[#585856]" />
            </div>
          </div>
        </div>

        {/* Team Task Updates Section */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-[#979795] font-['Montserrat'] leading-[1.46]">Team task updates</p>
          <div className="bg-[rgba(255,255,255,0.04)] rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 border border-[#292928] rounded-full overflow-hidden">
                {/* Avatar placeholder - would use actual avatar image */}
                <div className="w-full h-full bg-[#585856]"></div>
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-[#f7f6f2] font-['Montserrat'] leading-[1.5]">Exercise form check</p>
                <p className="text-xs font-medium text-[#979795] font-['Montserrat'] leading-[1.32]">for John Andersen</p>
              </div>
              <ChevronRight className="w-[18px] h-[18px] text-[#585856]" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Add Button */}
      <button className="fixed bottom-24 right-4 w-14 h-14 bg-[#e5e4e1] rounded-full flex items-center justify-center hover:bg-[#f7f6f2] transition-colors">
        <Plus className="w-8 h-8 text-black" />
      </button>

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