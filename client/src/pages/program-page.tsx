import { useState } from "react";
import { ArrowLeft, Lock, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MobileTabBar from "@/components/MobileTabBar";
import ProgramCalendarModal from "@/components/ProgramCalendarModal";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { isSameWeek, startOfWeek, endOfWeek } from "date-fns";

// Mock program data
const mockProgram = {
  name: "Princeton In-Season Training",
  startDate: "2025-01-15",
  endDate: "2025-03-15",
  blocks: [
    {
      id: 1,
      name: "Block 1: Foundation",
      startDate: "2025-01-15",
      endDate: "2025-02-11",
      duration: "4 weeks",
      status: "active",
      description: "Building base strength and movement patterns",
      weeks: [
        { week: 1, trainingDays: 4, startDate: "2025-01-15" },
        { week: 2, trainingDays: 4, startDate: "2025-01-22" },
        { week: 3, trainingDays: 4, startDate: "2025-01-29" },
        { week: 4, trainingDays: 4, startDate: "2025-02-05" }
      ]
    },
    {
      id: 2,
      name: "Block 2: Strength Development",
      startDate: "2025-02-12",
      endDate: "2025-03-11",
      duration: "4 weeks",
      status: "locked",
      description: "Progressive overload and power development",
      weeks: [
        { week: 1, trainingDays: 4, startDate: "2025-02-12" },
        { week: 2, trainingDays: 4, startDate: "2025-02-19" },
        { week: 3, trainingDays: 4, startDate: "2025-02-26" },
        { week: 4, trainingDays: 4, startDate: "2025-03-05" }
      ]
    },
    {
      id: 3,
      name: "Block 3: Peak Performance",
      startDate: "2025-03-12",
      endDate: "2025-04-08",
      duration: "4 weeks",
      status: "locked",
      description: "Competition preparation and fine-tuning",
      weeks: [
        { week: 1, trainingDays: 4, startDate: "2025-03-12" },
        { week: 2, trainingDays: 4, startDate: "2025-03-19" },
        { week: 3, trainingDays: 4, startDate: "2025-03-26" },
        { week: 4, trainingDays: 4, startDate: "2025-04-02" }
      ]
    },
    {
      id: 4,
      name: "Block 4: Maintenance",
      startDate: "2025-04-09",
      endDate: "2025-05-06",
      duration: "4 weeks",
      status: "locked",
      description: "Sustaining gains during competition season",
      weeks: [
        { week: 1, trainingDays: 4, startDate: "2025-04-09" },
        { week: 2, trainingDays: 4, startDate: "2025-04-16" },
        { week: 3, trainingDays: 4, startDate: "2025-04-23" },
        { week: 4, trainingDays: 4, startDate: "2025-04-30" }
      ]
    }
  ]
};

export default function ProgramPage() {
  const [, setLocation] = useLocation();
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Current week is Week 1 of Block 1 (January 15-21, 2025)
  const currentWeekStart = new Date("2025-01-15");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isCurrentWeek = (weekStartDate: string) => {
    const weekStart = new Date(weekStartDate);
    return isSameWeek(weekStart, currentWeekStart, { weekStartsOn: 1 });
  };

  const handleWeekClick = (blockId: number, weekNumber: number) => {
    setLocation(`/week-page?block=${blockId}&week=${weekNumber}`);
  };

  const handleCalendarOpen = () => {
    setShowCalendar(true);
  };

  // Calculate program progress
  const totalBlocks = mockProgram.blocks.length;
  const completedBlocks = mockProgram.blocks.filter(block => block.status === "completed").length;
  const programProgress = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;

  // Calculate total duration and completion stats
  const totalDuration = mockProgram.blocks.reduce((sum, block) => {
    const duration = parseInt(block.duration.replace(' weeks', ''));
    return sum + duration;
  }, 0);

  const totalWeeks = totalDuration;
  const completedWeeks = mockProgram.blocks.reduce((sum, block) => {
    if (block.status === "completed") {
      return sum + parseInt(block.duration.replace(' weeks', ''));
    }
    return sum;
  }, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/me")}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-semibold">Program</h1>
            <p className="text-sm text-muted-foreground">
              {formatDate(mockProgram.startDate).replace(/, \d{4}/, '')} - {formatDate(mockProgram.endDate).replace(/, \d{4}/, '')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCalendarOpen}
            className="p-2"
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Program Progress and Stats */}
      <div className="px-4 py-4">
        {/* Segmented Progress Bar */}
        <div className="mb-6">
          <div className="flex gap-1 mb-2">
            {Array.from({ length: totalBlocks }, (_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-sm transition-all duration-300 ${
                  index < completedBlocks 
                    ? 'bg-primary' 
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {completedBlocks}/{totalBlocks} blocks completed ({programProgress}%)
          </p>
        </div>

        {/* Summary Stats */}
        <div className="flex gap-3">
          <div className="bg-neutral-900 flex flex-col gap-2 items-start p-4 rounded-2xl flex-1">
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="text-2xl sm:text-3xl leading-none text-foreground font-semibold">{totalWeeks} weeks</p>
          </div>
          <div className="bg-neutral-900 flex flex-col gap-2 items-start p-4 rounded-2xl flex-1">
            <p className="text-sm text-muted-foreground">Completion</p>
            <p className="text-2xl sm:text-3xl leading-none text-foreground font-semibold">{completedWeeks}/{totalWeeks}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-[100px] space-y-6">

        {/* Blocks List */}
        <div className="space-y-6">
          {mockProgram.blocks.map((block) => (
            <Card 
              key={block.id}
              className={cn(
                "transition-all duration-200",
                block.status === "locked" && "opacity-60"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      block.status === "active" ? "bg-primary" : "bg-muted"
                    )}>
                      {block.status === "locked" ? (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      ) : (
                        <span className="text-lg font-bold text-primary-foreground">
                          {block.id}
                        </span>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{block.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {formatDate(block.startDate)} - {formatDate(block.endDate)}
                      </CardDescription>
                    </div>
                  </div>
                  {block.status === "active" && (
                    <Badge variant="default">Active</Badge>
                  )}
                  {block.status === "locked" && (
                    <Badge variant="secondary">Locked</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4">{block.description}</p>
                
                {/* Weeks List */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Weekly breakdown:</h4>
                  <div className="space-y-2">
                    {block.weeks.map((weekData) => {
                      const isCurrent = isCurrentWeek(weekData.startDate);
                      const isClickable = block.status === "active";
                      
                      return (
                        <div 
                          key={weekData.week}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg transition-all duration-200",
                            block.status === "locked" ? "bg-muted/30" : "bg-muted/50",
                            isCurrent && "ring-2 ring-primary/50 bg-primary/5",
                            isClickable && "cursor-pointer hover:bg-muted/70"
                          )}
                          onClick={() => isClickable && handleWeekClick(block.id, weekData.week)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                              block.status === "locked" 
                                ? "bg-muted text-muted-foreground" 
                                : isCurrent 
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-primary text-primary-foreground"
                            )}>
                              {weekData.week}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground">
                                  Week {weekData.week}
                                </span>
                                {isCurrent && (
                                  <Badge variant="default" className="text-xs">
                                    Current
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(weekData.startDate)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <span className="text-sm font-medium text-foreground">
                                {weekData.trainingDays} training days
                              </span>
                            </div>
                            {isClickable && (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Program Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Program progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Current block</span>
                <span>Block 1 of 4</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total duration</span>
                <span>16 weeks</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Completion</span>
                <span>6%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Modal */}
      {showCalendar && (
        <ProgramCalendarModal
          onClose={() => setShowCalendar(false)}
          onWeekSelect={handleWeekClick}
        />
      )}

      <MobileTabBar />
    </div>
  );
}
