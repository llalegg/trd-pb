import type { Athlete, Phase, Block } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, Activity, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface AthleteInfoSidebarProps {
  athlete: Athlete;
  currentPhase?: Phase;
  blocks: Block[];
  className?: string;
}

function getStatusIcon(status?: Athlete["status"]) {
  if (!status) return null;
  const base = "w-4 h-4";
  switch (status) {
    case "injured":
      return <AlertTriangle className={cn(base, "text-red-400")} />;
    case "rehabbing":
      return <Activity className={cn(base, "text-amber-400")} />;
    case "lingering-issues":
      return <AlertCircle className={cn(base, "text-amber-400")} />;
    default:
      return null;
  }
}

function formatDateRange(start?: string, end?: string) {
  if (!start || !end) return "—";
  const s = new Date(start);
  const e = new Date(end);
  const sameYear = s.getFullYear() === e.getFullYear();
  return sameYear
    ? `${format(s, "MMM d")} - ${format(e, "MMM d, yyyy")}`
    : `${format(s, "MMM d, yyyy")} - ${format(e, "MMM d, yyyy")}`;
}

export default function AthleteInfoSidebar({ athlete, currentPhase, blocks, className }: AthleteInfoSidebarProps) {
  const statusIcon = getStatusIcon(athlete.status);
  const totalBlocks = blocks.length;
  const complete = blocks.filter(b => b.status === "complete").length;
  const active = blocks.filter(b => b.status === "active").length;
  const pending = blocks.filter(b => b.status === "pending-signoff").length;
  const draft = blocks.filter(b => b.status === "draft").length;

  return (
    <aside
      className={cn(
        "border-r border-[#292928] bg-[#0d0d0c] h-full overflow-y-auto",
        className
      )}
    >
      <div className="p-4 space-y-4">
        {/* Athlete summary */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            {statusIcon}
            <h2 className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">
              {athlete.name}
            </h2>
          </div>
          <div className="text-xs text-[#979795] font-['Montserrat']">
            {(athlete as any).position || (athlete as any).xRole ? <span>{(athlete as any).position || (athlete as any).xRole}</span> : null}
            {(athlete as any).location ? <span className="ml-1">• {(athlete as any).location}</span> : null}
          </div>
        </div>

        {/* Phase info */}
        <div className="border border-[#292928] rounded-lg p-3 bg-[#0f0f0e]">
          <div className="text-xs text-[#979795] font-['Montserrat'] mb-2">
            Phase {currentPhase?.phaseNumber ?? "—"}
          </div>
          <Badge variant="outline" className="bg-[#171716] text-[#979795] border-[#292928] font-['Montserrat']">
            {formatDateRange(currentPhase?.startDate, currentPhase?.endDate)}
          </Badge>
        </div>

        {/* Blocks summary */}
        <div className="border border-[#292928] rounded-lg p-3 bg-[#0f0f0e] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#979795] font-['Montserrat']">
            <span>Total</span>
            <span className="text-[#f7f6f2]">{totalBlocks}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-[#979795] font-['Montserrat']">
            <span>Complete</span>
            <span className="text-[#f7f6f2]">{complete}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-[#979795] font-['Montserrat']">
            <span>Active</span>
            <span className="text-[#f7f6f2]">{active}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-[#979795] font-['Montserrat']">
            <span>Pending</span>
            <span className="text-[#f7f6f2]">{pending}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-[#979795] font-['Montserrat']">
            <span>Draft</span>
            <span className="text-[#f7f6f2]">{draft}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}


