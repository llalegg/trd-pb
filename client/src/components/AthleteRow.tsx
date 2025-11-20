import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { format, formatDistanceToNow } from "date-fns";
import { ChevronRight, AlertTriangle, Activity, AlertCircle, Wrench, Eye, Edit, FileCheck, CheckCircle, CheckCircle2, ChevronUp, Plus } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type AthleteWithPhase, type Block, type Phase } from "@shared/schema";
import { cn } from "@/lib/utils";

interface AthleteRowProps {
  athleteData: AthleteWithPhase;
  isExpanded: boolean;
  onToggleExpand: () => void;
  matchingBlockIds?: Set<string>;
}

const getStatusIcon = (status?: "injured" | "rehabbing" | "lingering-issues" | null) => {
  if (!status) return null;
  const iconClass = "h-5 w-5";
  const bgClass = status === "injured" ? "bg-red-500/10" : status === "rehabbing" ? "bg-blue-500/10" : "bg-amber-500/10";
  switch (status) {
    case "injured":
      return (
        <div className={cn("p-1.5 rounded-full", bgClass)}>
          <AlertTriangle className={cn("h-5 w-5", "text-red-500")} />
        </div>
      );
    case "rehabbing":
      return (
        <div className={cn("p-1.5 rounded-full", bgClass)}>
          <Activity className={cn("h-5 w-5", "text-blue-500")} />
        </div>
      );
    case "lingering-issues":
      return (
        <div className={cn("p-1.5 rounded-full", bgClass)}>
          <AlertCircle className={cn("h-5 w-5", "topright")} />
        </div>
      );
    default:
      return null;
  }
};

const getStatusTooltip = (status?: "injured" | "rehabbing" | "lingering-issues" | null) => {
  if (!status) return "";
  switch (status) {
    case "injured":
      return "Injured - needs medical clearance";
    case "rehabbing":
      return "Currently in rehab protocol";
    case "lingering-issues":
      return "Has lingering issues to quor";
    default:
      return "";
  }
};

const getAvatarBorderClass = (status?: "injured" | "rehabbing" | "lingering-issues" | null) => {
  switch (status) {
    case "injured":
      return "ring-2 ring-red-500/40";
    case "rehabbing":
      return "ring-2 ring-blue-500/40";
    case "lingering-issues":
      return "ring-2 ring-amber-500/40";
    default:
      return "ring-1 ring-[#292928]";
  }
};

// Returns Tailwind classes for a season badge style
const getSeasonBadgeStyle = (season?: string | null): string => {
  const s = (season || "").toLowerCase();
  if (s.includes("in") && s.includes("season")) return "bg-green-500/20 text-green-400 border-green-500/30";
  if (s.includes("pre")) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  if (s.includes("post")) return "bg-purple-500/20 text-purple-400 border-purple-500/30";
  if (s.includes("off")) return "bg-[#171716] text-[#979795] border-[#292928]";
  return "bg-[#171716] text-[#979795] border-[#292928]";
};

// Formats season/sub-season display text
const getSeasonDisplayText = (season?: string | null, subSeason?: string | null): string => {
  const main = (season || "").trim();
  const sub = (subSeason || "").trim();
  if (main && sub) return `${main} • ${sub}`;
  return main || sub || "Season";
};

// Compute percent complete for a block (0-100)
const getBlockProgressPercent = (block: Block): number => {
  if (block.daysAvailable === undefined || block.daysComplete === undefined || block.daysAvailable <= 0) return 0;
  const pct = Math.round((block.daysComplete / block.daysAvailable) * 100);
  return Math.min(100, Math.max(0, pct));
};

// Human text for progress (e.g., "12/28 days • 43%")
const getBlockProgressText = (block: Block): string | null => {
  if (block.daysAvailable === undefined || block.daysComplete === undefined) return null;
  const pct = getBlockProgressPercent(block);
  return `${block.daysComplete}/${block.daysAvailable} days • ${pct}%`;
};

const getBlockStatusBadge = (status: Block["status"]) => {
  const variants: Record<Exclude<Block["status"], undefined>, { label: string; className: string; icon?: React.ReactNode }> = {
    active: { label: "Active", className: "bg-green-500/20 text-green-400 border-green-500/30" },
    complete: { label: "Complete", className: "bg-[#979795]/5 text-[#979795] border-transparent", icon: <CheckCircle2 className="h great-3 w-3" /> },
    draft: { label: "Draft", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    planned: { label: "Planned", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  };
  const v = variants[status as Exclude<Block["status"], undefined>];
  return (
    <Badge variant="secondary" className={cn("text-xs font-['Montserrat'] flex items-center gap-1", v.className)}>
      {v.icon}
      {v.label}
    </Badge>
  );
};

const getCurrentBlockStatus = (blocks: Block[]): { text: React.ReactNode; color: string } => {
  const sorted = [...blocks].sort((a, b) => a.blockNumber - b.blockNumber);
  const active = sorted.find((b) => b.status === "active");
  if (active) {
    const season = active.season || active.name.replace(/Block \d+[: ]?/i, "").trim();
    return {
      text: (
        <>
          <span className="text-[#f7f6f2]">{`${season} (Block ${active.blockNumber})`}</span>
          <Badge variant="secondary" className="text-xs font-['Montserrat'] ml-2 bg-green-500/20 text-green-500 border-green-500/30">Active</Badge>
        </>
      ),
      color: "",
    };
  }
  return { text: "No active block", color: "text-[#979795]" };
};

const getNextAction = (blocks: Block[]): { text: string | null; urgency: "overdue" | "today" | "thisWeek" | "later" | null } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = blocks.filter(b => b.nextBlockDue).sort((a, b) => new Date(a.nextBlockDue!).getTime() - new Date(b.nextBlockDue!).getTime())[0];
  if (!next || !next.nextBlockDue) return { text: null, urgency: null };
  const due = new Date(next.nextBlockDue);
  const d = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  let label = ""; let urgency: "overdue" | "today" | "thisWeek" | "later" = "later";
  if (d < 0) { label = `Block due ${Math.abs(d)}d ago`; urgency = "overdue"; }
  else if (d === 0) { label = "Block due today"; urgency = "today"; }
  else if (d === 1) { label = "Block bugün"; urgency = "today"; }
  else if (d <= 7) { label = `Block due in ${d} days`; urgency = "thisWeek"; }
  else { label = `Block bize ${d} days`; }
  return { text: label, urgency } as any;
};

const getNextActionColor = (urgency: "overdue" | "today" | "thisWeek" | "later" | null): string => {
  switch (urgency) {
    case "overdue": return "text-red-500";
    case "today": return "text-amber-500";
    case "thisWeek": return "text-amber-500";
    default: return "text-[#979795]";
  }
};

const getHoverTooltipContent = (blocks: Block[], nextActionText?: string | null, nextActionDate?: Date | null): string | null => {
  const sortedBlocks = [...blocks].sort((a, b) => a.blockNumber - b.blockNumber);
  const activeBlock = sortedBlocks.find(block => block.status === "active");
  
  const parts: string[] = [];
  
  if (activeBlock) {
    const daysRemaining = activeBlock.daysAvailable && activeBlock.daysComplete !== undefined
      ? activeBlock.daysAvailable - activeBlock.daysComplete
      : null;
    
    const lastActivity = activeBlock.lastModification || activeBlock.lastSubmission;
    const lastActivityText = lastActivity
      ? formatDistanceToNow(new Date(lastActivity), { addSuffix: true })
      : "No activity";
    
    parts.push(`Active: ${activeBlock.name}`);
    if (daysRemaining !== null) {
      parts.push(`${daysRemaining} days remaining`);
    }
    parts.push(`Last activity: ${lastActivityText}`);
  }
  
  // Add next action date if available
  if (nextActionText && nextActionDate) {
    const formattedDate = format(nextActionDate, "MMM d, yyyy");
    parts.push(`${nextActionText} (${formattedDate})`);
  }
  
  return parts.length > 0 ? parts.join(" • ") : null;
};

const getBlockStatusDots = (blocks: Block[]): Block["status"][] => {
  // Only show active blocks
  return [...blocks]
    .filter(block => block.status === "active")
    .map(block => block.status);
};

const getBlockStatusDotsTooltip = (blocks: Block[]): string => {
  const counts = getBlockCounts(blocks);
  const parts: string[] = [];
  
  if (counts.active > 0) parts.push(`${counts.active} active`);
  if (counts.complete > 0) parts.push(`${counts.complete} complete`);
  if (counts.planned > 0) parts.push(`${counts.planned} planned`);
  if (counts.draft > 0) parts.push(`${counts.draft} draft`);
  
  return parts.join(", ") || "No blocks";
};

const getStatusDotColor = (status: Block["status"]): { bg: string; shadow: string } => {
  switch (status) {
    case "active":
      return { bg: "bg-green-500", shadow: "shadow-sm shadow-green-500/50" };
    case "complete":
      return { bg: "bg-[#979795]", shadow: "" };
    case "draft":
      return { bg: "bg-[#979795]", shadow: "" };
    case "planned":
      return { bg: "bg-blue-500", shadow: "shadow-sm shadow-blue-500/50" };
    default:
      return { bg: "bg-[#979795]", shadow: "" };
  }
};

const getPhaseIndicator = (currentPhase?: Phase): string | null => {
  if (!currentPhase) return null;
  const year = Math.ceil(currentPhase.phaseNumber / 4);
  return `Phase ${currentPhase.phaseNumber}`;
};

const getTotalProgramTimeline = (blocks: Block[]): string => {
  if (blocks.length === 0) return "";
  
  const sortedBlocks = [...blocks].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  
  const firstBlock = sortedBlocks[0];
  const lastBlock = sortedBlocks[sortedBlocks.length - 1];
  
  const totalWeeks = calculateWeeksBetween(firstBlock.startDate, lastBlock.endDate);
  
  return `${blocks.length} block${blocks.length !== 1 ? 's' : ''} (${totalWeeks} week${totalWeeks !== 1 ? 's' : ''} total)`;
};

const formatBlockName = (block: Block): React.ReactNode => {
  // Extract season from block.name or use block.season
  const season = block.season || block.name.replace(/Block \d+[: ]?/i, '').trim();
  return (
    <>
      <span className="text-base font-semibold font-['Montserrat'] text-[#f7f6f2]">
        {season}
      </span>
      <span className="text-sm font-semibold font-['Montserrat'] text-[#f7f6f2] ml-2">
        Block {block.blockNumber}
      </span>
    </>
  );
};

const formatBlockNameForCollapsed = (block: Block): string => {
  const season = block.season || block.name.replace(/Block \d+[: ]?/i, '').trim();
  return `${season} Block ${block.blockNumber}`;
};

const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, "MMM d, yyyy");
};

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

const formatPhaseTimeline = (currentPhase?: Phase): string | null => {
  if (!currentPhase) return null;
  const start = new Date(currentPhase.startDate);
  const end = new Date(currentPhase.endDate);
  const startDate = format(start, "MMM d");
  const endDate = format(end, "MMM d, yyyy");
  const msInWeek = 1000 * 60 * 60 * 24 * 7;
  const totalWeeks = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / msInWeek));
  return `${startDate} - ${endDate} • ${totalWeeks} week${totalWeeks !== 1 ? 's' : ''}`;
};

const calculateWeeksBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.ceil(diffDays / 7);
};

const getBlockCounts = (blocks: Block[]): { total: number; complete: number; active: number; draft: number; planned: number } => {
  return {
    total: blocks.length,
    complete: blocks.filter(b => b.status === "complete").length,
    active: blocks.filter(b => b.status === "active").length,
    draft: blocks.filter(b => b.status === "draft").length,
    planned: blocks.filter(b => b.status === "planned").length,
  };
};

const formatPhaseSummary = (blocks: Block[], currentPhase?: Phase): React.ReactNode => {
  const counts = getBlockCounts(blocks);
  const statusParts: React.ReactNode[] = [];
  
  // Phase info
  const phaseInfo = currentPhase 
    ? `Phase ${currentPhase.phaseNumber} (Year ${Math.ceil(currentPhase.phaseNumber / 4)}) • `
    : '';
  
  // Timeline
  const timeline = formatPhaseTimeline(currentPhase);
  
  // Show complete count if > 0
  if (counts.complete > 0) {
    statusParts.push(
      <span key="complete" className="text-[#979795]">
        {counts.complete} complete
      </span>
    );
  }
  
  // Always show active count (even if 0)
  statusParts.push(
    <span key="active" className="text-[#979795]">
      {counts.active} active
    </span>
  );
  
  // Show planned count if > 0
  if (counts.planned > 0) {
    statusParts.push(
      <span key="planned" className="text-[#979795]">
        {counts.planned} planned
      </span>
    );
  }
  
  // Show draft count if > 0
  if (counts.draft > 0) {
    statusParts.push(
      <span key="draft" className="text-[#979795]">
        {counts.draft} draft
      </span>
    );
  }
  
  // Format: Badges for each element
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {phaseInfo && (
        <Badge variant="secondary" className="text-xs font-['Montserrat'] bg-[#171716] text-[#979795] border-[#292928]">
          {phaseInfo.trim().replace(/ •$/, '')}
        </Badge>
      )}
      {timeline && (
        <Badge variant="secondary" className="text-xs font-['Montserrat'] bg-[#171716] text-[#979795] border-[#292928]">
          {timeline}
        </Badge>
      )}
      <Badge variant="secondary" className="text-xs font-['Montserrat'] bg-[#171716] text-[#979795] border-[#292928]">
        {counts.total} blocks
      </Badge>
      {counts.complete > 0 && (
        <Badge variant="secondary" className="text-xs font-['Montserrat'] bg-[#171716] text-[#979795] border-[#292928]">
          {counts.complete} complete
        </Badge>
      )}
      {counts.active > 0 && (
        <Badge variant="secondary" className="text-xs font-['Montserrat'] bg-green-500/20 text-green-400 border-green-500/30">
          {counts.active} active
        </Badge>
      )}
      {counts.planned > 0 && (
        <Badge variant="secondary" className="text-xs font-['Montserrat'] bg-blue-500/20 text-blue-400 border-blue-500/30">
          {counts.planned} planned
        </Badge>
      )}
      {counts.draft > 0 && (
        <Badge variant="secondary" className="text-xs font-['Montserrat'] bg-[#171716] text-[#979795] border-[#292928]">
          {counts.draft} draft
        </Badge>
      )}
    </div>
  );
};

export default function AthleteProgramCard({ athleteData, isExpanded, onToggleExpand, matchingBlockIds = new Set() }: AthleteRowProps) {
  const [, setLocation] = useLocation();
  const { athlete, blocks, currentPhase } = athleteData;
  const statusIcon = getStatusIcon(athlete.status);
  const statusTooltip = getStatusTooltip(athlete.status);
  const nextActionData = getNextAction(blocks);
  const nextAction = nextActionData.text;
  const nextActionUrgency = nextActionData.urgency;
  const currentBlockStatusData = getCurrentBlockStatus(blocks);
  const nextColor = getNextActionColor(nextActionUrgency);

  // Get next action date for tooltip
  const nextActionDate = useMemo(() => {
    if (!nextAction) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find the block with nextBlockDue
    const nextBlockDue = blocks
      .filter(block => block.nextBlockDue)
      .sort((a, b) => {
        if (!a.nextBlockDue || !b.nextBlockDue) return 0;
        return new Date(a.nextBlockDue).getTime() - new Date(b.nextBlockDue).getTime();
      })[0];
    
    return nextBlockDue?.nextBlockDue ? new Date(nextBlockDue.nextBlockDue) : null;
  }, [blocks, nextAction]);
  
  const hoverTooltipContent = getHoverTooltipContent(blocks, nextAction, nextActionDate);
  const blockStatusDots = getBlockStatusDots(blocks);
  const blockStatusDotsTooltip = getBlockStatusDotsTooltip(blocks);
  const phaseIndicator = getPhaseIndicator(currentPhase);
  const phaseTimeline = formatPhaseTimeline(currentPhase);
  
  // Group blocks by phase (for now, assume all blocks are in currentPhase or group by blockNumber sequence)
  // Sort blocks by blockNumber descending (recent to oldest)
  const sortedBlocks = [...blocks].sort((a, b) => b.blockNumber - a.blockNumber);
  const rowRef = useRef<HTMLDivElement>(null);
  const blocksContainerRef = useRef<HTMLDivElement>(null);
  const previousExpandedRef = useRef(isExpanded);
  
  // Focus management when expanding
  useEffect(() => {
    if (isExpanded && !previousExpandedRef.current && blocksContainerRef.current) {
      // Focus first block or empty state when expanding
      const firstFocusable = blocksContainerRef.current.querySelector('button, [tabindex="0"]') as HTMLElement;
      if (firstFocusable) {
        setTimeout(() => firstFocusable.focus(), 100);
      }
    }
    previousExpandedRef.current = isExpanded;
  }, [isExpanded]);
  
  const handleRowClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons or chevron
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[aria-label*="Expand"], [aria-label*="Collapse"]')) {
      return;
    }
    // Navigate to Review mode page for athlete
    setLocation(`/programs/${athlete.id}`);
  };
  
  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Only navigate when collapsed
      onToggleExpand();
    }
  };
  
  const handleViewBlock = (e: React.MouseEvent, blockId: string) => {
    e.stopPropagation();
    setLocation(`/program-page?blockId=${blockId}`);
  };
  
  const handleEditBlock = (e: React.MouseEvent, blockId: string) => {
    e.stopPropagation();
    setLocation(`/programs/${athlete.id}?tab=builder&mode=edit&blockId=${blockId}`);
  };
  
  // Determine card border color based on block status
  return (
    <div className={cn(
      "bg-[#1a1a19] border border-[#292928] rounded-lg px-4 pt-4 pb-4 mb-2 transition-all duration-200 hover:border-[#3a3a38] hover:shadow-lg"
    )}>
      {/* Athlete Summary Row */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={rowRef}
            role="button"
            tabIndex={0}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} athlete ${athlete.name}`}
            className={cn(
              "group flex flex-col sm:flex-row sm:items-center cursor-pointer transition-colors duration-150 hover:bg-[#1a1a19] focus:outline-none active:bg-[#1a1a19]"
            )}
            onClick={handleRowClick}
            onKeyDown={handleKeyDown}
          >
        {/* Left Section: Status Icon, Avatar, Name */}
        <div className="flex items-center gap-[12px] flex-shrink-0 pr-[12px]">
          {/* Expand/Collapse Chevron moved to the left of name & avatar */}
          <button
            onClick={handleChevronClick}
            aria-label={isExpanded ? `Collapse athlete ${athlete.name}` : `Expand athlete ${athlete.name}`}
            className="p-1 hover:bg-[#1a1a19] rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronUp 
                className="h-5 w-5 text-[#979795] transition-all duration-200 ease-in-out flex-shrink-0 group-hover:text-[#f7f6f2]"
              />
            ) : (
              <ChevronRight 
                className="h-5 w-5 text-[#979795] transition-all duration-200 ease-in-out flex-shrink-0 group-hover:text-[#f7f6f2]"
              />
            )}
          </button>
          {statusIcon && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex-shrink-0">
                  {statusIcon}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{statusTooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          <Avatar className={cn("h-10 w-10 flex-shrink-0", getAvatarBorderClass(athlete.status))}>
            <AvatarImage src={athlete.photo} alt={athlete.name} />
            <AvatarFallback className="bg-[#292928] text-[#f7f6f2] text-sm font-['Montserrat']">
              {athlete.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <span className="text-base font-semibold font-['Montserrat'] text-[#f7f6f2] truncate">
            {athlete.name}
          </span>
        </div>
        
        {/* Center Section: Block Summary */}
        {!isExpanded && (
          <div className="flex-1 min-w-0 hidden md:flex md:justify-start">
            <div className={cn(
              "text-sm font-['Montserrat'] px-3 py-1.5 rounded-full border border-[#292928] bg-[#171716] text-[#979795] hover:bg-[#1a1a19] transition-colors duration-200 flex items-center gap-2",
              currentBlockStatusData?.color || ""
            )}>
              {currentBlockStatusData?.text}
            </div>
          </div>
        )}
        
        {/* Right Section: Next Action or Block Count, Chevron */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          {!isExpanded && (
            <>
              {nextAction && (
                <span className={cn(
                  "text-xs font-['Montserrat'] flex-shrink-0 hidden sm:inline",
                  nextColor
                )}>
                  {nextAction}
                </span>
              )}
              {blocks.length > 0 && (
                <span className="text-xs font-['Montserrat'] text-[#979795] flex-shrink-0 hidden sm:inline">
                  {getTotalProgramTimeline(blocks)}
                </span>
              )}
            </>
          )}
          {/* View Program button should be visible in both collapsed and expanded states */}
          <Button
            variant="secondary"
            size="sm"
            aria-label={`Open program dashboard for ${athlete.name}`}
            className="text-xs"
            onClick={(e) => {
              e.stopPropagation();
              setLocation(`/programs/${athlete.id}`);
            }}
          >
            Program
          </Button>
        </div>
        
        {/* Mobile: Next Action and Timeline */}
        {!isExpanded && (
          <>
            {nextAction && (
              <div className={cn(
                "text-xs font-['Montserrat'] flex-shrink-0 sm:hidden",
                nextColor
              )}>
                {nextAction}
              </div>
            )}
            
            {blocks.length > 0 && (
              <div className="text-xs font-['Montserrat'] text-[#979795] flex-shrink-0 sm:hidden">
                {getTotalProgramTimeline(blocks)}
              </div>
            )}
          </>
        )}
          </div>
        </TooltipTrigger>
        {!isExpanded && hoverTooltipContent && (
          <TooltipContent>
            <p className="text-xs font-['Montserrat']">{hoverTooltipContent}</p>
          </TooltipContent>
        )}
      </Tooltip>
      
      {/* Expanded Block List */}
      <div
        ref={blocksContainerRef}
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[2000px] opacity-100 pt-4" : "max-h-0 opacity-0"
        )}
        aria-hidden={!isExpanded}
      >
        {blocks.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm font-['Montserrat'] text-[#979795] mb-4">
              No blocks for this athlete yet
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                  setLocation(`/programs/${athlete.id}?tab=builder`);
              }}
              className="bg-[#171716] text-[#f7f6f2] border-[#292928] hover:bg-[#1a1a19] font-['Montserrat'] transition-colors duration-200"
            >
              <Plus className="h-3 w-3 mr-2" />
              Create first block
            </Button>
          </div>
        ) : (
          <>
            {/* Phase Header */}
            {sortedBlocks.length > 0 && (
              <div className="pb-2 mb-5">
                {formatPhaseSummary(sortedBlocks, currentPhase)}
              </div>
            )}
            <div className="space-y-2">
              {sortedBlocks.map((block, index) => {
                return (
                  <div
                    key={block.id}
                    className={cn(
                      "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 hover:bg-[#1f1f1e] transition-colors duration-200 rounded-md px-4 min-h-[44px] border border-[#2a2a29] bg-[#1c1c1b]"
                    )}
                  >
                  {/* Block Number and Name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {formatBlockName(block)}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Season Phase Badge */}
                      <Badge variant="secondary" className={cn("text-xs font-['Montserrat']", getSeasonBadgeStyle(block.season))}>
                        {getSeasonDisplayText(block.season, block.subSeason)}
                      </Badge>
                      
                      {/* Date Range - Hidden on mobile */}
                      <span className="text-xs font-['Montserrat'] text-[#979795] hidden sm:inline">
                        {formatDateRange(block.startDate, block.endDate)}
                      </span>
                      
                      {/* Status Badge */}
                      {getBlockStatusBadge(block.status)}
                      
                      {/* Progress Text - Only for Active blocks, Hidden on mobile */}
                      {block.status === "active" && getBlockProgressText(block) && (
                        <span className="text-xs font-['Montserrat'] text-[#979795] hidden sm:inline">
                          {getBlockProgressText(block)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons and Progress Bar */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Progress Bar - Only for Active blocks, positioned before buttons */}
                    {block.status === "active" && block.daysComplete !== undefined && block.daysAvailable !== undefined && (
                      <div className="hidden sm:block">
                        <div className="w-[100px] h-[3px] bg-[#292928] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{ width: `${getBlockProgressPercent(block)}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {/* Primary Actions - Send to Athlete */}
                    {block.status === "draft" && (
                      <Button
                        size="sm"
                        aria-label={`Send ${block.name} to athlete`}
                        className="h-9 px-3 text-xs font-['Montserrat'] bg-primary text-black hover:bg-primary/90 transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement send to athlete functionality
                        }}
                      >
                        <FileCheck className="h-4 w-4 mr-1" />
                        <span>Send to Athlete</span>
                      </Button>
                    )}
                    
                    {/* Secondary Actions - View and Edit */}
                    <Button
                      variant="secondary"
                      size="sm"
                      aria-label={`View ${block.name}`}
                      className="h-9 px-3 text-xs font-['Montserrat'] border-[#292928] text-[#979795] hover:text-[#f7f6f2] hover:bg-[#1a1a19] transition-colors duration-200"
                      onClick={(e) => handleViewBlock(e, block.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      <span>View</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      aria-label={`Edit ${block.name}`}
                      className="h-9 px-3 text-xs font-['Montserrat'] border-[#292928] text-[#979795] hover:text-[#f7f6f2] hover:bg-[#1a1a19] transition-colors duration-200"
                      onClick={(e) => handleEditBlock(e, block.id)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      <span>Edit</span>
                    </Button>
                  </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

