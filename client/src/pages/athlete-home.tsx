import { useState, useMemo } from "react";
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

  // Get today's date and generate week days (today + next 6 days)
  const today = useMemo(() => {
    const date = new Date();
    return date.getDate();
  }, []);

  // Generate week days: today + next 6 days
  const weekDays = useMemo(() => {
    const days = [];
    const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
    const todayDate = new Date();
    const todayDayOfWeek = todayDate.getDay();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(todayDate);
      date.setDate(todayDate.getDate() + i);
      const dateNum = date.getDate();
      const dayName = dayNames[date.getDay()];
      
      // Mock data - in real app, this would come from API
      const isRestDay = i === 2 || i === 6; // Mock rest days
      const sessionState = i === 0 ? 'in-progress' : i < 0 ? 'completed' : 'scheduled';
      
      days.push({
        day: dayName,
        date: dateNum,
        isCurrent: selectedDay === dateNum,
        isToday: i === 0,
        isRestDay,
        sessionState
      });
    }
    
    return days;
  }, [selectedDay]);

  const currentRoutines = getExercisesForDay(selectedDay);
  const currentDay = weekDays.find(day => day.date === selectedDay);
  const isRestDay = currentDay?.isRestDay || false;
  const sessionState = currentDay?.sessionState || 'new';

  // Get routine data for cards
  const movementRoutine = currentRoutines.find(r => r.type === 'movement');
  const strengthRoutine = currentRoutines.find(r => r.type === 'strength');
  const throwingRoutine = currentRoutines.find(r => r.type === 'throwing');

  // Calculate exercise counts and times
  const movementExerciseCount = movementRoutine?.exercises.length || 0;
  const strengthExerciseCount = strengthRoutine?.exercises.length || 0;
  const throwingExerciseCount = throwingRoutine?.exercises.length || 0;
  
  const movementTime = movementRoutine?.estimatedTime || '0 min';
  const strengthTime = strengthRoutine?.estimatedTime || '0 min';
  const throwingTime = throwingRoutine?.estimatedTime || '0 min';

  const handleDaySelect = (date: number) => {
    setSelectedDay(date);
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
        {/* Day Selector with Today Button */}
        <div className="flex items-center gap-2 pb-2">
          <button
            onClick={() => {
              const todayDate = new Date().getDate();
              setSelectedDay(todayDate);
            }}
            className="px-3 py-1.5 rounded-full bg-[#171716] border border-[#292928] text-[12px] font-medium text-[#f7f6f2] font-['Montserrat'] hover:bg-[#1a1a19] transition-colors"
          >
            Today
          </button>
          <div className="flex gap-2 flex-1 overflow-x-auto">
            {weekDays.map((day, index) => (
              <div key={index} className="flex flex-col items-center gap-2 flex-shrink-0 min-w-[44px]">
                <p className="text-xs font-medium text-[#585856] font-['Montserrat'] leading-[1.32]">{day.day}</p>
                <button
                  onClick={() => handleDaySelect(day.date)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-medium font-['Montserrat'] leading-[1.5] transition-colors border ${
                    day.isToday
                      ? "border-[#c4af6c] bg-[#c4af6c] text-[#0d0d0c] font-semibold"
                      : day.isCurrent
                      ? "border-[#3d3d3c] bg-transparent text-[#f7f6f2] font-semibold"
                      : "border-[#1c1c1b] bg-transparent text-[#585856]"
                  }`}
                >
                  {day.date}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Training Cards - Always show Movement, S&C, Throwing */}
        <div className="flex flex-col gap-[12px]">
          {/* Movement Card */}
          {movementRoutine && (
            <div 
              className="bg-[#171716] flex gap-[12px] items-center p-[12px] rounded-[12px] cursor-pointer hover:bg-[#1a1a19] transition-colors"
              onClick={() => setLocation("/session-view?scrollTo=movement")}
            >
              <div className="w-[20px] h-[20px] overflow-hidden relative">
                <div className="absolute bg-[#ff3636] h-[8px] left-[2px] rounded-[2px] top-[6px] w-[4px]" />
                <div className="absolute bg-[#ff3636] h-[8px] left-[8px] rounded-[2px] top-[6px] w-[4px]" />
                <div className="absolute bg-[#ff3636] h-[8px] left-[14px] rounded-[2px] top-[6px] w-[4px]" />
              </div>
              <div className="flex-1 flex flex-col gap-[4px]">
                <p className="text-[14px] font-semibold text-[#f7f6f2] font-['Montserrat'] leading-[1.46]">
                  Movement
                </p>
                <div className="flex flex-col gap-[2px]">
                  <p className="text-[12px] font-medium text-[#979795] font-['Montserrat'] leading-[1.32]">
                    {movementRoutine.routineType || 'Corrective A'}
                  </p>
                  <p className="text-[12px] font-medium text-[#979795] font-['Montserrat'] leading-[1.32]">
                    {movementExerciseCount}/{movementExerciseCount} exercises | {movementTime}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#979795] flex-shrink-0" />
            </div>
          )}

          {/* S&C Card */}
          {strengthRoutine && (
            <div className="bg-[#171716] rounded-[12px] overflow-hidden">
              <div 
                className="flex gap-[12px] items-center p-[12px] cursor-pointer hover:bg-[#1a1a19] transition-colors"
                onClick={() => setLocation("/session-view?scrollTo=strength")}
              >
                <div className="w-[20px] h-[20px] overflow-hidden relative">
                  <div className="absolute bg-[#13b557] h-[8px] left-[2px] rounded-[2px] top-[6px] w-[4px]" />
                  <div className="absolute bg-[#2a2a29] h-[8px] left-[8px] rounded-[2px] top-[6px] w-[4px]" />
                  <div className="absolute bg-[#2a2a29] h-[8px] left-[14px] rounded-[2px] top-[6px] w-[4px]" />
                </div>
                <div className="flex-1 flex flex-col gap-[4px]">
                  <p className="text-[14px] font-semibold text-[#f7f6f2] font-['Montserrat'] leading-[1.46]">
                    S&C
                  </p>
                  <div className="flex flex-col gap-[2px]">
                    <p className="text-[12px] font-medium text-[#979795] font-['Montserrat'] leading-[1.32]">
                      {strengthRoutine.bodyFocus || 'Upper Body'}
                    </p>
                    {strengthRoutine.conditioningType ? (
                      <>
                        <p className="text-[12px] font-medium text-[#979795] font-['Montserrat'] leading-[1.32]">
                          Lifting: {strengthExerciseCount}/{strengthExerciseCount} exercises | {strengthRoutine.liftingTime || strengthTime}
                        </p>
                        <p className="text-[12px] font-medium text-[#979795] font-['Montserrat'] leading-[1.32]">
                          Conditioning: {strengthRoutine.conditioningType} | {strengthRoutine.conditioningTime}
                        </p>
                      </>
                    ) : (
                      <p className="text-[12px] font-medium text-[#979795] font-['Montserrat'] leading-[1.32]">
                        {strengthExerciseCount}/{strengthExerciseCount} exercises | {strengthTime}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#979795] flex-shrink-0" />
              </div>
            </div>
          )}

          {/* Throwing Card */}
          {throwingRoutine && (
            <div 
              className={`bg-[#171716] flex gap-[12px] items-center p-[12px] rounded-[12px] cursor-pointer hover:bg-[#1a1a19] transition-colors ${throwingRoutine.isRestDay ? 'opacity-60' : ''}`}
              onClick={() => !throwingRoutine.isRestDay && setLocation("/session-view?scrollTo=throwing")}
            >
              <div className="w-[20px] h-[20px] overflow-hidden relative">
                <div className="absolute bg-[#ff8d36] h-[8px] left-[2px] rounded-[2px] top-[6px] w-[4px]" />
                <div className="absolute bg-[#ff8d36] h-[8px] left-[8px] rounded-[2px] top-[6px] w-[4px]" />
                <div className="absolute bg-[#2a2a29] h-[8px] left-[14px] rounded-[2px] top-[6px] w-[4px]" />
              </div>
              <div className="flex-1 flex flex-col gap-[4px]">
                <p className="text-[14px] font-semibold text-[#f7f6f2] font-['Montserrat'] leading-[1.46]">
                  Throwing
                </p>
                <div className="flex flex-col gap-[2px]">
                  {throwingRoutine.isRestDay ? (
                    <>
                      <p className="text-[12px] font-medium text-[#979795] font-['Montserrat'] leading-[1.32]">
                        REST
                      </p>
                      <p className="text-[12px] font-medium text-[#979795] font-['Montserrat'] leading-[1.32]">
                        No throwing today
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[12px] font-medium text-[#979795] font-['Montserrat'] leading-[1.32]">
                        {throwingRoutine.seriesType || 'Player Series A'} | {throwingRoutine.intensity || 'High Intensity'}
                      </p>
                      <p className="text-[12px] font-medium text-[#979795] font-['Montserrat'] leading-[1.32]">
                        {throwingExerciseCount}/{throwingExerciseCount} exercises | {throwingTime}
                      </p>
                    </>
                  )}
                </div>
              </div>
              {!throwingRoutine.isRestDay && <ChevronRight className="w-4 h-4 text-[#979795] flex-shrink-0" />}
            </div>
          )}
        </div>


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