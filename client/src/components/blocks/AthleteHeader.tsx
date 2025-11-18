import { useLocation } from "wouter";
import { format } from "date-fns";
import { ArrowLeft, AlertTriangle, Activity, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Athlete, type Phase, type Block } from "@shared/schema";
import { cn } from "@/lib/utils";

interface AthleteHeaderProps {
  athlete: Athlete;
  currentPhase?: Phase;
  blocks?: Block[]; // Blocks for the current phase
  rightContent?: React.ReactNode; // Optional: render controls (e.g., tabs) on the right
}

const getStatusIcon = (status?: "injured" | "rehabbing" | "lingering-issues" | null) => {
  if (!status) return null;
  
  const iconClass = "h-4 w-4";
  const bgClass = status === "injured" 
    ? "bg-red-500/10" 
    : status === "rehabbing"
    ? "bg-blue-500/10"
    : "bg-amber-500/10";
  
  switch (status) {
    case "injured":
      return (
        <div className={cn("p-1 rounded-full", bgClass)}>
          <AlertTriangle className={cn(iconClass, "text-red-500")} />
        </div>
      );
    case "rehabbing":
      return (
        <div className={cn("p-1 rounded-full", bgClass)}>
          <Activity className={cn(iconClass, "text-blue-500")} />
        </div>
      );
    case "lingering-issues":
      return (
        <div className={cn("p-1 rounded-full", bgClass)}>
          <AlertCircle className={cn(iconClass, "text-amber-500")} />
        </div>
      );
    default:
      return null;
  }
};

const getStatusBadge = (status?: "injured" | "rehabbing" | "lingering-issues" | null) => {
  if (!status) return null;
  
  const variants: Record<string, { label: string; className: string }> = {
    injured: { label: "Injured", className: "bg-red-500/20 text-red-400 border-red-500/30" },
    rehabbing: { label: "Rehabbing", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    "lingering-issues": { label: "Lingering Issues", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  };
  
  const variant = variants[status];
  if (!variant) return null;
  
  return (
    <Badge variant="outline" className={cn("text-xs font-['Montserrat'] flex items-center gap-1", variant.className)}>
      {variant.label}
    </Badge>
  );
};

const getBlockCounts = (blocks: Block[] = []): { total: number; complete: number; active: number; draft: number; planned: number } => {
  return {
    total: blocks.length,
    complete: blocks.filter(b => b.status === "complete").length,
    active: blocks.filter(b => b.status === "active").length,
    draft: blocks.filter(b => b.status === "draft").length,
    planned: blocks.filter(b => b.status === "planned").length,
  };
};

const formatPhaseDateRange = (phase: Phase): string => {
  const start = new Date(phase.startDate);
  const end = new Date(phase.endDate);
  
  // If same year, only show year on end date
  if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
  }
  
  // Different years, show both
  return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`;
};

const formatBlockSummary = (blocks: Block[] = []): string => {
  const counts = getBlockCounts(blocks);
  const parts: string[] = [];
  
  if (counts.complete > 0) {
    parts.push(`${counts.complete} complete`);
  }
  if (counts.active > 0) {
    parts.push(`${counts.active} active`);
  }
  if (counts.planned > 0) {
    parts.push(`${counts.planned} planned`);
  }
  if (counts.draft > 0) {
    parts.push(`${counts.draft} draft`);
  }
  
  if (parts.length === 0) {
    return "0 blocks";
  }
  
  return parts.join(", ");
};

export default function AthleteHeader({ athlete, currentPhase, blocks = [], rightContent }: AthleteHeaderProps) {
  const [, setLocation] = useLocation();
  
  // Extended athlete info (position/location not in base Athlete type, but may be added)
  const extendedAthlete = athlete as Athlete & { position?: string; location?: string };
  const position = extendedAthlete.position;
  const location = extendedAthlete.location;
  
  const statusIcon = getStatusIcon(athlete.status);
  const statusBadge = getStatusBadge(athlete.status);
  const blockCounts = getBlockCounts(blocks);
  
  return (
    <div className="bg-surface-base border-b border-[#292928] p-6">
      {/* Top Row: Back Button + optional right controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/programs")}
            className="text-[#979795] hover:text-[#f7f6f2] font-['Montserrat'] -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Athletes
          </Button>
        </div>
        {rightContent && (
          <div className="flex items-center">
            {rightContent}
          </div>
        )}
      </div>
      
      {/* Phase Info Row */}
      {currentPhase && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* Phase Number and Year */}
          <Badge variant="outline" className="text-xs font-['Montserrat'] bg-[#171716] text-[#979795] border-[#292928]">
            Phase {currentPhase.phaseNumber} (Year {Math.ceil(currentPhase.phaseNumber / 4)})
          </Badge>
          
          {/* Date Range */}
          <span className="text-xs text-[#979795] font-['Montserrat']">
            {formatPhaseDateRange(currentPhase)}
          </span>
          
          {/* Block Count Summary */}
          <span className="text-xs text-[#979795] font-['Montserrat']">
            {blockCounts.total} block{blockCounts.total !== 1 ? "s" : ""}
          </span>
          
          {/* Block Status Summary */}
          {blockCounts.total > 0 && (
            <span className="text-xs text-[#979795] font-['Montserrat']">
              • {formatBlockSummary(blocks)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

