import type { Athlete, Phase, Block } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, Activity, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { getDaysUntilBlockEnd, getSubSeasonStatus, getNextBlockDue } from "@/lib/programHelpers";

interface AthleteInfoSidebarProps {
  athlete: Athlete;
  currentPhase?: Phase;
  blocks: Block[];
  className?: string;
  keyDates?: Array<{ date: Date; label: string }>;
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

export default function AthleteInfoSidebar({ athlete, currentPhase, blocks, className, keyDates = [] }: AthleteInfoSidebarProps) {
  // Mock data for athlete details - in production, these would come from the athlete object
  const athleteDetails = {
    name: athlete.name || "Oliver Martinez",
    position: (athlete as any).position || (athlete as any).xRole || "Pitcher",
    age: (athlete as any).age || "19",
    height: (athlete as any).height || "5'7\"",
    weight: (athlete as any).weight || "140 lbs",
    level: (athlete as any).level || "College",
    team: (athlete as any).team || "State University",
    league: (athlete as any).league || "NCAA Division I",
    role: (athlete as any).xRole || (athlete as any).role || "Relief Pitcher",
    status: (athlete as any).status || athlete.status || "Cleared",
    location: (athlete as any).location || "Austin, TX",
  };

  const getStatusBadgeColor = (status?: string) => {
    if (!status) return "bg-green-500/20 text-green-400 border-green-500/30";
    const statusLower = status.toLowerCase();
    if (statusLower === "cleared") return "bg-green-500/20 text-green-400 border-green-500/30";
    if (statusLower === "injured") return "bg-red-500/20 text-red-400 border-red-500/30";
    if (statusLower === "rehabbing") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    return "bg-green-500/20 text-green-400 border-green-500/30";
  };

  const daysUntilBlockEnd = getDaysUntilBlockEnd(blocks);
  const subSeasonStatus = getSubSeasonStatus(blocks);
  const nextBlockDue = getNextBlockDue(blocks);
  const programEndDate = currentPhase?.endDate ? format(new Date(currentPhase.endDate), "MMM d, yyyy") : "–";

  // Parse program position into individual parts
  const currentBlock = blocks.find(b => b.status === "active");
  const totalBlocksInPhase = blocks.length;
  const phaseNum = currentPhase?.phaseNumber || 1;
  const blockNum = currentBlock?.blockNumber || 1;
  const week = currentBlock?.currentDay?.week || 1;
  const day = currentBlock?.currentDay?.day || 1;

  // Get badge color for days until block end
  const getDaysBadgeColor = (days: number | null): string => {
    if (days === null) return "bg-[#292928] text-[#f7f6f2] border-[#292928]";
    if (days === 0) return "bg-red-500/20 text-red-400 border-red-500/30";
    if (days <= 7) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    return "bg-[#292928] text-[#f7f6f2] border-[#292928]";
  };

  return (
    <aside
      className={cn(
        "border-r border-[#292928] bg-[#0d0d0c] h-full overflow-y-auto relative transition-all duration-300 w-[320px]",
        className
      )}
    >
      <div className="px-4 pb-4 space-y-6">
            {/* Athlete Header */}
            <div className="pt-2">
              <h2 className="text-base font-semibold text-[#f7f6f2] font-['Montserrat'] mb-1">
                {athleteDetails.name}
              </h2>
              <div className="text-sm text-[#979795] font-['Montserrat']">
                {athleteDetails.position}
              </div>
            </div>

        {/* Basic Information Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[#f7f6f2] font-['Montserrat'] uppercase tracking-wide">
            Basic Information
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#979795] font-['Montserrat']">Age</span>
              <span className="text-xs text-[#f7f6f2] font-['Montserrat'] font-medium">{athleteDetails.age}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#979795] font-['Montserrat']">Height</span>
              <span className="text-xs text-[#f7f6f2] font-['Montserrat'] font-medium">{athleteDetails.height}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#979795] font-['Montserrat']">Weight</span>
              <span className="text-xs text-[#f7f6f2] font-['Montserrat'] font-medium">{athleteDetails.weight}</span>
            </div>
          </div>
        </div>

        {/* Playing Information Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[#f7f6f2] font-['Montserrat'] uppercase tracking-wide">
            Playing Information
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#979795] font-['Montserrat']">Level</span>
              <span className="text-xs text-[#f7f6f2] font-['Montserrat'] font-medium">{athleteDetails.level}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#979795] font-['Montserrat']">Team</span>
              <span className="text-xs text-[#f7f6f2] font-['Montserrat'] font-medium">{athleteDetails.team}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#979795] font-['Montserrat']">League</span>
              <span className="text-xs text-[#f7f6f2] font-['Montserrat'] font-medium">{athleteDetails.league}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#979795] font-['Montserrat']">Role</span>
              <span className="text-xs text-[#f7f6f2] font-['Montserrat'] font-medium">{athleteDetails.role}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#979795] font-['Montserrat']">Location</span>
              <span className="text-xs text-[#f7f6f2] font-['Montserrat'] font-medium">{athleteDetails.location}</span>
            </div>
          </div>
        </div>

        {/* Readiness Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[#f7f6f2] font-['Montserrat'] uppercase tracking-wide">
            Readiness
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#979795] font-['Montserrat']">Injury/SI Status</span>
              <div className="flex items-center gap-1">
                {getStatusIcon(athlete.status)}
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs font-['Montserrat'] border px-2 py-0.5",
                    getStatusBadgeColor(athleteDetails.status)
                  )}
                >
                  {athleteDetails.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#979795] font-['Montserrat']">Position</span>
              <span className="text-xs text-[#f7f6f2] font-['Montserrat'] font-medium">{athleteDetails.location}</span>
            </div>
          </div>
        </div>

        {/* Program Status Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[#f7f6f2] font-['Montserrat'] uppercase tracking-wide">
            Program Status
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#979795] font-['Montserrat']">Current Phase, Block, Week, Day</span>
              <div className="flex items-center gap-1 flex-wrap">
                <Badge variant="outline" className="text-xs font-mono text-[#979795] bg-[#171716] border-[#292928]">
                  P{phaseNum}
                </Badge>
                <Badge variant="outline" className="text-xs font-mono text-[#979795] bg-[#171716] border-[#292928]">
                  B{blockNum}({totalBlocksInPhase})
                </Badge>
                <Badge variant="outline" className="text-xs font-mono text-[#979795] bg-[#171716] border-[#292928]">
                  W{week}
                </Badge>
                <Badge variant="outline" className="text-xs font-mono text-[#979795] bg-[#171716] border-[#292928]">
                  D{day}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#979795] font-['Montserrat']">Days until next block</span>
              {daysUntilBlockEnd.days === null ? (
                <span className="text-[#979795] text-xs">–</span>
              ) : (
                <Badge variant="outline" className={cn("text-xs font-['Montserrat']", getDaysBadgeColor(daysUntilBlockEnd.days))}>
                  {daysUntilBlockEnd.text}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#979795] font-['Montserrat']">Program end date</span>
              <span className="text-xs text-[#f7f6f2] font-['Montserrat'] font-medium">{programEndDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#979795] font-['Montserrat']">Sub-season status</span>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs font-['Montserrat']",
                  subSeasonStatus.includes("In-Season") 
                    ? "bg-[#292928] text-[#f7f6f2] border-[#292928]" 
                    : "bg-[#171716] text-[#979795] border-[#292928]"
                )}
              >
                {subSeasonStatus}
              </Badge>
            </div>
          </div>
        </div>

        {/* Key Dates Section */}
        {keyDates.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[#f7f6f2] font-['Montserrat'] uppercase tracking-wide">
              Key Dates
            </h3>
            <div className="space-y-2.5">
              {keyDates.map((keyDate, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#979795] font-['Montserrat']">{keyDate.label}</span>
                    <span className="text-xs text-[#f7f6f2] font-['Montserrat'] font-medium">
                      {format(keyDate.date, "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}


