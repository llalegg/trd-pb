import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Block, Phase } from "@shared/schema";
import { getProgramPosition, getDaysUntilBlockEnd, getNextBlockDue } from "@/lib/programHelpers";
import { format } from "date-fns";

interface MilestonesWidgetProps {
  athleteName?: string;
  blocks: Block[];
  currentPhase?: Phase;
}

export default function MilestonesWidget({ athleteName, blocks, currentPhase }: MilestonesWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const programPosition = getProgramPosition(blocks, currentPhase);
  const daysUntilBlockEnd = getDaysUntilBlockEnd(blocks);
  const nextBlockDue = getNextBlockDue(blocks);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Mock data for milestones - in production, this would come from API
  const milestones = {
    currentWeekDay: programPosition.split(" ").slice(-2).join(" "), // Extract "W2 D2"
    daysUntilNextBlock: daysUntilBlockEnd.text,
    nextBlockDueDate: nextBlockDue.text,
    athleteName: athleteName || "Athlete",
    // Primary metrics (mock)
    cprs: "85%",
    outcomeGoals: "On track",
    relativeMaxes: "92%",
    trainingMaxes: "88%",
  };

  return (
    <div className="bg-[#171716] border border-[#292928] rounded-lg p-4 space-y-4">
      {/* Header Note */}
      <div className="text-xs text-[#979795] font-['Montserrat'] italic">
        Information in this section can all be represented in the side bar widget reserve this section to show milestones, trends - primary ⇒ expandable to large data table with variations, trends, etc.
      </div>

      {/* Primary Display */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <p className="text-xs text-[#979795] font-['Montserrat']">Current week/day</p>
          <p className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">
            {milestones.currentWeekDay}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-[#979795] font-['Montserrat']">Days until next block</p>
          <p className={cn("text-sm font-semibold font-['Montserrat']", daysUntilBlockEnd.colorClass)}>
            {milestones.daysUntilNextBlock}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-[#979795] font-['Montserrat']">Next block due date</p>
          <p className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">
            {milestones.nextBlockDueDate}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-[#979795] font-['Montserrat']">Athlete</p>
          <p className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">
            {milestones.athleteName}
          </p>
        </div>
      </div>

      {/* Expandable Section */}
      {isExpanded && (
        <div className="border-t border-[#292928] pt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-[#979795] font-['Montserrat']">CPRs</p>
              <p className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">
                {milestones.cprs}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[#979795] font-['Montserrat']">Outcome Goals</p>
              <p className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">
                {milestones.outcomeGoals}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[#979795] font-['Montserrat']">Relative Maxes</p>
              <p className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">
                {milestones.relativeMaxes}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[#979795] font-['Montserrat']">Training Maxes</p>
              <p className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">
                {milestones.trainingMaxes}
              </p>
            </div>
          </div>

          {/* Full Data Table (placeholder) */}
          <div className="border border-[#292928] rounded-lg p-4 bg-[#0d0d0c]">
            <p className="text-xs text-[#979795] font-['Montserrat']">
              Full data table with variations and trends would appear here
            </p>
          </div>
        </div>
      )}

      {/* Expand/Collapse Button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-7 px-3 text-xs text-[#979795] hover:text-[#f7f6f2] font-['Montserrat']"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Collapse
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Expand
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

