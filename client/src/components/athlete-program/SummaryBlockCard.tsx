import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ChevronDown, ChevronUp, History } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import type { Block } from "@shared/schema";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface ChangeLogEntry {
  id: string;
  timestamp: string;
  coachName: string;
  description: string;
  detailedDescription?: string;
  changes?: {
    field: string;
    before: string;
    after: string;
  }[];
}

interface SummaryBlockCardProps {
  block: Block;
  onViewDetails: (blockId: string) => void;
  onChangeLogClick?: (blockId: string) => void;
  changeLogEntries?: ChangeLogEntry[];
  isCurrent?: boolean;
  isDraft?: boolean;
}

const formatDateRange = (startDate: string, endDate: string): string => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
  }
  
  return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`;
};

const getTemplateName = (block: Block): string => {
  const parts: string[] = [];
  
  if (block.lifting?.split) {
    parts.push(`${block.lifting.split} split`);
  }
  
  if (block.lifting?.emphasis) {
    parts.push(block.lifting.emphasis);
  }
  
  return parts.length > 0 ? parts.join(" • ") : "Standard Template";
};

const truncateText = (text: string, maxLength: number = 60): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

export default function SummaryBlockCard({
  block,
  onViewDetails,
  onChangeLogClick,
  changeLogEntries = [],
  isCurrent = false,
  isDraft = false,
}: SummaryBlockCardProps) {
  const [changeLogExpanded, setChangeLogExpanded] = useState(false);
  
  const dateRange = formatDateRange(block.startDate, block.endDate);
  const templateName = getTemplateName(block);
  const trainingEmphasis = block.lifting?.emphasis || "Not specified";
  
  // Mock comment - in production this would come from block data
  const comment = (block as any).comment || "";
  const truncatedComment = comment ? truncateText(comment) : "";
  
  const recentChanges = changeLogEntries.slice(0, 5);
  
  const cardClasses = cn(
    "bg-[#1a1a19] rounded-lg p-4 transition-all duration-200 hover:bg-[#1f1f1e]",
    isCurrent && "border-2 border-green-500/30 bg-[#0f1a0f]",
    isDraft && "border border-[#292928] opacity-75",
    !isCurrent && !isDraft && "border border-[#292928]"
  );

  return (
    <div className="space-y-0">
      <div className={cardClasses}>
        <div className="space-y-3">
            {/* Header Row: Block Number and Status */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-primary/20 text-primary border-primary/30 text-xs font-semibold font-['Montserrat'] px-2 py-1"
                >
                  Block {block.blockNumber}
                </Badge>
                {isDraft && (
                  <Badge
                    variant="outline"
                    className="text-xs font-['Montserrat'] border-[#979795]/30 text-[#979795]"
                  >
                    Draft
                  </Badge>
                )}
              </div>
              {changeLogEntries.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setChangeLogExpanded(!changeLogExpanded);
                        }}
                        className="text-[#979795] hover:text-[#f7f6f2] transition-colors"
                        aria-label="Toggle change log"
                      >
                        {changeLogExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <History className="h-4 w-4" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Change log</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Date Range */}
            <div className="text-sm text-[#979795] font-['Montserrat']">
              {dateRange}
            </div>

            {/* Phase and Training Info */}
            <div className="space-y-1">
              <div className="text-sm text-[#f7f6f2] font-['Montserrat']">
                <span className="text-[#979795]">Phase: </span>
                {block.season}
                {block.subSeason && ` (${block.subSeason})`}
              </div>
              <div className="text-sm text-[#f7f6f2] font-['Montserrat']">
                <span className="text-[#979795]">Training Emphasis: </span>
                {trainingEmphasis}
              </div>
              <div className="text-sm text-[#979795] font-['Montserrat']">
                Template: {templateName}
              </div>
            </div>

            {/* Comments */}
            {comment && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-sm text-[#979795] font-['Montserrat']">
                      {truncatedComment}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">{comment}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Action Button */}
            <div className="pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onViewDetails(block.id)}
                className="h-9 px-3 text-xs font-['Montserrat'] border-[#292928] text-[#979795] hover:text-[#f7f6f2] hover:bg-[#1a1a19] w-full"
              >
                <Eye className="h-4 w-4 mr-1" />
                View details
              </Button>
            </div>
          </div>
      </div>

      {/* Change Log Section */}
      {changeLogExpanded && (
        <div className="mt-2 ml-4 border-l-2 border-[#292928] pl-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {recentChanges.length === 0 ? (
            <div className="text-sm text-[#979795] font-['Montserrat'] py-2">
              No changes recorded
            </div>
          ) : (
            <>
              {recentChanges.map((entry) => (
                <div
                  key={entry.id}
                  className="text-sm text-[#979795] font-['Montserrat'] py-1"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-[#f7f6f2] font-medium">
                      {format(parseISO(entry.timestamp), "MMM d, yyyy")}
                    </span>
                    <span className="text-[#979795]">•</span>
                    <span className="text-[#979795]">{entry.coachName}</span>
                  </div>
                  <div className="mt-1 text-xs text-[#979795]">
                    {entry.description}
                  </div>
                </div>
              ))}
              {changeLogEntries.length > 5 && onChangeLogClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onChangeLogClick(block.id)}
                  className="h-8 px-2 text-xs font-['Montserrat'] text-[#979795] hover:text-[#f7f6f2] mt-2"
                >
                  View all changes ({changeLogEntries.length})
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

