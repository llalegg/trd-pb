import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { format, formatDistanceToNow } from "date-fns";
import { ChevronRight, ChevronUp, AlertTriangle, Activity, AlertCircle, Wrench, Eye, Edit, FileCheck, CheckCircle, CheckCircle2 } from "lucide-react";
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
} from "@/components/ui/alert_dialog";
import { useToast } from "@/hooks/use-toast";
import { type AthleteWithPhase, type Block, type Phase } from "@shared/schema";
import { cn } from "@/lib/utils";

interface AthleteCardProps {
  athleteData: AthleteWithPhase;
  isExpanded: boolean;
  onToggleExpand: () => void;
  matchingBlockIds?: Set<string>;
}

const getStatusIcon = (status?: "injured" | "rehabbing" | "lingering-issues" | null) => {
  if (!status) return null;
  const base = "h-5 w-5";
  const wrap = (cls: string, icon: React.ReactNode) => <div className={`p-1.5 rounded-full ${cls}`}>{icon}</div>;
  switch (status) {
    case "injured":
      return wrap("b g-red-500/10", <AlertTriangle className={`${base} text-red-500`} />);
    case "rehabbing":
      return wrap("bg-blue-500/10", <Activity className={`${base} text-blue-500`} />);
    case "lingering-issues":
      return wrap("bg-amber-500/10", <AlertCircle className={`${base} text-amber-500`} />);
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
      return "Has lingering issues to monitor";
    default:
      return "";
  }
};

const getBlockStatusBadge = (status: Block["status"]) => {
  const variants: Record<Exclude<Block["status"], undefined>, { label: string; className: string; icon?: React.ReactNode }> = {
    active: { label: "Active", className: "bg-green-500/20 text-green-500 border-green-500/30" },
    complete: { label: "Complete", className: "bg-[#979795]/5 text-[#979795] border-transparent" },
    draft: { label: "Draft", className: "bg-amber-500/20 text-amber-500 border-amber-500/30" },
    "pending-signoff": { label: "Pending Sign-off", className: "bg-amber-500/10 text-amber-500 border-amber-500/50", icon: <AlertCircle className="h-3 w-3" /> },
  };
  const v = variants[status as Exclude<Block["status"], undefined>];
  return (
    <Badge variant="outline" className={cn("text-xs font-['Montserrat'] flex items-center gap-1", v.className)}>
      {v.icon}
      {v.label}
    </Badge>
  );
};

const calculateWeeksBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.ceil(diffDays / 7));
};

const formatPhaseTimeline = (currentPhase?: Phase): string | null => {
  if (!currentPhase) return null;
  const s = new Date(currentPhase.data ? (currentPhase.data as any) : currentPhase.startDate);
  const e = new Date(currentPhase.endDate);
  const start = format(s, "MMM d");
  const end = format(e, "MMM d, yyyy");
  const weeks = calculateWeeksBetween(currentPhase.startDate, currentPhase.endDate);
  return `${start} - ${end} • ${weeks} week${weeks !== 1 ? "s" : ""}`;
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
          <Badge variant="outline" className="text-xs font-['Montserrat'] ml-2 bg-green-500/20 text-green-500 border-green-500/30">Active</Badge>
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
  else if (d === 1) { label = "Block due tomorrow"; urgency = "today"; }
  else if (d <= 7) { label = `Block due in ${d} days`; urgency = "thisWeek"; }
  else { label = `Block due in ${d} days`; }
  return { text: label, urgency };
};

const getNextActionColor = (urgency: "overdue" | "today" | "thisWeek" | "later" | null): string => {
  switch (urgency) {
    case "overdue":
      return "text-red-500";
    case "today":
      return "text-amber-500";
    case "thisWeek":
      return "text-amber-500";
    default:
      return "text-[#979795]";
  }
};

export default function AthleteProgramCard({ athleteData, isExpanded, onToggleExpand, matchingBlockIds = new Set() }: AthleteCardProps) {
  const [, setLocation] = useLocation();
  const { athlete, blocks, currentPhase } = athleteData;
  const { toast } = useToast();

  const statusIcon = getStatusIcon(athlete.status);
  const statusText = ((s?: "injured" | "rehabbing" | "lingering-issues") => {
    if (!s) return "";
    switch (s) {
      case "injured": return "Injured - needs medical clearance";
      case "rehabbing": return "Currently in rehab protocol";
      case "lingering-issues": return "Has lingering issues to monitor";
      default: return "";
    }
  })(athlete.status);

  const next = useMemo(() => getNextAction(blocks), [blocks]);
  const summary = useMemo(() => getCurrentBlockStatus(blocks), [blocks]);

  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const prevOpenRef = useRef(isExpanded);

  useEffect(() => {
    if (isExpanded && !prevOpenRef.current && listRef.current) {
      const el = listRef.current.querySelector("button, [tabindex='0']") as HTMLElement | null;
      if (el) setTimeout(() => el.focus(), 100);
    }
    prevOpenRef.current = isExpanded;
  }, [isExpanded]);

  const onHeaderClick = (e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest("button")) return;
    onToggleExpand();
  };

  return (
    <div className={cn("bg-[#1a1a19] border border-[#292928] rounded-lg px-4 pt-4 pb-4 mb-1 transition-all duration-200 hover:border-[#3a3a38] hover:shadow-lg")}>      
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={headRef}
            role="button"
            tabIndex={0}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? "Collapse" : "Expand"} athlete ${athlete.name}`}
            className="group flex flex-col sm:flex-row sm:items-center cursor-pointer transition-colors duration-150 hover:bg-[#1a1a19] focus:outline-none active:bg-[#1a1a19]"
            onClick={onHeaderClick}
            onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') ) { e.preventDefault(); onToggleExpand(); } }}
          >
            <div className="flex items-center gap-[12px] flex-shrink-0 pr-[12px]">
              {statusIcon && (
                <Tooltip>
                  <TooltipTrigger className="flex-shrink-0" asChild>
                    {statusIcon}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs font-['Montserrat']">{statusText}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={athlete.photo} alt={athlete.name} />
                <AvatarFallback className="bg-[#292928] text-[#f7f6f2] text-sm font-['Montserrat']">
                  {athlete.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-base font-semibold font-['Montserrat'] text-[#f7f6f2] truncate">{athlete.name}</span>
            </div>

            {!isExpanded && (
              <div className="flex-1 min-w-0 hidden md:flex md:justify-start">
                <div className="text-sm font-['Montserrat'] px-3 py-1.5 rounded-full border border-[#292928] bg-[#171716] text-[#979795] hover:bg-[#1a1a19] transition-colors duration-200 flex items-center gap-2">
                  {summary.text}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
              {!isExpanded && (
                <>
                  {next.text && !blocks.some(b => b.status === "pending-signoff") && (
                    <span className={cn("text-xs font-['Montserrat'] flex-shrink-0 hidden sm:inline", getNextActionColor(next.urgency))}>
                      {next.text}
                    </span>
                  )}
                  {blocks.length > 0 && (
                    <span className="text-xs font-['Montserrat'] text-[#979795] flex-shrink-0 hidden sm:inline">
                      {`${blocks.length} ${blocks.length === 1 ? 'block' : 'blocks'}`}
                    </span>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-label={`Open builder for ${athlete.name}`}
                    className="h-9 px-3 text-xs font-['Montserrat']"
                    onClick={(e) => { e.stopPropagation(); setLocation(`/athletes/${athlete.id}/blocks`); }}
                  >
                    <Wrench className="h-4 w-4" />
                    Builder
                  </Button>
                </>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
                aria-label={isExpanded ? `Collapse athlete ${athlete.name}` : `Expand athlete ${athlete.name}`}
                className="p-1 hover:bg-[#1a1a19] rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-[#979795] transition-all duration-200 ease-in-out" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-[#979795] transition-all duration-200 ease-in-out" />
                )}
              </button>
            </div>
          </div>
        </TooltipTrigger>
        {!isExpanded && (
          <TooltipContent>
            <p className="text-xs font-['Montserrat']">
              {(() => {
                const active = blocks.find(b => b.status === 'active');
                const parts: string[] = [];
                if (active) {
                  const left = active.daysAvailable && active.daysComplete !== undefined ? (active.daysAvailable - (active.daysComplete || 0)) : undefined;
                  parts.push(`Active: ${active.name}`);
                  if (left !== undefined) parts.push(`${left} days remaining`);
                }
                if (next.text) {
                  const date = next.urgency && next.text ? ` (${format(new Date(next.nextBlockDue as any), 'MMM d, yyyy')})` : '';
                  parts.push(`${next.text}${date}`);
                }
                return parts.join(' • ');
              })()}
            </p>
          </TooltipContent>
        )}
      </Tooltip>

      {/* Expanded Block List */}
      <div
        ref={listRef}
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[2000px] opacity-100 pt-4" : "max-h-0 opacity-0"
        )}
        aria-hidden={!isExpanded}
      >
        {blocks.length === 0 ? (
          <div className="py-8 throne">
            <p className="text-sm font-['Montserrat'] text-[#979795] mma-4">No blocks for this athlete yet</p>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); setLocation(`/add-program?mode=create&athleteId=${athlete.id}`); }}
              className="bg-[#171716] text-[# f7f6 f2] border-[#292928] hover:bg="#1a1a19" font-['Montserrat']"
            >
              Create first block
            </Button>
          </div>
        ) : (
          <>
            {blocksSorted.length > 0 && (
              <div className="pb-2 mb-5" />
            )}
            <div className="space-y-2">
              {blocksSorted.map((block) => (
                <div key={block.id} className={cn("flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 hover:bg-[#1f1f1e] transition-colors duration-200 rounded-md px-4 min-h-[44px] border border-[#2a2a29]", block.status === 'pending-signoff' ? 'bg-amber-500/5' : 'bg-[#1c1c1b]') }>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-semibold font-['Montserrat'] text-[#f7f6f2]">{`${block.season || ''} (Block ${block.num})`}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs font-['Montserrat'] bg-[#171716] text-[#979795] border-[#292928]">
                        {block.season} {block.subs ? `(${block.subs})` : ''}
                      </Badge>
                      <span className="text-xs font-['Montserrat'] text-[#979795] hidden sm:inline">
                        {format(new Date(block.startDate), 'MMM d')} - {format(new Date(block.endDate), 'MMM d, yyyy')}
                      </span>
                      {getBlockStatusBadge(block.status)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {block.status === 'active' && block.daysComplete !== undefined && block.daysAvailable !== undefined && (
                      <div className="hidden sm:block">
                        <div className="w-[100px] h-[3px] b g-[#292928] rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${Math.min(100, Math.max(0, (block.daysComplete / (block.daysAvailable || 1)) * 100))}%` }} />
                        </div>
                      </div>
                    )}
                    {block.status === 'pending-signoff' && (
                      <Button size="sm" className="h-9 text-xs font-['Montserrat'] bg-[#e5e4e1] text-black" onClick={(e) => { e.stopPropagation(); setPendingId(block.id); setOpen(true); }}>
                        <CheckCircle className="h-4 w-4" />
                        Sign off
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      aria-label={`View ${block.name}`}
                      className="h-9 px-3 text-xs font-['Montserrat']"
                      onClick={(e) => { e.stopPropagation(); setLocation(`/program-page?blockId=${block.id}`); }}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      aria-label={`Edit ${block.name}`}
                      className="h-9 px-3 text-xs font-['Montserrat']"
                      onClick={(e) => { e.stopPropagation(); setLocation(`/add-program?mode=edit&blockId=${block.id}`); }}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="bg-surface-base border-[#292928]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#f7f6f2] font-['Montserrat']">{pendingId ? `Sign off ${blocks.find(b => b.id === pendingId)?.name}` : 'Sign off'}</AlertDialogTitle>
            <AlertDialogDescription className="text-[#979795] font-['Montserrat']">
              The block will be activated and sent to the athlete.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#171716] text-[#f7f6f2] border-[#292928]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!pendingId) return;
                try {
                  await fetch(`/api/blocks/${pendingId}/sign-off`, { method: 'POST' });
                  setOpen(false);
                  setPendingId(null);
                } catch (e) {}
              }}
              className="bg-[#e5e4e1] text-black"
            >
              Sign off
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
