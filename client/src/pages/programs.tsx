import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle, Activity, AlertCircle, Circle, ChevronRight, ChevronDown, List, Calendar, MoreVertical, CheckCircle2, Hammer, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type AthleteWithPhase, type Block } from "@shared/schema";
import ProgramsTimelineView from "@/components/ProgramsTimelineView";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Target, Dumbbell } from "lucide-react";

type TabView = "all" | "open" | "pending" | "upcoming";
type SortField = "athleteName" | "team" | "subSeasonStatus" | "blockProgress" | "programStatus" | "lastEntryDay" | "lastModificationDay";
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
  switch (status) {
    case "injured":
      return (
        <div className="p-1.5 rounded-full">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
      );
    case "rehabbing":
      return (
        <div className="p-1.5 rounded-full">
          <Activity className="h-5 w-5 text-blue-500" />
        </div>
      );
    case "lingering-issues":
      return (
        <div className="p-1.5 rounded-full">
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
  // Uniform gray border for all avatars
  return "ring-1 ring-[#292928]";
};

const getSeasonBadgeStyle = (season?: string | null): string => {
  const s = (season || "").toLowerCase();
  if (s.includes("in") && s.includes("season")) return "bg-[#292928] text-[#f7f6f2] border-[#292928]";
  if (s.includes("pre")) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  if (s.includes("post")) return "bg-purple-500/20 text-purple-400 border-purple-500/30";
  if (s.includes("off")) return "bg-[#171716] text-[#979795] border-[#292928]";
  return "bg-[#171716] text-[#979795] border-[#292928]";
};

// Get sub-season abbreviation
const getSubSeasonAbbreviation = (subSeason?: string | null, season?: string | null): string => {
  if (!subSeason) return "";
  
  const sub = (subSeason || "").trim().toLowerCase();
  const main = (season || "").trim().toLowerCase();
  
  // Off-Season abbreviations
  if (main.includes("off")) {
    if (sub.includes("early")) return "EOS";
    if (sub.includes("general") || sub.includes("gos")) return "GOS";
    if (sub.includes("late")) return "LOS";
  }
  
  // Pre-Season abbreviation
  if (main.includes("pre")) {
    return "PrS";
  }
  
  // In-Season abbreviations
  if (main.includes("in") && main.includes("season")) {
    if (sub.includes("early")) return "EIS";
    if (sub.includes("mid") || sub.includes("middle")) return "MIS";
    if (sub.includes("late")) return "LIS";
  }
  
  // Post-Season abbreviation
  if (main.includes("post")) {
    return "PoS";
  }
  
  return "";
};

const getSeasonDisplayText = (season?: string | null, subSeason?: string | null): string => {
  const main = (season || "").trim();
  const subAbbr = getSubSeasonAbbreviation(subSeason, season);
  if (main && subAbbr) return `${main} [${subAbbr}]`;
  return main || "Season";
};

const getBlockStatusBadge = (status: Block["status"]) => {
  const variants: Record<Exclude<Block["status"], undefined>, { label: string; className: string }> = {
    active: { label: "Active", className: "bg-[#292928] text-[#f7f6f2] border-[#292928]" },
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
const getBlockProgress = (blocks: Block[]): { daysRemaining: number | null; text: string; needsAction: boolean } => {
  const currentBlock = getCurrentBlock(blocks);
  if (!currentBlock) {
    return { daysRemaining: null, text: "–", needsAction: false };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(currentBlock.endDate);
  endDate.setHours(0, 0, 0, 0);
  
  const daysRemaining = differenceInDays(endDate, today);
  
  if (daysRemaining < 0) {
    return { daysRemaining: 0, text: "in 0 day(s)", needsAction: true };
  }
  
  const needsAction = daysRemaining <= 3;
  const text = daysRemaining === 1 ? "in 1 day" : `in ${daysRemaining} day(s)`;
  
  return { daysRemaining, text, needsAction };
};

// Get last entry day (days since athlete last submitted data)
const getLastEntryDay = (blocks: Block[]): { daysAgo: number | null; text: string; formattedDate: string | null } => {
  const submissionDates: Date[] = [];
  blocks.forEach(block => {
    if (block.lastSubmission) {
      submissionDates.push(new Date(block.lastSubmission));
    }
  });
  
  if (submissionDates.length === 0) {
    return { daysAgo: null, text: "–", formattedDate: null };
  }
  
  const mostRecent = new Date(Math.max(...submissionDates.map(d => d.getTime())));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const mostRecentDateOnly = new Date(mostRecent);
  mostRecentDateOnly.setHours(0, 0, 0, 0);
  
  const daysAgo = differenceInDays(today, mostRecentDateOnly);
  const formattedDate = format(mostRecent, "MMM d");
  
  if (daysAgo === 0) {
    // Show time with AM/PM for today's entries
    const timeStr = format(mostRecent, "h:mm a");
    return { daysAgo: 0, text: `Today ${timeStr}`, formattedDate: format(mostRecent, "MMM d") };
  } else if (daysAgo === 1) {
    return { daysAgo: 1, text: "1 day ago", formattedDate };
  } else {
    return { daysAgo, text: `${daysAgo} days ago`, formattedDate };
  }
};

// Get most recent modification day
const getLastModificationDay = (blocks: Block[]): { daysAgo: number | null; text: string; formattedDate: string | null; fullDateTime: string | null; blockId: string | null } => {
  const modificationDates: { date: Date; blockId: string }[] = [];
  blocks.forEach(block => {
    if (block.lastModification) {
      modificationDates.push({ date: new Date(block.lastModification), blockId: block.id });
    }
  });
  
  if (modificationDates.length === 0) {
    return { daysAgo: null, text: "–", formattedDate: null, fullDateTime: null, blockId: null };
  }
  
  const mostRecent = modificationDates.reduce((prev, current) => 
    current.date > prev.date ? current : prev
  );
  const formattedDate = format(mostRecent.date, "MMM d");
  const fullDateTime = format(mostRecent.date, "PPpp"); // Full date and time format (e.g., "January 1, 2024 at 12:00 PM")
  
  return { daysAgo: null, text: formattedDate, formattedDate, fullDateTime, blockId: mostRecent.blockId };
};

// Get sub-season status (In-Season or Off-Season)
const getSubSeasonStatus = (blocks: Block[]): string => {
  const currentBlock = getCurrentBlock(blocks);
  if (!currentBlock) return "–";
  
  const season = currentBlock.season || "";
  if (season.includes("In-Season")) {
    return "In-Season";
  } else if (season.includes("Off-Season")) {
    return "Off-Season";
  } else if (season.includes("Pre-Season")) {
    return "In-Season"; // Pre-Season is part of In-Season
  }
  return season || "–";
};

// Check if injury status is actionable (requires coach attention)
const isActionableInjury = (status?: "injured" | "rehabbing" | "lingering-issues" | null): boolean => {
  // All injury statuses are actionable
  return status !== null && status !== undefined;
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
      badge: <Badge variant="outline" className="text-xs font-['Montserrat'] bg-[#292928] text-[#f7f6f2] border-[#292928]">Active</Badge>
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

// Get program position in "P1 B3(4) W2 D2" format
const getProgramPosition = (blocks: Block[], currentPhase?: { phaseNumber: number }): string => {
  const currentBlock = getCurrentBlock(blocks);
  if (!currentBlock || !currentPhase) return "–";
  
  const totalBlocksInPhase = blocks.length;
  const phaseNum = currentPhase.phaseNumber;
  const blockNum = currentBlock.blockNumber;
  const week = currentBlock.currentDay?.week || 1;
  const day = currentBlock.currentDay?.day || 1;
  
  return `P${phaseNum} B${blockNum}(${totalBlocksInPhase}) W${week} D${day}`;
};

// Get today's session data (throwing/lifting with intensity)
const getTodaysSession = async (athleteId: string): Promise<{ throwing: string | null; lifting: string | null; throwingIntensity?: string; liftingIntensity?: string }> => {
  try {
    const response = await fetch(`/api/athletes/${athleteId}/today-session`);
    if (!response.ok) return { throwing: null, lifting: null };
    const data = await response.json();
    return {
      throwing: data.throwing ? data.throwing.type : null,
      lifting: data.lifting ? data.lifting.type : null,
      throwingIntensity: data.throwing?.intensity,
      liftingIntensity: data.lifting?.intensity,
    };
  } catch {
    return { throwing: null, lifting: null };
  }
};

// Get days until block end with color coding (text only, no badge)
const getDaysUntilBlockEnd = (blocks: Block[]): { days: number | null; text: string; colorClass: string } => {
  const progress = getBlockProgress(blocks);
  if (progress.daysRemaining === null) {
    return { days: null, text: "–", colorClass: "text-[#979795]" };
  }
  
  const days = progress.daysRemaining;
  let colorClass = "text-[#979795]"; // default (normal/on track)
  let text = "";
  
  if (days <= 0) {
    colorClass = "text-red-500"; // urgent/past due
    text = "Past Due";
  } else if (days <= 3) {
    colorClass = "text-yellow-500"; // warning/soon
    text = `In ${days} d`;
  } else if (days <= 7) {
    colorClass = "text-yellow-500"; // warning/soon
    text = `In ${days} d`;
  } else {
    colorClass = "text-[#979795]"; // normal/on track
    text = `In ${days} d`;
  }
  
  return {
    days,
    text,
    colorClass,
  };
};

// Get collaborators for an athlete
const getCollaborators = async (athleteId: string): Promise<Array<{ id: string; userId: string; permissionLevel: string }>> => {
  try {
    const response = await fetch(`/api/athletes/${athleteId}/collaborators`);
    if (!response.ok) {
      // Return mock data for now - at least 1-2 collaborators per athlete
      const mockUsers = ["Coach", "Trainer", "Physio", "Manager"];
      const mockLevels = ["read", "write", "admin"];
      const count = Math.floor(Math.random() * 2) + 1; // 1-2 collaborators
      return Array.from({ length: count }, (_, i) => ({
        id: `${athleteId}-collab-${i}`,
        userId: mockUsers[Math.floor(Math.random() * mockUsers.length)],
        permissionLevel: mockLevels[Math.floor(Math.random() * mockLevels.length)],
      }));
    }
    const data = await response.json();
    // If empty, return mock data
    if (data.length === 0) {
      const mockUsers = ["Coach", "Trainer", "Physio", "Manager"];
      const mockLevels = ["read", "write", "admin"];
      const count = Math.floor(Math.random() * 2) + 1;
      return Array.from({ length: count }, (_, i) => ({
        id: `${athleteId}-collab-${i}`,
        userId: mockUsers[Math.floor(Math.random() * mockUsers.length)],
        permissionLevel: mockLevels[Math.floor(Math.random() * mockLevels.length)],
      }));
    }
    return data;
  } catch {
    // Return mock data on error
    const mockUsers = ["Coach", "Trainer", "Physio", "Manager"];
    const mockLevels = ["read", "write", "admin"];
    const count = Math.floor(Math.random() * 2) + 1;
    return Array.from({ length: count }, (_, i) => ({
      id: `${athleteId}-collab-${i}`,
      userId: mockUsers[Math.floor(Math.random() * mockUsers.length)],
      permissionLevel: mockLevels[Math.floor(Math.random() * mockLevels.length)],
    }));
  }
};

// Get sign-off status with deadline info
const getSignOffStatus = (blocks: Block[]): { hasPending: boolean; pendingBlockId?: string; deadlineText?: string } => {
  const pendingBlock = blocks.find(b => b.signOffStatus === "pending");
  if (!pendingBlock) {
    return { hasPending: false };
  }
  
  // Get deadline text if nextBlockDue exists
  let deadlineText: string | undefined;
  if (pendingBlock.nextBlockDue) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(pendingBlock.nextBlockDue);
    dueDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) {
      deadlineText = `${Math.abs(daysDiff)}d ago`;
    } else if (daysDiff === 0) {
      deadlineText = "Today";
    } else if (daysDiff === 1) {
      deadlineText = "Tomorrow";
    } else if (daysDiff <= 7) {
      deadlineText = `${daysDiff}d`;
    } else {
      deadlineText = format(dueDate, "MMM d");
    }
  }
  
  return {
    hasPending: true,
    pendingBlockId: pendingBlock.id,
    deadlineText,
  };
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
  const [tabView, setTabView] = useState<TabView>("all");
  const [viewMode, setViewMode] = useState<"list" | "timeline">("list");
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

  // Fetch athletes data from API
  const { data: athletesData, isLoading, error: athletesError } = useQuery<AthleteWithPhase[]>({
    queryKey: ["/api/athletes"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/athletes");
        if (!response.ok) {
          console.error("[Programs] Failed to fetch athletes:", response.status, response.statusText);
          // Return empty array instead of throwing to prevent UI crash
          return [];
        }
        const data = await response.json();
        console.log("[Programs] Fetched athletes:", Array.isArray(data) ? data.length : 'not an array', data);
        // Ensure we always return an array
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("[Programs] Error fetching athletes:", error);
        // Return empty array instead of throwing
        return [];
      }
    },
  });

  // Filter and sort athletes
  const filteredAndSortedAthletes = useMemo(() => {
    if (!athletesData) return [];
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

      // Filter by tab view (To-Do's List Logic)
      if (tabView === "all") {
        // All: Show everything
        // Continue to other filters
      } else if (tabView === "open") {
        // Open: Tasks, New Phase due
        const taskCount = getTaskCount(athlete.id);
        const hasDraftOrPlanned = blocks.some(block => 
          block.status === "draft" || block.status === "planned"
        );
        
        if (taskCount === 0 && !hasDraftOrPlanned) return false;
      } else if (tabView === "pending") {
        // Pending: Recent edit (to review), Block Review due
        const hasBlockReviewDue = blocks.some(block => {
          if (!block.nextBlockDue) return false;
          const dueDate = new Date(block.nextBlockDue);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate <= today;
        });
        
        // Check if recent edit was made by someone other than primary coach
        // For now, we'll check if there's a recent modification
        const lastMod = getLastModificationDay(blocks);
        const hasRecentEdit = !!lastMod.fullDateTime;
        
        if (!hasBlockReviewDue && !hasRecentEdit) return false;
      } else if (tabView === "upcoming") {
        // Upcoming: Forecasted To-Do's
        // Show items with future nextBlockDue dates
        const hasUpcomingBlockDue = blocks.some(block => {
          if (!block.nextBlockDue) return false;
          const dueDate = new Date(block.nextBlockDue);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate > today;
        });
        
        if (!hasUpcomingBlockDue) return false;
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
        case "team": {
          aValue = a.athlete.team || "";
          bValue = b.athlete.team || "";
          break;
        }
        case "subSeasonStatus": {
          aValue = getSubSeasonStatus(a.blocks);
          bValue = getSubSeasonStatus(b.blocks);
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
          // Sort by date string (M/d format)
          aValue = aMod.formattedDate || "";
          bValue = bMod.formattedDate || "";
          break;
        }
        default:
          return 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      } else {
        return 0;
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
          </div>
          <div className="flex items-center gap-3">
            <Tabs value={tabView} onValueChange={(v) => setTabView(v as TabView)}>
              <TabsList className="bg-[#171716] border border-[#292928] h-8">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-[#1C1C1B] data-[state=active]:text-[#f7f6f2] text-[#979795] px-3 text-xs font-['Montserrat']"
                >
                  All
                </TabsTrigger>
                <TabsTrigger 
                  value="open" 
                  className="data-[state=active]:bg-[#1C1C1B] data-[state=active]:text-[#f7f6f2] text-[#979795] px-3 text-xs font-['Montserrat']"
                >
                  Open
                </TabsTrigger>
                <TabsTrigger 
                  value="pending" 
                  className="data-[state=active]:bg-[#1C1C1B] data-[state=active]:text-[#f7f6f2] text-[#979795] px-3 text-xs font-['Montserrat']"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger 
                  value="upcoming" 
                  className="data-[state=active]:bg-[#1C1C1B] data-[state=active]:text-[#f7f6f2] text-[#979795] px-3 text-xs font-['Montserrat']"
                >
                  Upcoming
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-1 border border-[#292928] rounded-lg bg-[#171716] p-0.5">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-2 rounded-md font-['Montserrat']",
                  viewMode === "list" 
                    ? "bg-[#1C1C1B] text-[#f7f6f2]" 
                    : "text-[#979795] hover:text-[#f7f6f2]"
                )}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-2 rounded-md font-['Montserrat']",
                  viewMode === "timeline" 
                    ? "bg-[#1C1C1B] text-[#f7f6f2]" 
                    : "text-[#979795] hover:text-[#f7f6f2]"
                )}
                onClick={() => setViewMode("timeline")}
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
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
          {viewMode === "timeline" ? (
            <ProgramsTimelineView athletes={filteredAndSortedAthletes} />
          ) : isLoading ? (
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
                    No {tabView === "all" ? "" : tabView === "pending" ? "pending" : tabView === "open" ? "open" : "upcoming"} athletes found
                  </h3>
                  <p className="text-sm font-['Montserrat'] text-[#979795] mb-6">
                    {athletesError ? (
                      <>
                        Error loading athletes. Check console for details.
                        <br />
                        <span className="text-xs text-red-400 mt-2 block">
                          {athletesError instanceof Error ? athletesError.message : "Unknown error"}
                        </span>
                      </>
                    ) : hasActiveFilters ? (
                      "Try adjusting your filters to see more results."
                    ) : tabView === "all" ? (
                      "No athletes found. Check your search or filters."
                    ) : (
                      "Use filters or go to an athlete to create the first block."
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full overflow-x-auto scrollbar-thin">
              <div className="bg-[#121210] rounded-2xl overflow-x-auto overflow-y-hidden relative">
                {/* Table Header */}
                <div className="flex h-10 bg-[#121210] text-[#bcbbb7] text-xs font-medium relative w-full">
                  {/* Column 1: Athlete Name */}
                  <div className="flex items-center pl-[8px] pr-[16px] w-[400px] min-w-[400px] flex-shrink-0 border-r border-[#292928]">
                    <button 
                      onClick={() => handleSort('athleteName')}
                      onMouseEnter={() => setHoveredSortField('athleteName')}
                      onMouseLeave={() => setHoveredSortField(null)}
                      className="flex gap-[4px] items-center flex-1 hover:text-[#f7f6f2] transition-colors pl-[16px]"
                    >
                      <span className="font-['Montserrat',_sans-serif] font-medium text-[12px] leading-[1.32] text-[#bcbbb7] whitespace-nowrap overflow-hidden text-ellipsis">
                        Athlete name
                      </span>
                      {getSortIcon('athleteName', hoveredSortField === 'athleteName' || sortField === 'athleteName')}
                    </button>
                  </div>

                  {/* Scrollable Columns Header */}
                  <div className="flex items-center h-full bg-[#121210] flex-1">
                    {/* Column 2: Readiness */}
                    <div className="flex items-center pl-4 pr-0 w-[80px] min-w-[80px]">
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis">Readiness</span>
                    </div>

                    {/* Column 3: Status icons */}
                    <div className="flex items-center pl-4 pr-0 w-[120px] min-w-[120px]">
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis">Status</span>
                    </div>

                    {/* Column 4: Season [Sub-Season] */}
                    <div className="flex items-center pl-4 pr-0 w-[160px] min-w-[160px]">
                      <button 
                        onClick={() => handleSort('subSeasonStatus')}
                        onMouseEnter={() => setHoveredSortField('subSeasonStatus')}
                        onMouseLeave={() => setHoveredSortField(null)}
                        className="flex items-center gap-1 hover:text-[#f7f6f2] transition-colors"
                      >
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">Season</span>
                        {getSortIcon('subSeasonStatus', hoveredSortField === 'subSeasonStatus' || sortField === 'subSeasonStatus')}
                      </button>
                    </div>

                    {/* Column 5: Program position */}
                    <div className="flex items-center pl-4 pr-0 w-[220px] min-w-[220px]">
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis">Program</span>
                    </div>

                    {/* Column 6: Block Due */}
                    <div className="flex items-center pl-4 pr-0 w-[110px] min-w-[110px]">
                      <button 
                        onClick={() => handleSort('blockProgress')}
                        onMouseEnter={() => setHoveredSortField('blockProgress')}
                        onMouseLeave={() => setHoveredSortField(null)}
                        className="flex items-center gap-1 hover:text-[#f7f6f2] transition-colors"
                      >
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">Block Due</span>
                        {getSortIcon('blockProgress', hoveredSortField === 'blockProgress' || sortField === 'blockProgress')}
                      </button>
                    </div>

                    {/* Column 7: Today's Session */}
                    <div className="flex items-center pl-4 pr-0 w-[180px] min-w-[180px]">
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis">Today's Session</span>
                    </div>

                    {/* Column 8: Last entry */}
                    <div className="flex items-center pl-4 pr-0 w-[110px] min-w-[110px]">
                      <button 
                        onClick={() => handleSort('lastEntryDay')}
                        onMouseEnter={() => setHoveredSortField('lastEntryDay')}
                        onMouseLeave={() => setHoveredSortField(null)}
                        className="flex items-center gap-1 hover:text-[#f7f6f2] transition-colors"
                      >
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">Last entry</span>
                        {getSortIcon('lastEntryDay', hoveredSortField === 'lastEntryDay' || sortField === 'lastEntryDay')}
                      </button>
                    </div>

                    {/* Column 9: Recent edit */}
                    <div className="flex items-center pl-4 pr-0 w-[110px] min-w-[110px]">
                      <button 
                        onClick={() => handleSort('lastModificationDay')}
                        onMouseEnter={() => setHoveredSortField('lastModificationDay')}
                        onMouseLeave={() => setHoveredSortField(null)}
                        className="flex items-center gap-1 hover:text-[#f7f6f2] transition-colors"
                      >
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">Recent edit</span>
                        {getSortIcon('lastModificationDay', hoveredSortField === 'lastModificationDay' || sortField === 'lastModificationDay')}
                      </button>
                    </div>

                    {/* Column 10: Compliance + Trend */}
                    <div className="flex items-center pl-4 pr-0 w-[120px] min-w-[120px]">
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis">Compliance</span>
                    </div>

                    {/* Column 11: Collaborators */}
                    <div className="flex items-center pl-4 pr-0 w-[120px] min-w-[120px]">
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis">Collaborators</span>
                    </div>

                    {/* Column 12: Menu */}
                    <div className="flex items-center pl-4 pr-0 w-[50px] min-w-[50px]">
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis"></span>
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
                    
                    // Component for collaborators
                    const CollaboratorsCell = () => {
                      const [collaborators, setCollaborators] = useState<Array<{ id: string; userId: string; permissionLevel: string }>>([]);
                      useEffect(() => {
                        getCollaborators(athleteData.athlete.id).then(setCollaborators);
                      }, [athleteData.athlete.id]);
                      
                      if (collaborators.length === 0) return <span className="text-[#979795] text-sm">–</span>;
                      
                      return (
                        <Popover>
                          <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <div className="flex -space-x-2 cursor-pointer">
                              {collaborators.slice(0, 3).map((collab, idx) => (
                                <Avatar key={collab.id} className="h-6 w-6 border-2 border-[#292928]">
                                  <AvatarFallback className="bg-[#292928] text-[#f7f6f2] text-xs">
                                    {collab.userId.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="bg-[#171716] border-[#292928]">
                            <div className="space-y-2">
                              {collaborators.map(collab => (
                                <div key={collab.id} className="text-sm text-[#f7f6f2]">
                                  User {collab.userId}: {collab.permissionLevel}
                                </div>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      );
                    };

                    return (
                      <div
                        key={athleteData.athlete.id}
                        className="group flex items-center border-b-2 border-[#121210] h-12 bg-[#1C1C1B] hover:bg-[#2C2C2B] transition-colors cursor-pointer w-full"
                        onClick={() => setLocation(`/programs/${athleteData.athlete.id}`)}
                      >
                        {/* Column 1: Athlete Name + Handedness + Position + Team */}
                        <div className="flex gap-[8px] items-center pl-[8px] pr-[16px] py-0 w-[400px] min-w-[400px] flex-shrink-0 border-r border-[#292928]">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Avatar className={cn("h-8 w-8 flex-shrink-0", getAvatarBorderClass(athleteData.athlete.status))}>
                              <AvatarImage src={athleteData.athlete.photo} alt={athleteData.athlete.name} />
                              <AvatarFallback className="bg-[#292928] text-[#f7f6f2] text-xs font-['Montserrat']">
                                {athleteData.athlete.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                              <div className="flex items-center gap-1 flex-nowrap min-w-0">
                                <span className="font-['Montserrat',_sans-serif] font-normal text-[14px] text-[#f7f6f2] flex-shrink-0">
                                  {athleteData.athlete.name}
                                </span>
                                {athleteData.athlete.handedness && (
                                  <>
                                    <span className="text-[#979795] text-xs font-['Montserrat'] flex-shrink-0">({athleteData.athlete.handedness})</span>
                                  </>
                                )}
                                {(athleteData.athlete.primaryPosition || athleteData.athlete.secondaryPosition) && (
                                  <>
                                    <span className="text-[#979795] text-xs font-['Montserrat'] flex-shrink-0">|</span>
                                    <span className="text-[#979795] text-xs font-['Montserrat'] flex-shrink-0 whitespace-nowrap">
                                      {athleteData.athlete.primaryPosition || '–'}
                                      {athleteData.athlete.secondaryPosition ? `/${athleteData.athlete.secondaryPosition}` : ''}
                                    </span>
                                  </>
                                )}
                                {(() => {
                                  const teamDisplay = athleteData.athlete.team || (athleteData.athlete.level === "Free Agent" ? "Free Agent" : null);
                                  return teamDisplay ? (
                                    <>
                                      <span className="text-[#979795] text-xs font-['Montserrat'] flex-shrink-0">,</span>
                                      <span className="text-[#979795] text-xs font-['Montserrat'] truncate min-w-0">
                                        {teamDisplay}
                                      </span>
                                    </>
                                  ) : null;
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Scrollable Columns */}
                        <div className="flex items-center h-full bg-[#1C1C1B] group-hover:bg-[#2C2C2B] flex-1">
                          {/* Column 2: Readiness */}
                          <div className="flex items-center pl-4 pr-0 w-[80px] min-w-[80px]">
                            {statusIcon ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>{statusIcon}</div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{statusTooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span className="text-[#979795] text-sm">–</span>
                            )}
                          </div>

                          {/* Column 3: Status icons (with deadlines) */}
                          <div className="flex items-center pl-4 pr-0 w-[120px] min-w-[120px] gap-1" onClick={(e) => e.stopPropagation()}>
                            {(() => {
                              const signOff = getSignOffStatus(athleteData.blocks);
                              const taskCount = getTaskCount(athleteData.athlete.id);
                              const hasRecentEdit = (() => {
                                // Check if recent edit was made by someone other than primary coach
                                // For now, we'll show if there's a recent modification
                                const lastMod = getLastModificationDay(athleteData.blocks);
                                return !!lastMod.fullDateTime;
                              })();
                              
                              const statusIcons: React.ReactNode[] = [];
                              
                              // Sign-off pending icon
                              if (signOff.hasPending) {
                                statusIcons.push(
                                  <TooltipProvider key="signoff">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1">
                                          <CheckCircle2 className="h-4 w-4 text-amber-500" />
                                          {signOff.deadlineText && (
                                            <span className="text-xs text-[#979795]">{signOff.deadlineText}</span>
                                          )}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Block review due{signOff.deadlineText ? `: ${signOff.deadlineText}` : ''}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                );
                              }
                              
                              // Build icon (new phase due)
                              const hasDraftOrPlanned = athleteData.blocks.some(b => b.status === "draft" || b.status === "planned");
                              if (hasDraftOrPlanned) {
                                statusIcons.push(
                                  <TooltipProvider key="build">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Hammer className="h-4 w-4 text-[#979795]" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>New phase due</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                );
                              }
                              
                              // Review icon (recent edit by collaborator)
                              if (hasRecentEdit) {
                                statusIcons.push(
                                  <TooltipProvider key="review">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Eye className="h-4 w-4 text-[#979795]" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Recent edit to review</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                );
                              }
                              
                              // Task icon
                              if (taskCount > 0) {
                                statusIcons.push(
                                  <TooltipProvider key="tasks">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1">
                                          <Circle className="h-4 w-4 text-[#979795]" />
                                          <span className="text-xs text-[#979795]">{taskCount}</span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{taskCount} task{taskCount !== 1 ? 's' : ''}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                );
                              }
                              
                              return statusIcons.length > 0 ? (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {statusIcons}
                                </div>
                              ) : (
                                <span className="text-[#979795] text-sm">–</span>
                              );
                            })()}
                          </div>

                          {/* Column 4: Season [Sub-Season] */}
                          <div className="flex items-center pl-4 pr-0 w-[160px] min-w-[160px]">
                            {(() => {
                              const currentBlock = getCurrentBlock(athleteData.blocks);
                              if (!currentBlock) return <span className="text-[#979795] text-sm">–</span>;
                              const displayText = getSeasonDisplayText(currentBlock.season, currentBlock.subSeason);
                              return (
                                <span className="text-[#979795] text-sm font-normal">
                                  {displayText}
                                </span>
                              );
                            })()}
                          </div>

                          {/* Column 5: Program position */}
                          <div className="flex items-center pl-4 pr-0 w-[220px] min-w-[220px] gap-1">
                            {(() => {
                              const currentBlock = getCurrentBlock(athleteData.blocks);
                              if (!currentBlock || !athleteData.currentPhase) return <span className="text-[#979795] text-sm">–</span>;
                              
                              const phaseNum = athleteData.currentPhase.phaseNumber;
                              const blockNum = currentBlock.blockNumber;
                              const totalBlocksInPhase = athleteData.blocks.length;
                              const week = currentBlock.currentDay?.week || 1;
                              const day = currentBlock.currentDay?.day || 1;
                              
                              return (
                                <span className="text-[#979795] text-sm font-mono">
                                  P{phaseNum} B{blockNum}({totalBlocksInPhase}) W{week} D{day}
                                </span>
                              );
                            })()}
                          </div>

                          {/* Column 6: Block Due */}
                          <div className="flex items-center pl-4 pr-0 w-[110px] min-w-[110px]">
                            {(() => {
                              const daysInfo = getDaysUntilBlockEnd(athleteData.blocks);
                              if (daysInfo.days === null) {
                                return <span className="text-[#979795] text-sm">–</span>;
                              }
                              return (
                                <span className={cn("text-sm font-['Montserrat']", daysInfo.colorClass)}>
                                  {daysInfo.text}
                                </span>
                              );
                            })()}
                          </div>

                          {/* Column 7: Today's Session */}
                          <div className="flex items-center pl-4 pr-0 w-[180px] min-w-[180px]">
                            {(() => {
                              const TodaysSessionTextCell = () => {
                                const [sessionData, setSessionData] = useState<{ throwing: string | null; lifting: string | null; throwingIntensity?: string; liftingIntensity?: string } | null>(null);
                                useEffect(() => {
                                  getTodaysSession(athleteData.athlete.id).then(setSessionData);
                                }, [athleteData.athlete.id]);
                                
                                if (!sessionData) return <span className="text-[#979795] text-sm">–</span>;
                                
                                const parts: string[] = [];
                                
                                // Add throwing description
                                if (sessionData.throwing) {
                                  parts.push(sessionData.throwing);
                                }
                                
                                // Add lifting description
                                if (sessionData.lifting) {
                                  parts.push(sessionData.lifting);
                                }
                                
                                if (parts.length === 0) return <span className="text-[#979795] text-sm">–</span>;
                                
                                return (
                                  <span className="text-[#979795] text-sm">
                                    {parts.join(" | ")}
                                  </span>
                                );
                              };
                              return <TodaysSessionTextCell />;
                            })()}
                          </div>

                          {/* Column 8: Last entry */}
                          <div className="flex items-center pl-4 pr-0 w-[110px] min-w-[110px]">
                            {(() => {
                              const lastEntry = getLastEntryDay(athleteData.blocks);
                              return (
                                <span className="text-[#979795] text-sm">
                                  {lastEntry.text}
                                </span>
                              );
                            })()}
                          </div>

                          {/* Column 9: Recent edit */}
                          <div className="flex items-center pl-4 pr-0 w-[110px] min-w-[110px]">
                            {(() => {
                              const lastMod = getLastModificationDay(athleteData.blocks);
                              if (!lastMod.fullDateTime) {
                                return <span className="text-[#979795] text-sm">–</span>;
                              }
                              return (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-[#979795] text-sm cursor-help">
                                        {lastMod.text}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="flex flex-col gap-1">
                                        <p>Edited by: Coach</p>
                                        <p className="text-xs text-[#979795]">{lastMod.fullDateTime}</p>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              );
                            })()}
                          </div>

                          {/* Column 10: Compliance + Trend */}
                          <div className="flex items-center pl-4 pr-0 w-[120px] min-w-[120px]">
                            {(() => {
                              const currentBlock = getCurrentBlock(athleteData.blocks);
                              if (!currentBlock || currentBlock.compliance === undefined) {
                                return <span className="text-[#979795] text-sm">–</span>;
                              }
                              const compliance = currentBlock.compliance;
                              const trend = currentBlock.trend;
                              
                              // Determine text color based on compliance
                              let complianceColor = "text-[#f7f6f2]"; // Good (≥90)
                              if (compliance < 75) {
                                complianceColor = "text-red-500"; // Poor (<75)
                              } else if (compliance < 90) {
                                complianceColor = "text-yellow-500"; // Medium (75-89)
                              }
                              
                              // Get trend indicator (mock for now - would need actual trend calculation)
                              let trendIndicator: React.ReactNode = null;
                              if (trend === "up") {
                                trendIndicator = <sup className="text-xs text-[#979795]">+3</sup>;
                              } else if (trend === "down") {
                                trendIndicator = <sub className="text-xs text-[#979795]">-3</sub>;
                              }
                              
                              return (
                                <span className={cn("text-sm font-['Montserrat']", complianceColor)}>
                                  {compliance}%{trendIndicator}
                                </span>
                              );
                            })()}
                          </div>

                          {/* Column 11: Collaborators */}
                          <div className="flex items-center pl-4 pr-0 w-[120px] min-w-[120px]">
                            <CollaboratorsCell />
                          </div>

                          {/* Column 12: Dot menu */}
                          <div className="flex items-center pl-4 pr-0 w-[50px] min-w-[50px]" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 hover:bg-[#292928]"
                                >
                                  <MoreVertical className="h-4 w-4 text-[#979795]" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-[#171716] border-[#292928] z-[100]">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <DropdownMenuItem className="text-[#f7f6f2] hover:bg-[#292928] cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                        Preview
                                      </DropdownMenuItem>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>A quick snapshot into current block</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <DropdownMenuItem className="text-[#f7f6f2] hover:bg-[#292928] cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                        Add note
                                      </DropdownMenuItem>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>A quick reference note that will be tagged</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <DropdownMenuItem className="text-[#f7f6f2] hover:bg-[#292928] cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                        Edit
                                      </DropdownMenuItem>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>A quick edit function for current block</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <DropdownMenuSeparator className="bg-[#292928]" />
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <DropdownMenuItem className="text-[#f7f6f2] hover:bg-[#292928] cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                        Share
                                      </DropdownMenuItem>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>An embedded direct message in chat</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <DropdownMenuItem className="text-[#f7f6f2] hover:bg-[#292928] cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                        Print
                                      </DropdownMenuItem>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>A quick print function</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <DropdownMenuItem className="text-[#f7f6f2] hover:bg-[#292928] cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                        Progress Report
                                      </DropdownMenuItem>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>A pop-up to create/view a report</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
