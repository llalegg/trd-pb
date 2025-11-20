import React, { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle, Activity, AlertCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { type AthleteWithPhase, type Block } from "@shared/schema";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";

type TabView = "pending" | "current" | "upcoming";
type SortField = "athleteName" | "subSeason" | "blockProgress" | "programStatus" | "lastEntryDay" | "lastModificationDay";
type SortDirection = "asc" | "desc";

interface FilterState {
  athleteStatuses: string[]; // injured/rehabbing/lingering-issues
  blockStatuses: string[]; // active/complete/draft/planned
  seasons: string[];
  subSeasons: string[];
  urgency: string[]; // due-this-week, overdue, no-active-block
  nextBlockDueStart: string;
  nextBlockDueEnd: string;
  lastActivityStart: string;
  lastActivityEnd: string;
}

const STATUS_OPTIONS = [
  { value: "injured", label: "Injured" },
  { value: "rehabbing", label: "Rehabbing" },
  { value: "lingering-issues", label: "Lingering Issues" },
];
const BLOCK_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "complete", label: "Complete" },
  { value: "draft", label: "Draft" },
  { value: "planned", label: "Planned" },
];
const SEASON_OPTIONS = ["Pre-Season", "In-Season", "Off-Season"];
const SUB_SEASON_OPTIONS = ["Early", "Mid", "Late"];
const URGENCY_OPTIONS = [
  { value: "due-this-week", label: "Due this week" },
  { value: "overdue", label: "Overdue" },
  { value: "no-active-block", label: "No active block" },
];

// Helper Functions
const getStatusIcon = (status?: "injured" | "rehabbing" | "lingering-issues" | null) => {
  if (!status) return null;
  const bgClass = status === "injured" ? "bg-red-500/10" : status === "rehabbing" ? "bg-blue-500/10" : "bg-amber-500/10";
  switch (status) {
    case "injured":
      return (
        <div className={cn("p-1.5 rounded-full", bgClass)}>
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
      );
    case "rehabbing":
      return (
        <div className={cn("p-1.5 rounded-full", bgClass)}>
          <Activity className="h-5 w-5 text-blue-500" />
        </div>
      );
    case "lingering-issues":
      return (
        <div className={cn("p-1.5 rounded-full", bgClass)}>
          <AlertCircle className="h-5 w-5 text-amber-500" />
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
      return "Has lingering issues";
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

const getSeasonBadgeStyle = (season?: string | null): string => {
  const s = (season || "").toLowerCase();
  if (s.includes("in") && s.includes("season")) return "bg-green-500/20 text-green-400 border-green-500/30";
  if (s.includes("pre")) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  if (s.includes("post")) return "bg-purple-500/20 text-purple-400 border-purple-500/30";
  if (s.includes("off")) return "bg-[#171716] text-[#979795] border-[#292928]";
  return "bg-[#171716] text-[#979795] border-[#292928]";
};

const getSeasonDisplayText = (season?: string | null, subSeason?: string | null): string => {
  const main = (season || "").trim();
  const sub = (subSeason || "").trim();
  if (main && sub) return `${main} • ${sub}`;
  return main || sub || "Season";
};

const getBlockStatusBadge = (status: Block["status"]) => {
  const variants: Record<Exclude<Block["status"], undefined>, { label: string; className: string }> = {
    active: { label: "Active", className: "bg-green-500/20 text-green-400 border-green-500/30" },
    complete: { label: "Complete", className: "bg-[#979795]/5 text-[#979795] border-transparent" },
    draft: { label: "Draft", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    planned: { label: "Planned", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  };
  const v = variants[status as Exclude<Block["status"], undefined>];
  return (
    <Badge variant="outline" className={cn("text-xs font-['Montserrat'] flex items-center gap-1", v.className)}>
      {v.label}
    </Badge>
  );
};

const getCurrentBlock = (blocks: Block[]): Block | null => {
  const sorted = [...blocks].sort((a, b) => a.blockNumber - b.blockNumber);
  return sorted.find((b) => b.status === "active") || null;
};

const getNextAction = (blocks: Block[]): { text: string | null; urgency: "overdue" | "today" | "thisWeek" | "later" | null; date: Date | null } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = blocks.filter(b => b.nextBlockDue).sort((a, b) => new Date(a.nextBlockDue!).getTime() - new Date(b.nextBlockDue!).getTime())[0];
  if (!next || !next.nextBlockDue) return { text: null, urgency: null, date: null };
  const due = new Date(next.nextBlockDue);
  due.setHours(0, 0, 0, 0);
  const d = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  let label = ""; 
  let urgency: "overdue" | "today" | "thisWeek" | "later" = "later";
  if (d < 0) { 
    label = `${Math.abs(d)}d ago`; 
    urgency = "overdue"; 
  } else if (d === 0) { 
    label = "Today"; 
    urgency = "today"; 
  } else if (d === 1) { 
    label = "Tomorrow"; 
    urgency = "today"; 
  } else if (d <= 7) { 
    label = `${d}d`; 
    urgency = "thisWeek"; 
  } else { 
    label = format(due, "MMM d");
  }
  return { text: label, urgency, date: due };
};

const getNextActionColor = (urgency: "overdue" | "today" | "thisWeek" | "later" | null): string => {
  switch (urgency) {
    case "overdue": return "text-red-500";
    case "today": return "text-amber-500";
    case "thisWeek": return "text-amber-500";
    default: return "text-[#979795]";
  }
};

const getLastActivity = (blocks: Block[]): { text: string; date: Date | null } => {
  const activityDates: Date[] = [];
  blocks.forEach(block => {
    if (block.lastModification) {
      activityDates.push(new Date(block.lastModification));
    }
    if (block.lastSubmission) {
      activityDates.push(new Date(block.lastSubmission));
    }
  });
  
  if (activityDates.length === 0) {
    return { text: "–", date: null };
  }
  
  const mostRecent = new Date(Math.max(...activityDates.map(d => d.getTime())));
  return {
    text: formatDistanceToNow(mostRecent, { addSuffix: true }),
    date: mostRecent
  };
};

// Get block progress countdown (days remaining until block expires)
const getBlockProgress = (blocks: Block[]): { daysRemaining: number | null; text: string } => {
  const currentBlock = getCurrentBlock(blocks);
  if (!currentBlock) {
    return { daysRemaining: null, text: "–" };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(currentBlock.endDate);
  endDate.setHours(0, 0, 0, 0);
  
  const daysRemaining = differenceInDays(endDate, today);
  
  if (daysRemaining < 0) {
    return { daysRemaining: 0, text: "Expired" };
  }
  
  return { daysRemaining, text: `${daysRemaining}d` };
};

// Get last entry day (days since athlete last submitted data)
const getLastEntryDay = (blocks: Block[]): { daysAgo: number | null; text: string } => {
  const submissionDates: Date[] = [];
  blocks.forEach(block => {
    if (block.lastSubmission) {
      submissionDates.push(new Date(block.lastSubmission));
    }
  });
  
  if (submissionDates.length === 0) {
    return { daysAgo: null, text: "–" };
  }
  
  const mostRecent = new Date(Math.max(...submissionDates.map(d => d.getTime())));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  mostRecent.setHours(0, 0, 0, 0);
  
  const daysAgo = differenceInDays(today, mostRecent);
  
  if (daysAgo === 0) {
    return { daysAgo: 0, text: "Today" };
  } else if (daysAgo === 1) {
    return { daysAgo: 1, text: "1d ago" };
  } else {
    return { daysAgo, text: `${daysAgo}d ago` };
  }
};

// Get most recent modification day
const getLastModificationDay = (blocks: Block[]): { daysAgo: number | null; text: string } => {
  const modificationDates: Date[] = [];
  blocks.forEach(block => {
    if (block.lastModification) {
      modificationDates.push(new Date(block.lastModification));
    }
  });
  
  if (modificationDates.length === 0) {
    return { daysAgo: null, text: "–" };
  }
  
  const mostRecent = new Date(Math.max(...modificationDates.map(d => d.getTime())));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  mostRecent.setHours(0, 0, 0, 0);
  
  const daysAgo = differenceInDays(today, mostRecent);
  
  if (daysAgo === 0) {
    return { daysAgo: 0, text: "Today" };
  } else if (daysAgo === 1) {
    return { daysAgo: 1, text: "1d ago" };
  } else {
    return { daysAgo, text: `${daysAgo}d ago` };
  }
};

// Get program status (active/pending/draft)
const getProgramStatus = (blocks: Block[]): { status: "active" | "pending" | "draft"; badge: React.ReactNode } => {
  const currentBlock = getCurrentBlock(blocks);
  
  if (!currentBlock) {
    // Check if there are any draft blocks
    const hasDraft = blocks.some(b => b.status === "draft");
    if (hasDraft) {
      return {
        status: "draft",
        badge: <Badge variant="outline" className="text-xs font-['Montserrat'] bg-amber-500/20 text-amber-400 border-amber-500/30">Draft</Badge>
      };
    }
    return {
      status: "pending",
      badge: <Badge variant="outline" className="text-xs font-['Montserrat'] bg-blue-500/20 text-blue-400 border-blue-500/30">Pending</Badge>
    };
  }
  
  if (currentBlock.status === "active") {
    return {
      status: "active",
      badge: <Badge variant="outline" className="text-xs font-['Montserrat'] bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
    };
  } else if (currentBlock.status === "draft") {
    return {
      status: "draft",
      badge: <Badge variant="outline" className="text-xs font-['Montserrat'] bg-amber-500/20 text-amber-400 border-amber-500/30">Draft</Badge>
    };
  }
  
  return {
    status: "pending",
    badge: <Badge variant="outline" className="text-xs font-['Montserrat'] bg-blue-500/20 text-blue-400 border-blue-500/30">Pending</Badge>
  };
};

// Check for pacing warning (submitting off-schedule)
const hasPacingWarning = (blocks: Block[]): boolean => {
  // Mock logic: check if last submission was more than 3 days ago for active blocks
  const currentBlock = getCurrentBlock(blocks);
  if (!currentBlock || !currentBlock.lastSubmission) {
    return false;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastSubmission = new Date(currentBlock.lastSubmission);
  lastSubmission.setHours(0, 0, 0, 0);
  
  const daysSinceSubmission = differenceInDays(today, lastSubmission);
  return daysSinceSubmission > 3;
};

// Get associated task count (mock for now)
const getTaskCount = (athleteId: string): number => {
  // Mock: return random task count for demonstration
  const mockCounts: { [key: string]: number } = {
    'athlete-1': 2,
    'athlete-2': 0,
    'athlete-3': 1,
    'athlete-4': 3,
    'athlete-5': 0,
  };
  return mockCounts[athleteId] || 0;
};

// Check if item needs attention (actionable)
const needsAttention = (blocks: Block[], athleteId: string, tabView: TabView): boolean => {
  if (tabView === "pending") {
    // Pending items always need attention
    return true;
  }
  
  // Check for overdue next block due
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const hasOverdue = blocks.some(block => {
    if (!block.nextBlockDue) return false;
    const dueDate = new Date(block.nextBlockDue);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  });
  
  // Check for pacing warning
  const pacingWarning = hasPacingWarning(blocks);
  
  // Check for tasks
  const taskCount = getTaskCount(athleteId);
  
  return hasOverdue || pacingWarning || taskCount > 0;
};

export default function Programs() {
  const [, setLocation] = useLocation();
  const [tabView, setTabView] = useState<TabView>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("athleteName");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [hoveredSortField, setHoveredSortField] = useState<SortField | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    athleteStatuses: [],
    blockStatuses: [],
    seasons: [],
    subSeasons: [],
    urgency: [],
    nextBlockDueStart: "",
    nextBlockDueEnd: "",
    lastActivityStart: "",
    lastActivityEnd: "",
  });

  // Hardcoded athletes data (to avoid API calls)
  const hardcodedAthletes: AthleteWithPhase[] = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysAgo = (days: number) => {
      const date = new Date(today);
      date.setDate(date.getDate() - days);
      return date.toISOString().split('T')[0];
    };
    const daysFromNow = (days: number) => {
      const date = new Date(today);
      date.setDate(date.getDate() + days);
      return date.toISOString().split('T')[0];
    };

    return [
      {
        athlete: {
          id: "athlete-1",
          name: "Marcus Johnson",
          status: null,
          currentPhaseId: "phase-athlete-1",
        },
        currentPhase: {
          id: "phase-athlete-1",
          athleteId: "athlete-1",
          phaseNumber: 1,
          startDate: daysAgo(60),
          endDate: daysFromNow(30),
          status: "active",
        },
        blocks: [
          {
            id: "block-1-1",
            athleteId: "athlete-1",
            phaseId: "phase-athlete-1",
            blockNumber: 1,
            name: "Pre-Season Block 1",
            startDate: daysAgo(60),
            endDate: daysAgo(32),
            duration: 4,
            season: "Pre-Season",
            subSeason: "Early",
            status: "complete",
            createdAt: daysAgo(65),
            updatedAt: daysAgo(32),
          },
          {
            id: "block-1-2",
            athleteId: "athlete-1",
            phaseId: "phase-athlete-1",
            blockNumber: 2,
            name: "Pre-Season Block 2",
            startDate: daysAgo(32),
            endDate: daysFromNow(2),
            duration: 5,
            season: "Pre-Season",
            subSeason: "Mid",
            status: "active",
            createdAt: daysAgo(35),
            updatedAt: daysAgo(1),
            lastModification: daysAgo(1),
            lastSubmission: daysAgo(2),
            nextBlockDue: daysFromNow(5),
          },
        ],
      },
      {
        athlete: {
          id: "athlete-2",
          name: "Michael Chen",
          status: null,
          currentPhaseId: "phase-athlete-2",
        },
        currentPhase: {
          id: "phase-athlete-2",
          athleteId: "athlete-2",
          phaseNumber: 1,
          startDate: daysAgo(90),
          endDate: daysFromNow(60),
          status: "active",
        },
        blocks: [
          {
            id: "block-2-1",
            athleteId: "athlete-2",
            phaseId: "phase-athlete-2",
            blockNumber: 1,
            name: "In-Season Block 1",
            startDate: daysAgo(90),
            endDate: daysAgo(62),
            duration: 4,
            season: "In-Season",
            subSeason: "Early",
            status: "complete",
            createdAt: daysAgo(95),
            updatedAt: daysAgo(62),
          },
          {
            id: "block-2-2",
            athleteId: "athlete-2",
            phaseId: "phase-athlete-2",
            blockNumber: 2,
            name: "In-Season Block 2",
            startDate: daysAgo(62),
            endDate: daysFromNow(2),
            duration: 9,
            season: "In-Season",
            subSeason: "Mid",
            status: "active",
            createdAt: daysAgo(65),
            updatedAt: daysAgo(1),
            lastModification: daysAgo(1),
            lastSubmission: daysAgo(1),
            nextBlockDue: daysFromNow(10),
          },
        ],
      },
      {
        athlete: {
          id: "athlete-3",
          name: "Alexander Rodriguez",
          status: "rehabbing",
          currentPhaseId: "phase-athlete-3",
        },
        currentPhase: {
          id: "phase-athlete-3",
          athleteId: "athlete-3",
          phaseNumber: 1,
          startDate: daysAgo(45),
          endDate: daysFromNow(45),
          status: "active",
        },
        blocks: [
          {
            id: "block-3-1",
            athleteId: "athlete-3",
            phaseId: "phase-athlete-3",
            blockNumber: 1,
            name: "Off-Season Block 1",
            startDate: daysAgo(45),
            endDate: daysFromNow(5),
            duration: 7,
            season: "Off-Season",
            subSeason: "Late",
            status: "active",
            createdAt: daysAgo(48),
            updatedAt: daysAgo(1),
            lastModification: daysAgo(1),
            lastSubmission: daysAgo(5),
            nextBlockDue: daysFromNow(3),
          },
        ],
      },
      {
        athlete: {
          id: "athlete-4",
          name: "James Williams",
          status: "lingering-issues",
          currentPhaseId: "phase-athlete-4",
        },
        currentPhase: {
          id: "phase-athlete-4",
          athleteId: "athlete-4",
          phaseNumber: 1,
          startDate: daysAgo(120),
          endDate: daysFromNow(30),
          status: "active",
        },
        blocks: [
          {
            id: "block-4-1",
            athleteId: "athlete-4",
            phaseId: "phase-athlete-4",
            blockNumber: 1,
            name: "Pre-Season Block 1",
            startDate: daysAgo(120),
            endDate: daysAgo(92),
            duration: 4,
            season: "Pre-Season",
            subSeason: "Early",
            status: "complete",
            createdAt: daysAgo(125),
            updatedAt: daysAgo(92),
          },
          {
            id: "block-4-2",
            athleteId: "athlete-4",
            phaseId: "phase-athlete-4",
            blockNumber: 2,
            name: "Pre-Season Block 2",
            startDate: daysAgo(62),
            endDate: daysFromNow(36),
            duration: 14,
            season: "Pre-Season",
            subSeason: "Mid",
            status: "active",
            createdAt: daysAgo(65),
            updatedAt: daysAgo(1),
            lastModification: daysAgo(1),
            lastSubmission: daysAgo(4),
            nextBlockDue: daysFromNow(15),
          },
        ],
      },
      {
        athlete: {
          id: "athlete-5",
          name: "Ryan Martinez",
          status: null,
          currentPhaseId: "phase-athlete-5",
        },
        currentPhase: {
          id: "phase-athlete-5",
          athleteId: "athlete-5",
          phaseNumber: 1,
          startDate: daysAgo(30),
          endDate: daysFromNow(60),
          status: "active",
        },
        blocks: [
          {
            id: "block-5-1",
            athleteId: "athlete-5",
            phaseId: "phase-athlete-5",
            blockNumber: 1,
            name: "In-Season Block 1",
            startDate: daysAgo(30),
            endDate: daysFromNow(0),
            duration: 4,
            season: "In-Season",
            subSeason: "Early",
            status: "active",
            createdAt: daysAgo(35),
            updatedAt: daysAgo(1),
            lastModification: daysAgo(1),
            lastSubmission: daysAgo(0),
            nextBlockDue: daysFromNow(7),
          },
        ],
      },
    ];
  }, []);

  // Use hardcoded data instead of API
  const athletesData = hardcodedAthletes;
  const isLoading = false;

  // Filter and sort athletes
  const filteredAndSortedAthletes = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = athletesData.filter((athleteData) => {
      const { athlete, blocks } = athleteData;

      // Filter by search query (athlete name only)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!athlete.name.toLowerCase().includes(query)) return false;
      }

      // Filter by athlete status
      if (filters.athleteStatuses.length > 0) {
        if (!athlete.status || !filters.athleteStatuses.includes(athlete.status)) return false;
      }

      // Filter by tab view
      if (tabView === "pending") {
        // Pending: Actionable items requiring review/attention today
        // Items with overdue nextBlockDue, pacing warnings, or tasks
        const hasOverdue = blocks.some(block => {
          if (!block.nextBlockDue) return false;
          const dueDate = new Date(block.nextBlockDue);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate <= today;
        });
        const pacingWarning = hasPacingWarning(blocks);
        const taskCount = getTaskCount(athlete.id);
        
        if (!hasOverdue && !pacingWarning && taskCount === 0) return false;
      } else if (tabView === "current") {
        // Current: Live, reviewed programs (active blocks)
        const hasActiveBlock = blocks.some(block => {
          const endDate = new Date(block.endDate);
          endDate.setHours(0, 0, 0, 0);
          return block.status === "active" && endDate >= today;
        });
        if (!hasActiveBlock) return false;
      } else if (tabView === "upcoming") {
        // Upcoming: Unpublished programs waiting on athlete info (draft/planned blocks)
        const hasDraftOrPlanned = blocks.some(block => 
          block.status === "draft" || block.status === "planned"
        );
        if (!hasDraftOrPlanned) return false;
      }

      // Filter by block status - check if ANY block matches
      if (filters.blockStatuses.length > 0) {
        const hasMatchingStatus = blocks.some(block => 
          filters.blockStatuses.includes(block.status)
        );
        if (!hasMatchingStatus) return false;
      }

      // Filter by season - check if ANY block matches
      if (filters.seasons.length > 0) {
        const hasMatchingSeason = blocks.some(block => 
          filters.seasons.includes(block.season)
        );
        if (!hasMatchingSeason) return false;
      }

      // Filter by sub-season - check if ANY block matches
      if (filters.subSeasons.length > 0) {
        const hasMatchingSubSeason = blocks.some(block => 
          block.subSeason && filters.subSeasons.includes(block.subSeason)
        );
        if (!hasMatchingSubSeason) return false;
      }

      // Filter by last activity
      if (filters.lastActivityStart || filters.lastActivityEnd) {
        const hasMatchingActivity = blocks.some(block => {
          const activityDates: Date[] = [];
          if (block.lastModification) {
            activityDates.push(new Date(block.lastModification));
          }
          if (block.lastSubmission) {
            activityDates.push(new Date(block.lastSubmission));
          }
          
          if (activityDates.length === 0) return false;
          
          const mostRecentActivity = new Date(Math.max(...activityDates.map(d => d.getTime())));
          mostRecentActivity.setHours(0, 0, 0, 0);
          
          if (filters.lastActivityStart) {
            const filterStart = new Date(filters.lastActivityStart);
            filterStart.setHours(0, 0, 0, 0);
            if (mostRecentActivity < filterStart) return false;
          }
          if (filters.lastActivityEnd) {
            const filterEnd = new Date(filters.lastActivityEnd);
            filterEnd.setHours(23, 59, 59, 999);
            if (mostRecentActivity > filterEnd) return false;
          }
          return true;
        });
        if (!hasMatchingActivity) return false;
      }

      // Filter by next block due
      if (filters.nextBlockDueStart || filters.nextBlockDueEnd) {
        const hasMatchingBlock = blocks.some(block => {
          if (!block.nextBlockDue) return false;
          const dueDate = new Date(block.nextBlockDue);
          dueDate.setHours(0, 0, 0, 0);
          if (filters.nextBlockDueStart) {
            const filterStart = new Date(filters.nextBlockDueStart);
            filterStart.setHours(0, 0, 0, 0);
            if (dueDate < filterStart) return false;
          }
          if (filters.nextBlockDueEnd) {
            const filterEnd = new Date(filters.nextBlockDueEnd);
            filterEnd.setHours(23, 59, 59, 999);
            if (dueDate > filterEnd) return false;
          }
          return true;
        });
        if (!hasMatchingBlock) return false;
      }

      // Filter by urgency
      if (filters.urgency.length > 0) {
        const hasMatchingUrgency = filters.urgency.some(urgencyType => {
          if (urgencyType === "no-active-block") {
            const hasActiveBlock = blocks.some(block => block.status === "active");
            return !hasActiveBlock;
          }
          
          const matchingBlocks = blocks.filter(block => {
            if (!block.nextBlockDue) return false;
            const dueDate = new Date(block.nextBlockDue);
            dueDate.setHours(0, 0, 0, 0);
            const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            if (urgencyType === "overdue") {
              return daysDiff < 0;
            } else if (urgencyType === "due-this-week") {
              return daysDiff >= 0 && daysDiff <= 7;
            }
            return false;
          });
          
          return matchingBlocks.length > 0;
        });
        if (!hasMatchingUrgency) return false;
      }

      return true;
    });

    // Sort athletes
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "athleteName":
          aValue = a.athlete.name;
          bValue = b.athlete.name;
          break;
        case "subSeason": {
          const aBlock = getCurrentBlock(a.blocks);
          const bBlock = getCurrentBlock(b.blocks);
          aValue = aBlock?.subSeason || "";
          bValue = bBlock?.subSeason || "";
          break;
        }
        case "blockProgress": {
          const aProgress = getBlockProgress(a.blocks);
          const bProgress = getBlockProgress(b.blocks);
          aValue = aProgress.daysRemaining ?? Number.MAX_SAFE_INTEGER;
          bValue = bProgress.daysRemaining ?? Number.MAX_SAFE_INTEGER;
          break;
        }
        case "programStatus": {
          const aStatus = getProgramStatus(a.blocks);
          const bStatus = getProgramStatus(b.blocks);
          const statusOrder = { "active": 1, "pending": 2, "draft": 3 };
          aValue = statusOrder[aStatus.status] || 0;
          bValue = statusOrder[bStatus.status] || 0;
          break;
        }
        case "lastEntryDay": {
          const aEntry = getLastEntryDay(a.blocks);
          const bEntry = getLastEntryDay(b.blocks);
          aValue = aEntry.daysAgo ?? Number.MAX_SAFE_INTEGER;
          bValue = bEntry.daysAgo ?? Number.MAX_SAFE_INTEGER;
          break;
        }
        case "lastModificationDay": {
          const aMod = getLastModificationDay(a.blocks);
          const bMod = getLastModificationDay(b.blocks);
          aValue = aMod.daysAgo ?? Number.MAX_SAFE_INTEGER;
          bValue = bMod.daysAgo ?? Number.MAX_SAFE_INTEGER;
          break;
        }
        default:
          return 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
    });

    return filtered;
  }, [athletesData, tabView, searchQuery, sortField, sortDirection, filters]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField, isHovered: boolean = false) => {
    if (!isHovered && sortField !== field) return null;
    
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 text-[#bcbbb7]" />;
    }
    return sortDirection === "asc" ? 
      <ArrowUp className="w-4 h-4 ml-1 text-[#bcbbb7]" /> : 
      <ArrowDown className="w-4 h-4 ml-1 text-[#bcbbb7]" />;
  };

  const handleAthleteStatusToggle = (status: string) => {
    setFilters(prev => ({
      ...prev,
      athleteStatuses: prev.athleteStatuses.includes(status)
        ? prev.athleteStatuses.filter(s => s !== status)
        : [...prev.athleteStatuses, status]
    }));
  };

  const handleSeasonToggle = (season: string) => {
    setFilters(prev => ({
      ...prev,
      seasons: prev.seasons.includes(season)
        ? prev.seasons.filter(s => s !== season)
        : [...prev.seasons, season]
    }));
  };

  const handleSubSeasonToggle = (subSeason: string) => {
    setFilters(prev => ({
      ...prev,
      subSeasons: prev.subSeasons.includes(subSeason)
        ? prev.subSeasons.filter(s => s !== subSeason)
        : [...prev.subSeasons, subSeason]
    }));
  };

  const handleBlockStatusToggle = (blockStatus: string) => {
    setFilters(prev => ({
      ...prev,
      blockStatuses: prev.blockStatuses.includes(blockStatus)
        ? prev.blockStatuses.filter(s => s !== blockStatus)
        : [...prev.blockStatuses, blockStatus]
    }));
  };

  const handleUrgencyToggle = (urgency: string) => {
    setFilters(prev => ({
      ...prev,
      urgency: prev.urgency.includes(urgency)
        ? prev.urgency.filter(u => u !== urgency)
        : [...prev.urgency, urgency]
    }));
  };

  const clearFilters = () => {
    setFilters({
      athleteStatuses: [],
      blockStatuses: [],
      seasons: [],
      subSeasons: [],
      urgency: [],
      nextBlockDueStart: "",
      nextBlockDueEnd: "",
      lastActivityStart: "",
      lastActivityEnd: "",
    });
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.athleteStatuses.length > 0 ||
      filters.blockStatuses.length > 0 ||
      filters.seasons.length > 0 ||
      filters.subSeasons.length > 0 ||
      filters.urgency.length > 0 ||
      filters.nextBlockDueStart ||
      filters.nextBlockDueEnd ||
      filters.lastActivityStart ||
      filters.lastActivityEnd
    );
  }, [filters]);

  return (
    <div className="min-h-screen bg-surface-base">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-semibold text-[#f7f6f2] font-['Montserrat'] leading-[1.32]">
              Programs
            </h1>
            <Tabs value={tabView} onValueChange={(value) => setTabView(value as TabView)}>
              <TabsList className="inline-flex h-10 items-center justify-center rounded-full border border-[#292928] p-0.5 bg-[#171716]">
                <TabsTrigger 
                  value="pending" 
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-['Montserrat'] transition-all",
                    "data-[state=active]:bg-[#1C1C1B] data-[state=active]:text-[#f7f6f2]",
                    "data-[state=inactive]:text-[#979795]"
                  )}
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger 
                  value="current"
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-['Montserrat'] transition-all",
                    "data-[state=active]:bg-[#1C1C1B] data-[state=active]:text-[#f7f6f2]",
                    "data-[state=inactive]:text-[#979795]"
                  )}
                >
                  Current
                </TabsTrigger>
                <TabsTrigger 
                  value="upcoming"
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-['Montserrat'] transition-all",
                    "data-[state=active]:bg-[#1C1C1B] data-[state=active]:text-[#f7f6f2]",
                    "data-[state=inactive]:text-[#979795]"
                  )}
                >
                  Upcoming
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-[337px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#979795] pointer-events-none" />
              <Input
                type="text"
                placeholder="Search by athlete name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 px-3 rounded-full border-[#292928] bg-surface-base text-[#979795] hover:bg-[#1a1a19] font-['Montserrat']",
                hasActiveFilters && "border-primary"
              )}
              onClick={() => setFilterSheetOpen(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              <span className="text-xs font-['Montserrat']">Filters</span>
              {hasActiveFilters && (
                <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-primary"></span>
              )}
            </Button>
          </div>
        </div>

        {/* Table Content */}
        <div className="px-5 pb-5 bg-surface-base">
          {isLoading ? (
            <div className="border border-[#292928] rounded-lg overflow-hidden w-full bg-surface-base">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="border-b border-[#292928] last:border-b-0">
                  <div className="flex items-center gap-4 px-5 py-3">
                    <Skeleton className="w-8 h-8 rounded-full bg-[#171716]" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32 bg-[#171716]" />
                      <Skeleton className="h-3 w-24 bg-[#171716]" />
                    </div>
                    <Skeleton className="h-4 w-4 rounded bg-[#171716]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedAthletes.length === 0 ? (
            <div className="border border-[#292928] rounded-lg bg-surface-base p-12">
              <div className="text-center max-w-md mx-auto">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#171716] flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-[#979795]" />
                  </div>
                  <h3 className="text-lg font-semibold font-['Montserrat'] text-[#f7f6f2] mb-2">
                    No {tabView === "pending" ? "pending" : tabView === "current" ? "current" : "upcoming"} athletes found
                  </h3>
                  <p className="text-sm font-['Montserrat'] text-[#979795] mb-6">
                    {hasActiveFilters 
                      ? "Try adjusting your filters to see more results."
                      : "Use filters or go to an athlete to create the first block."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full overflow-x-auto scrollbar-thin">
              <div className="bg-[#121210] rounded-2xl overflow-hidden relative" style={{ minWidth: '1500px' }}>
                {/* Table Header */}
                <div className="flex h-10 bg-[#121210] text-[#bcbbb7] text-xs font-medium relative">
                  {/* Athlete Name Column */}
                  <div className="flex items-center pl-[8px] pr-[16px] w-[300px] min-w-[300px] flex-shrink-0 border-r border-[#292928]">
                    <button 
                      onClick={() => handleSort('athleteName')}
                      onMouseEnter={() => setHoveredSortField('athleteName')}
                      onMouseLeave={() => setHoveredSortField(null)}
                      className="flex gap-[4px] items-center flex-1 hover:text-[#f7f6f2] transition-colors pl-[16px]"
                    >
                      <span className="font-['Montserrat:Medium',_sans-serif] text-[12px] leading-[1.32] text-[#bcbbb7] whitespace-nowrap overflow-hidden text-ellipsis">
                        Athlete
                      </span>
                      {getSortIcon('athleteName', hoveredSortField === 'athleteName' || sortField === 'athleteName')}
                    </button>
                  </div>

                  {/* Scrollable Columns Header */}
                  <div className="flex items-center h-full" style={{ minWidth: '1200px' }}>
                    {/* Sub-Season Status */}
                    <div className="flex items-center pl-4 pr-0 w-[180px] min-w-[180px]">
                      <button 
                        onClick={() => handleSort('subSeason')}
                        onMouseEnter={() => setHoveredSortField('subSeason')}
                        onMouseLeave={() => setHoveredSortField(null)}
                        className="flex items-center gap-1 hover:text-[#f7f6f2] transition-colors"
                      >
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">Sub-Season</span>
                        {getSortIcon('subSeason', hoveredSortField === 'subSeason' || sortField === 'subSeason')}
                      </button>
                    </div>

                    {/* Block Progress */}
                    <div className="flex items-center pl-4 pr-0 w-[150px] min-w-[150px]">
                      <button 
                        onClick={() => handleSort('blockProgress')}
                        onMouseEnter={() => setHoveredSortField('blockProgress')}
                        onMouseLeave={() => setHoveredSortField(null)}
                        className="flex items-center gap-1 hover:text-[#f7f6f2] transition-colors"
                      >
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">Block Progress</span>
                        {getSortIcon('blockProgress', hoveredSortField === 'blockProgress' || sortField === 'blockProgress')}
                      </button>
                    </div>

                    {/* Program Status */}
                    <div className="flex items-center pl-4 pr-0 w-[150px] min-w-[150px]">
                      <button 
                        onClick={() => handleSort('programStatus')}
                        onMouseEnter={() => setHoveredSortField('programStatus')}
                        onMouseLeave={() => setHoveredSortField(null)}
                        className="flex items-center gap-1 hover:text-[#f7f6f2] transition-colors"
                      >
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">Program Status</span>
                        {getSortIcon('programStatus', hoveredSortField === 'programStatus' || sortField === 'programStatus')}
                      </button>
                    </div>

                    {/* Last Entry Day */}
                    <div className="flex items-center pl-4 pr-0 w-[150px] min-w-[150px]">
                      <button 
                        onClick={() => handleSort('lastEntryDay')}
                        onMouseEnter={() => setHoveredSortField('lastEntryDay')}
                        onMouseLeave={() => setHoveredSortField(null)}
                        className="flex items-center gap-1 hover:text-[#f7f6f2] transition-colors"
                      >
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">Last Entry</span>
                        {getSortIcon('lastEntryDay', hoveredSortField === 'lastEntryDay' || sortField === 'lastEntryDay')}
                      </button>
                    </div>

                    {/* Most Recent Modification */}
                    <div className="flex items-center pl-4 pr-0 w-[180px] min-w-[180px]">
                      <button 
                        onClick={() => handleSort('lastModificationDay')}
                        onMouseEnter={() => setHoveredSortField('lastModificationDay')}
                        onMouseLeave={() => setHoveredSortField(null)}
                        className="flex items-center gap-1 hover:text-[#f7f6f2] transition-colors"
                      >
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">Last Modified</span>
                        {getSortIcon('lastModificationDay', hoveredSortField === 'lastModificationDay' || sortField === 'lastModificationDay')}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-center pl-4 pr-0 w-[150px] min-w-[150px]">
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis">Actions</span>
                    </div>
                  </div>
                </div>

                {/* Table Body */}
                <div>
                  {filteredAndSortedAthletes.map((athleteData) => {
                    const currentBlock = getCurrentBlock(athleteData.blocks);
                    const nextAction = getNextAction(athleteData.blocks);
                    const lastActivity = getLastActivity(athleteData.blocks);
                    const statusIcon = getStatusIcon(athleteData.athlete.status);
                    const statusTooltip = getStatusTooltip(athleteData.athlete.status);

                    return (
                      <div
                        key={athleteData.athlete.id}
                        className="group flex items-center border-b border-[#292928] h-12 bg-[#1C1C1B] hover:bg-[#2C2C2B] transition-colors cursor-pointer"
                        onClick={() => setLocation(`/programs/${athleteData.athlete.id}`)}
                      >
                        {/* Athlete Name Column */}
                        <div className="flex gap-[8px] items-center pl-[8px] pr-[16px] py-0 w-[300px] min-w-[300px] flex-shrink-0 border-r border-[#292928]">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {statusIcon && (
                              <TooltipProvider>
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
                              </TooltipProvider>
                            )}
                            <Avatar className={cn("h-8 w-8 flex-shrink-0", getAvatarBorderClass(athleteData.athlete.status))}>
                              <AvatarImage src={athleteData.athlete.photo} alt={athleteData.athlete.name} />
                              <AvatarFallback className="bg-[#292928] text-[#f7f6f2] text-xs font-['Montserrat']">
                                {athleteData.athlete.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-['Montserrat:SemiBold',_sans-serif] text-[14px] text-[#f7f6f2] truncate">
                              {athleteData.athlete.name}
                            </span>
                          </div>
                        </div>

                        {/* Scrollable Columns */}
                        <div className="flex items-center h-full" style={{ minWidth: '1200px' }}>
                          {/* Sub-Season Status */}
                          <div className="flex items-center pl-4 pr-0 w-[180px] min-w-[180px]">
                            {currentBlock ? (
                              <Badge variant="outline" className={cn("text-xs font-['Montserrat']", getSeasonBadgeStyle(currentBlock.season))}>
                                {currentBlock.subSeason || currentBlock.season || "–"}
                              </Badge>
                            ) : (
                              <span className="text-[#979795] text-sm">–</span>
                            )}
                          </div>

                          {/* Block Progress */}
                          <div className="flex items-center pl-4 pr-0 w-[150px] min-w-[150px]">
                            {(() => {
                              const progress = getBlockProgress(athleteData.blocks);
                              return (
                                <span className={cn(
                                  "text-sm",
                                  progress.daysRemaining !== null && progress.daysRemaining <= 7 ? "text-red-500" : 
                                  progress.daysRemaining !== null && progress.daysRemaining <= 14 ? "text-amber-500" : 
                                  "text-[#979795]"
                                )}>
                                  {progress.text}
                                </span>
                              );
                            })()}
                          </div>

                          {/* Program Status */}
                          <div className="flex items-center pl-4 pr-0 w-[150px] min-w-[150px]">
                            {getProgramStatus(athleteData.blocks).badge}
                          </div>

                          {/* Last Entry Day */}
                          <div className="flex items-center pl-4 pr-0 w-[150px] min-w-[150px]">
                            {(() => {
                              const lastEntry = getLastEntryDay(athleteData.blocks);
                              const pacingWarning = hasPacingWarning(athleteData.blocks);
                              return (
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "text-sm",
                                    lastEntry.daysAgo !== null && lastEntry.daysAgo > 3 ? "text-amber-500" : "text-[#979795]"
                                  )}>
                                    {lastEntry.text}
                                  </span>
                                  {pacingWarning && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertCircle className="h-4 w-4 text-amber-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Pacing warning: Submitting off-schedule</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                              );
                            })()}
                          </div>

                          {/* Most Recent Modification */}
                          <div className="flex items-center pl-4 pr-0 w-[180px] min-w-[180px]">
                            {getLastModificationDay(athleteData.blocks).text}
                          </div>

                          {/* Actions with Indicators */}
                          <div className="flex items-center justify-center gap-2 pl-4 pr-0 w-[150px] min-w-[150px]">
                            {(() => {
                              const taskCount = getTaskCount(athleteData.athlete.id);
                              const needsAttn = needsAttention(athleteData.blocks, athleteData.athlete.id, tabView);
                              
                              return (
                                <>
                                  {needsAttn && (
                                    <div className="flex items-center gap-1">
                                      {taskCount > 0 && (
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold">
                                                {taskCount}
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>{taskCount} associated task{taskCount !== 1 ? 's' : ''}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      )}
                                      {(!taskCount || taskCount === 0) && (
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Circle className="h-4 w-4 text-red-500 fill-red-500" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Requires attention</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      )}
                                    </div>
                                  )}
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLocation(`/programs/${athleteData.athlete.id}`);
                                    }}
                                  >
                                    Program
                                  </Button>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Sheet */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="right" className="h-full flex flex-col bg-surface-base border-l border-[#292928] w-full sm:max-w-md p-0">
          <SheetHeader className="border-b border-[#292928] pb-4 px-6 pt-6 flex-shrink-0">
            <SheetTitle className="text-xl font-['Montserrat'] text-[#f7f6f2]">Filters</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            {/* Athlete Status */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold font-['Montserrat'] text-[#f7f6f2]">Athlete status</Label>
              <div className="flex flex-wrap gap-4">
                {STATUS_OPTIONS.map((statusOption) => (
                  <div key={statusOption.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`athlete-status-${statusOption.value}`}
                      checked={filters.athleteStatuses.includes(statusOption.value)}
                      onCheckedChange={() => handleAthleteStatusToggle(statusOption.value)}
                    />
                    <Label
                      htmlFor={`athlete-status-${statusOption.value}`}
                      className="text-sm font-['Montserrat'] text-[#f7f6f2] cursor-pointer"
                    >
                      {statusOption.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Block Status */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold font-['Montserrat'] text-[#f7f6f2]">Block status</Label>
              <div className="flex flex-wrap gap-4">
                {BLOCK_STATUS_OPTIONS.map((statusOption) => (
                  <div key={statusOption.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`block-status-${statusOption.value}`}
                      checked={filters.blockStatuses.includes(statusOption.value)}
                      onCheckedChange={() => handleBlockStatusToggle(statusOption.value)}
                    />
                    <Label
                      htmlFor={`block-status-${statusOption.value}`}
                      className="text-sm font-['Montserrat'] text-[#f7f6f2] cursor-pointer"
                    >
                      {statusOption.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Season */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold font-['Montserrat'] text-[#f7f6f2]">Season</Label>
              <div className="flex flex-wrap gap-4">
                {SEASON_OPTIONS.map((season) => (
                  <div key={season} className="flex items-center space-x-2">
                    <Checkbox
                      id={`season-${season}`}
                      checked={filters.seasons.includes(season)}
                      onCheckedChange={() => handleSeasonToggle(season)}
                    />
                    <Label
                      htmlFor={`season-${season}`}
                      className="text-sm font-['Montserrat'] text-[#f7f6f2] cursor-pointer"
                    >
                      {season}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-Season */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold font-['Montserrat'] text-[#f7f6f2]">Sub-season</Label>
              <div className="flex flex-wrap gap-4">
                {SUB_SEASON_OPTIONS.map((subSeason) => (
                  <div key={subSeason} className="flex items-center space-x-2">
                    <Checkbox
                      id={`subseason-${subSeason}`}
                      checked={filters.subSeasons.includes(subSeason)}
                      onCheckedChange={() => handleSubSeasonToggle(subSeason)}
                    />
                    <Label
                      htmlFor={`subseason-${subSeason}`}
                      className="text-sm font-['Montserrat'] text-[#f7f6f2] cursor-pointer"
                    >
                      {subSeason}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Urgency */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold font-['Montserrat'] text-[#f7f6f2]">Urgency</Label>
              <div className="flex flex-wrap gap-4">
                {URGENCY_OPTIONS.map((urgencyOption) => (
                  <div key={urgencyOption.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`urgency-${urgencyOption.value}`}
                      checked={filters.urgency.includes(urgencyOption.value)}
                      onCheckedChange={() => handleUrgencyToggle(urgencyOption.value)}
                    />
                    <Label
                      htmlFor={`urgency-${urgencyOption.value}`}
                      className="text-sm font-['Montserrat'] text-[#f7f6f2] cursor-pointer"
                    >
                      {urgencyOption.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Last Activity */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold font-['Montserrat'] text-[#f7f6f2]">Last activity</Label>
              <p className="text-xs text-[#979795] font-['Montserrat']">Any coach modification or athlete submission</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-['Montserrat'] text-[#979795]">Start date</Label>
                  <Input
                    type="date"
                    value={filters.lastActivityStart}
                    onChange={(e) => setFilters(prev => ({ ...prev, lastActivityStart: e.target.value }))}
                    className="bg-[#171716] border-[#292928] text-[#f7f6f2] font-['Montserrat']"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-['Montserrat'] text-[#979795]">End date</Label>
                  <Input
                    type="date"
                    value={filters.lastActivityEnd}
                    onChange={(e) => setFilters(prev => ({ ...prev, lastActivityEnd: e.target.value }))}
                    className="bg-[#171716] border-[#292928] text-[#f7f6f2] font-['Montserrat']"
                  />
                </div>
              </div>
            </div>

            {/* Next Block Due */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold font-['Montserrat'] text-[#f7f6f2]">Next block due</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-['Montserrat'] text-[#979795]">Start date</Label>
                  <Input
                    type="date"
                    value={filters.nextBlockDueStart}
                    onChange={(e) => setFilters(prev => ({ ...prev, nextBlockDueStart: e.target.value }))}
                    className="bg-[#171716] border-[#292928] text-[#f7f6f2] font-['Montserrat']"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-['Montserrat'] text-[#979795]">End date</Label>
                  <Input
                    type="date"
                    value={filters.nextBlockDueEnd}
                    onChange={(e) => setFilters(prev => ({ ...prev, nextBlockDueEnd: e.target.value }))}
                    className="bg-[#171716] border-[#292928] text-[#f7f6f2] font-['Montserrat']"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer Actions */}
          <div className="flex items-center justify-between pt-4 pb-6 px-6 border-t border-[#292928] flex-shrink-0 bg-surface-base">
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-[#979795] hover:text-[#f7f6f2] font-['Montserrat']"
              disabled={!hasActiveFilters}
            >
              Clear all
            </Button>
            <Button
              onClick={() => setFilterSheetOpen(false)}
              className="bg-[#e5e4e1] text-black hover:bg-[#d5d4d1] font-['Montserrat']"
            >
              Apply filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
