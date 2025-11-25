import React from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, differenceInDays, isWithinInterval } from "date-fns";
import { type AthleteWithPhase, type Block } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProgramsTimelineViewProps {
  athletes: AthleteWithPhase[];
}

const getCurrentBlock = (blocks: Block[]): Block | null => {
  const sorted = [...blocks].sort((a, b) => a.blockNumber - b.blockNumber);
  return sorted.find((b) => b.status === "active") || null;
};

export default function ProgramsTimelineView({ athletes }: ProgramsTimelineViewProps) {
  const today = new Date();
  const startDate = startOfMonth(today);
  const endDate = endOfMonth(today);
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  const getBlockColor = (block: Block): string => {
    // All regular block days use uniform blue color
    return "bg-blue-500/20 border-blue-500/30";
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[1200px] bg-[#121210] rounded-2xl overflow-hidden">
        {/* Legend */}
        <div className="border-b border-[#292928] p-4 bg-[#171716]">
          <div className="flex items-center gap-6 text-xs font-['Montserrat']">
            <span className="text-[#bcbbb7]">Legend:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500/30"></div>
              <span className="text-[#979795]">Regular block day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#1C1C1B] border border-[#292928]"></div>
              <span className="text-[#979795]">Today</span>
            </div>
          </div>
        </div>
        {/* Header with dates */}
        <div className="flex border-b border-[#292928]">
          <div className="w-[300px] min-w-[300px] flex-shrink-0 border-r border-[#292928] p-3">
            <span className="text-[#bcbbb7] text-xs font-medium font-['Montserrat']">Athlete</span>
          </div>
          <div className="flex-1 flex">
            {days.map((day, idx) => {
              const isToday = format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
              return (
                <div
                  key={idx}
                  className={cn(
                    "flex-1 min-w-[40px] p-2 text-center border-r border-[#292928] last:border-r-0",
                    isToday && "bg-[#1C1C1B] ring-2 ring-[#292928]"
                  )}
                >
                  <div className={cn(
                    "text-xs font-medium font-['Montserrat']",
                    isToday ? "text-[#f7f6f2]" : "text-[#bcbbb7]"
                  )}>
                    {format(day, "d")}
                  </div>
                  <div className={cn(
                    "text-[10px] font-['Montserrat']",
                    isToday ? "text-[#f7f6f2]" : "text-[#979795]"
                  )}>
                    {format(day, "EEE")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rows for each athlete */}
        <div>
          {athletes.map((athleteData) => {
            const currentBlock = getCurrentBlock(athleteData.blocks);
            const allBlocks = athleteData.blocks.sort((a, b) => a.blockNumber - b.blockNumber);
            
            return (
              <div key={athleteData.athlete.id} className="flex border-b border-[#292928] last:border-b-0">
                {/* Athlete name */}
                <div className="w-[300px] min-w-[300px] flex-shrink-0 border-r border-[#292928] p-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={athleteData.athlete.photo} alt={athleteData.athlete.name} />
                      <AvatarFallback className="bg-[#292928] text-[#f7f6f2] text-xs">
                        {athleteData.athlete.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[#f7f6f2] text-sm font-['Montserrat'] truncate">
                      {athleteData.athlete.name}
                    </span>
                  </div>
                </div>

                {/* Timeline bars */}
                <div className="flex-1 flex relative">
                  {days.map((day, dayIdx) => {
                    const blocksOnThisDay = allBlocks.filter(block => {
                      const blockStart = new Date(block.startDate);
                      const blockEnd = new Date(block.endDate);
                      return isWithinInterval(day, { start: blockStart, end: blockEnd });
                    });
                    const isToday = format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
                    
                    return (
                      <div
                        key={dayIdx}
                        className={cn(
                          "flex-1 min-w-[40px] border-r border-[#292928] last:border-r-0 relative",
                          isToday && "bg-[#1C1C1B] ring-2 ring-[#292928]"
                        )}
                      >
                        {blocksOnThisDay.map((block, blockIdx) => {
                          const blockStart = new Date(block.startDate);
                          const blockEnd = new Date(block.endDate);
                          const totalDays = differenceInDays(blockEnd, blockStart) + 1;
                          const dayOffset = differenceInDays(day, blockStart);
                          const isFirstDay = dayOffset === 0;
                          const isLastDay = dayOffset === totalDays - 1;
                          
                          return (
                            <div
                              key={block.id}
                              className={cn(
                                "absolute top-1 bottom-1 rounded",
                                getBlockColor(block),
                                isFirstDay && "rounded-l-md",
                                isLastDay && "rounded-r-md",
                                "border"
                              )}
                              style={{
                                left: `${(blockIdx * 2)}px`,
                                right: `${(blocksOnThisDay.length - blockIdx - 1) * 2}px`,
                                zIndex: blockIdx + 1,
                              }}
                              title={`${block.name} (${block.season})`}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

