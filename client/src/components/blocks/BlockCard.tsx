import { format } from "date-fns";
import { Zap, AlertTriangle, CheckCircle2, Edit, Eye, FileCheck, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { type Block } from "@shared/schema";
import { cn } from "@/lib/utils";

interface BlockCardProps {
  block: Block;
  onEdit: () => void;
  onView: () => void;
  onSignOff?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onViewPerformance?: () => void;
}

const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // If same year, only show year on end date
  if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
  }
  
  // Different years, show both
  return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`;
};

const formatBlockTitle = (block: Block): string => {
  const season = block.season || block.name.replace(/Block \d+[: ]?/i, '').trim();
  const subSeason = block.subSeason ? ` (${block.subSeason})` : '';
  return `Block ${block.blockNumber}: ${season}${subSeason}`;
};

const getStatusConfig = (status: Block["status"]) => {
  switch (status) {
    case "active":
      return {
        label: "Active",
        icon: <Zap className="h-4 w-4" />,
        badgeClass: "bg-green-500/20 text-green-400 border-green-500/30",
        borderClass: "border-2 border-green-500",
      };
    case "pending-signoff":
      return {
        label: "Pending Sign-off",
        icon: <AlertTriangle className="h-4 w-4" />,
        badgeClass: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        borderClass: "border-2 border-amber-500",
      };
    case "complete":
      return {
        label: "Complete",
        icon: <CheckCircle2 className="h-4 w-4" />,
        badgeClass: "bg-[#979795]/20 text-[#979795] border-[#979795]/30",
        borderClass: "border border-[#292928]",
      };
    case "draft":
      return {
        label: "Draft",
        icon: null,
        badgeClass: "bg-[#979795]/20 text-[#979795] border-[#979795]/30",
        borderClass: "border border-[#292928]",
      };
    default:
      return {
        label: "Unknown",
        icon: null,
        badgeClass: "bg-[#979795]/20 text-[#979795] border-[#979795]/30",
        borderClass: "border border-[#292928]",
      };
  }
};

const calculateProgress = (block: Block): number => {
  if (block.status !== "active" || !block.currentDay) return 0;
  
  // Calculate progress based on currentDay (week and day)
  // Assuming 7 days per week
  const totalDays = block.duration * 7;
  const currentDayNumber = (block.currentDay.week - 1) * 7 + block.currentDay.day;
  const progress = Math.min(100, Math.round((currentDayNumber / totalDays) * 100));
  
  return progress;
};

const getTemplateInfo = (block: Block): string => {
  const parts: string[] = [];
  
  if (block.lifting?.split) {
    parts.push(`${block.lifting.split} split`);
  }
  
  // Default template name if not specified
  const templateName = "Standard Template";
  if (parts.length > 0) {
    parts.push(`• ${templateName}`);
  } else {
    parts.push(templateName);
  }
  
  return parts.join(" ");
};

const getCompletionInfo = (block: Block): string => {
  if (block.status !== "complete") return "";
  
  // For complete blocks, show completion stats
  // Assuming 7 days per week
  const totalDays = block.duration * 7;
  return `Completion: ${totalDays}/${totalDays} days (100%)`;
};

export default function BlockCard({
  block,
  onEdit,
  onView,
  onSignOff,
  onDelete,
  onCopy,
  onViewPerformance,
}: BlockCardProps) {
  const statusConfig = getStatusConfig(block.status);
  const progress = calculateProgress(block);
  const templateInfo = getTemplateInfo(block);
  const completionInfo = getCompletionInfo(block);
  const dateRange = formatDateRange(block.startDate, block.endDate);
  const blockTitle = formatBlockTitle(block);

  return (
    <div
      className={cn(
        "bg-[#1a1a19] rounded-lg p-4 mb-4",
        statusConfig.borderClass
      )}
    >
      {/* Header Row: Title and Status Badge */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-[#f7f6f2] font-['Montserrat'] flex-1">
          {blockTitle}
        </h3>
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-['Montserrat'] flex items-center gap-1",
            statusConfig.badgeClass
          )}
        >
          {statusConfig.icon}
          {statusConfig.label}
        </Badge>
      </div>

      {/* Date Range and Duration */}
      <div className="text-sm text-[#979795] font-['Montserrat'] mb-2">
        {dateRange} • {block.duration} week{block.duration !== 1 ? "s" : ""}
      </div>

      {/* Current Progress (Active blocks only) */}
      {block.status === "active" && block.currentDay && (
        <div className="text-sm text-[#979795] font-['Montserrat'] mb-2">
          Week {block.currentDay.week}, Day {block.currentDay.day}
        </div>
      )}

      {/* Template Info */}
      <div className="text-sm text-[#979795] font-['Montserrat'] mb-3">
        {templateInfo}
      </div>

      {/* Progress Bar (Active blocks only) */}
      {block.status === "active" && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#979795] font-['Montserrat']">Progress:</span>
            <span className="text-xs text-[#979795] font-['Montserrat']">{progress}%</span>
          </div>
          <Progress
            value={progress}
            className="h-2 bg-[#292928] [&>div]:bg-green-500"
          />
        </div>
      )}

      {/* Completion Info (Complete blocks only) */}
      {block.status === "complete" && completionInfo && (
        <div className="text-sm text-[#979795] font-['Montserrat'] mb-4">
          {completionInfo}
        </div>
      )}

      {/* Status-specific messages */}
      {block.status === "pending-signoff" && (
        <div className="text-sm text-[#979795] font-['Montserrat'] mb-4">
          Ready to send to athlete
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Active Block Actions */}
        {block.status === "active" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onView}
              className="h-9 px-3 text-xs font-['Montserrat'] border-[#292928] text-[#979795] hover:text-[#f7f6f2] hover:bg-[#1a1a19]"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-9 px-3 text-xs font-['Montserrat'] border-[#292928] text-[#979795] hover:text-[#f7f6f2] hover:bg-[#1a1a19]"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit Block
            </Button>
            {onViewPerformance && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewPerformance}
                className="h-9 px-3 text-xs font-['Montserrat'] border-[#292928] text-[#979795] hover:text-[#f7f6f2] hover:bg-[#1a1a19]"
              >
                View Performance
              </Button>
            )}
          </>
        )}

        {/* Pending Sign-off Actions */}
        {block.status === "pending-signoff" && (
          <>
            {onSignOff && (
              <Button
                size="sm"
                onClick={onSignOff}
                className="h-9 px-3 text-xs font-semibold font-['Montserrat'] bg-[#e5e4e1] text-black hover:bg-[#d5d4d1]"
              >
                <FileCheck className="h-4 w-4 mr-1" />
                Sign off & Send
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-9 px-3 text-xs font-['Montserrat'] border-[#292928] text-[#979795] hover:text-[#f7f6f2] hover:bg-[#1a1a19]"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit Block
            </Button>
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="h-9 px-3 text-xs font-['Montserrat'] border-[#292928] text-[#979795] hover:text-[#f7f6f2] hover:bg-[#1a1a19]"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Draft
              </Button>
            )}
          </>
        )}

        {/* Complete Block Actions */}
        {block.status === "complete" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onView}
              className="h-9 px-3 text-xs font-['Montserrat'] border-[#292928] text-[#979795] hover:text-[#f7f6f2] hover:bg-[#1a1a19]"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
            {onCopy && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCopy}
                className="h-9 px-3 text-xs font-['Montserrat'] border-[#292928] text-[#979795] hover:text-[#f7f6f2] hover:bg-[#1a1a19]"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy to New Block
              </Button>
            )}
          </>
        )}

        {/* Draft Block Actions */}
        {block.status === "draft" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-9 px-3 text-xs font-['Montserrat'] border-[#292928] text-[#979795] hover:text-[#f7f6f2] hover:bg-[#1a1a19]"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit Block
            </Button>
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="h-9 px-3 text-xs font-['Montserrat'] border-[#292928] text-[#979795] hover:text-[#f7f6f2] hover:bg-[#1a1a19]"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Draft
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

