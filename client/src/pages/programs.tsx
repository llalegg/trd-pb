import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { type AthleteWithPhase, type Block } from "@shared/schema";
import AthleteProgramCard from "@/components/AthleteRow";
import { cn } from "@/lib/utils";

type SortField = "athleteName" | "nextActionDate" | "lastActivity" | "phaseProgress";
type SortDirection = "asc" | "desc";

interface FilterState {
  athleteStatuses: string[]; // injured/rehabbing/lingering-issues
  blockStatuses: string[]; // active/complete/draft/pending-signoff
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
  { value: "pending-signoff", label: "Pending Sign-off" },
];
const SEASON_OPTIONS = ["Pre-Season", "In-Season", "Off-Season"];
const SUB_SEASON_OPTIONS = ["Early", "Mid", "Late"];
const URGENCY_OPTIONS = [
  { value: "due-this-week", label: "Due this week" },
  { value: "overdue", label: "Overdue" },
  { value: "no-active-block", label: "No active block" },
];

export default function Programs() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"current" | "past" | "needs-signoff">("current");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("nextActionDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [expandedAthletes, setExpandedAthletes] = useState<Set<string>>(new Set());
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

  // Fetch athletes - uses default queryFn from queryClient
  const { data: athletesData = [], isLoading, error } = useQuery<AthleteWithPhase[]>({
    queryKey: ["/api/athletes"],
  });

  // Log for debugging
  useEffect(() => {
    if (error) {
      console.error("[Programs] Error fetching athletes:", error);
    }
    if (athletesData) {
      console.log(`[Programs] Received ${athletesData.length} athletes from API`);
      if (athletesData.length > 0) {
        console.log(`[Programs] First athlete:`, athletesData[0]);
      }
    }
  }, [athletesData, error]);
  
  const toggleAthleteExpanded = (athleteId: string) => {
    setExpandedAthletes((prev) => {
      const isOpen = prev.has(athleteId);
      const next = new Set<string>();
      if (!isOpen) {
        // Only one expanded at a time: open the clicked one and collapse others
        next.add(athleteId);
      }
      return next;
    });
  };

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

      // Filter by status (current/past/needs-signoff) - check if ANY block matches
      if (status === "current") {
        const hasActiveBlock = blocks.some(block => {
          const endDate = new Date(block.endDate);
          endDate.setHours(0, 0, 0, 0);
          const isActive = block.status === "active" && endDate >= today;
          if (!isActive && block.status === "active") {
            console.log(`[Programs] Block ${block.name} filtered out: status=${block.status}, endDate=${block.endDate}, endDateObj=${endDate.toISOString()}, today=${today.toISOString()}, comparison=${endDate >= today}`);
          }
          return isActive;
        });
        if (!hasActiveBlock) {
          console.log(`[Programs] Athlete ${athlete.name} filtered out: no active blocks matching current filter`);
          return false;
        }
      } else if (status === "past") {
        // Past: Only athletes with NO active or planned (draft) blocks
        // All blocks must be complete and ended in the past
        const hasActiveOrPlanned = blocks.some(block => {
          const endDate = new Date(block.endDate);
          endDate.setHours(0, 0, 0, 0);
          return block.status === "active" || 
                 block.status === "draft" || 
                 (block.status === "pending-signoff" && endDate >= today);
        });
        if (hasActiveOrPlanned) return false;
        
        // Must have at least one complete block that ended in the past
        const hasPastCompleteBlock = blocks.some(block => {
          const endDate = new Date(block.endDate);
          endDate.setHours(0, 0, 0, 0);
          return block.status === "complete" && endDate < today;
        });
        if (!hasPastCompleteBlock) return false;
      } else if (status === "needs-signoff") {
        const hasPendingSignoff = blocks.some(block => block.status === "pending-signoff");
        if (!hasPendingSignoff) return false;
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

      // Filter by last activity (coach modification OR athlete submission) - check if ANY block matches
      if (filters.lastActivityStart || filters.lastActivityEnd) {
        const hasMatchingActivity = blocks.some(block => {
          // Get the most recent activity date (either modification or submission)
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

      // Filter by next block due - check if ANY block matches
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

      // Filter by urgency - check if ANY block matches
      if (filters.urgency.length > 0) {
        const hasMatchingUrgency = filters.urgency.some(urgencyType => {
          if (urgencyType === "no-active-block") {
            const hasActiveBlock = blocks.some(block => block.status === "active");
            return !hasActiveBlock;
          }
          
          // For "due-this-week" and "overdue", check nextBlockDue dates
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
      // Special sorting for "needs-signoff" tab - sort by urgency first
      if (status === "needs-signoff") {
        const getPendingSignoffUrgency = (blocks: Block[]): number => {
          const pendingBlocks = blocks.filter(b => b.status === "pending-signoff");
          if (pendingBlocks.length === 0) return Number.MAX_SAFE_INTEGER;
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // Get earliest nextBlockDue date from pending blocks
          const dueDates = pendingBlocks
            .filter(b => b.nextBlockDue)
            .map(b => {
              const dueDate = new Date(b.nextBlockDue!);
              dueDate.setHours(0, 0, 0, 0);
              return dueDate.getTime();
            });
          
          if (dueDates.length === 0) return 0; // No due date = urgent
          
          const earliestDue = Math.min(...dueDates);
          const daysDiff = Math.ceil((earliestDue - today.getTime()) / (1000 * 60 * 60 * 24));
          
          // Negative = overdue (most urgent), then by days until due
          return daysDiff;
        };
        
        const aUrgency = getPendingSignoffUrgency(a.blocks);
        const bUrgency = getPendingSignoffUrgency(b.blocks);
        
        if (aUrgency !== bUrgency) {
          return aUrgency - bUrgency; // Most urgent first
        }
        
        // If same urgency, sort by athlete name
        return a.athlete.name.localeCompare(b.athlete.name);
      }
      
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "athleteName":
          aValue = a.athlete.name;
          bValue = b.athlete.name;
          break;
        case "nextActionDate": {
          // Get earliest block needing attention (pending-signoff takes priority, then nextBlockDue)
          const getNextActionDate = (blocks: Block[]): number => {
            const actionDates: number[] = [];
            
            // First priority: blocks pending sign-off (use today as action date)
            const pendingSignoff = blocks.some(b => b.status === "pending-signoff");
            if (pendingSignoff) {
              actionDates.push(new Date().getTime());
            }
            
            // Second priority: nextBlockDue dates
            blocks.forEach(block => {
              if (block.nextBlockDue) {
                actionDates.push(new Date(block.nextBlockDue).getTime());
              }
            });
            
            return actionDates.length > 0 ? Math.min(...actionDates) : Number.MAX_SAFE_INTEGER;
          };
          
          aValue = getNextActionDate(a.blocks);
          bValue = getNextActionDate(b.blocks);
          break;
        }
        case "lastActivity": {
          // Get most recent activity (modification OR submission) from all blocks
          const getLastActivity = (blocks: Block[]): number => {
            const activityDates: number[] = [];
            blocks.forEach(block => {
              if (block.lastModification) {
                activityDates.push(new Date(block.lastModification).getTime());
              }
              if (block.lastSubmission) {
                activityDates.push(new Date(block.lastSubmission).getTime());
              }
            });
            return activityDates.length > 0 
              ? Math.max(...activityDates)
              : Number.MAX_SAFE_INTEGER;
          };
          
          aValue = getLastActivity(a.blocks);
          bValue = getLastActivity(b.blocks);
          break;
        }
        case "phaseProgress": {
          // Calculate phase progress (% complete) from current phase blocks
          const getPhaseProgress = (athleteData: AthleteWithPhase): number => {
            if (!athleteData.currentPhase || athleteData.currentPhase.blocks.length === 0) {
              return 0;
            }
            
            const phaseBlocks = athleteData.currentPhase.blocks;
            let totalDaysComplete = 0;
            let totalDaysAvailable = 0;
            
            phaseBlocks.forEach(block => {
              totalDaysComplete += block.daysComplete ?? 0;
              totalDaysAvailable += block.daysAvailable ?? 0;
            });
            
            if (totalDaysAvailable === 0) return 0;
            return (totalDaysComplete / totalDaysAvailable) * 100;
          };
          
          aValue = getPhaseProgress(a);
          bValue = getPhaseProgress(b);
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
  }, [athletesData, status, searchQuery, sortField, sortDirection, filters]);

  // Helper function to check if a block matches the current filters
  const blockMatchesFilters = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return (block: Block): boolean => {
      // Check block status filter
      if (filters.blockStatuses.length > 0) {
        if (!filters.blockStatuses.includes(block.status)) return false;
    }

      // Check season filter
      if (filters.seasons.length > 0) {
        if (!filters.seasons.includes(block.season)) return false;
      }

      // Check sub-season filter
      if (filters.subSeasons.length > 0) {
        if (!block.subSeason || !filters.subSeasons.includes(block.subSeason)) return false;
      }

      // Check urgency filter
      if (filters.urgency.length > 0) {
        const matchesUrgency = filters.urgency.some(urgencyType => {
          if (urgencyType === "overdue" || urgencyType === "due-this-week") {
            if (!block.nextBlockDue) return false;
            const dueDate = new Date(block.nextBlockDue);
            dueDate.setHours(0, 0, 0, 0);
            const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            if (urgencyType === "overdue") {
              return daysDiff < 0;
            } else if (urgencyType === "due-this-week") {
              return daysDiff >= 0 && daysDiff <= 7;
            }
          }
          return false;
        });
        if (!matchesUrgency) return false;
      }

      // Check next block due filter
      if (filters.nextBlockDueStart || filters.nextBlockDueEnd) {
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
      }

      // Check last activity filter
      if (filters.lastActivityStart || filters.lastActivityEnd) {
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
      }

      return true;
    };
  }, [filters]);

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

  // Auto-expand: open the first relevant card per tab; keep at most one expanded
  useEffect(() => {
    let firstId: string | undefined;
    if (status === "needs-signoff") {
      const hit = filteredAndSortedAthletes.find((a) => a.blocks.some((b) => b.status === "pending-signoff"));
      firstId = hit?.athlete.id;
    } else if (status === "past") {
      firstId = filteredAndSortedAthletes[0]?.name ? filteredAndSortedAthletes[0]!.athlete.id : undefined;
    } else if (hasActiveFilters) {
      const hit = filteredAndSortedAthletes.find((a) => a.blocks.some((b) => blockMatchesFilters(b)));
      firstId = hit?.athlete.id;
    }
    if (firstId) {
      setExpandedAthletes(new Set([firstId]));
    } else {
      setExpandedAthletes(new Set());
    }
  }, [status, filteredAndSortedAthletes, hasActiveFilters, blockMatchesFilters]);
  
  // Count athletes needing sign-off
  const needsSignoffCount = useMemo(() => {
    if (status !== "needs-signoff") return 0;
    return athletesData.filter(athleteData => 
      athleteData.blocks.some(block => block.status === "pending-signoff")
    ).length;
  }, [athletesData, status]);
  
  // Check if any blocks are overdue
  const hasOverdueSignoff = useMemo(() => {
    if (status !== "needs-signoff") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return athletesData.some(athleteData => 
      athleteData.blocks.some(block => {
        if (block.status !== "pending-signoff" || !block.nextBlockDue) return false;
        const dueDate = new Date(block.nextBlockDue);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
      })
    );
  }, [athletesData, status]);



  return (
    <div className="min-h-screen bg-surface-base">
      <div className="w-full">
        {/* Header - Figma Style */}
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-semibold text-[#f7f6f2] font-['Montserrat'] leading-[1.32]">
              Programs
            </h1>
            {/* Active/Completed Toggle */}
            <ToggleGroup
              type="single"
              value={status}
              onValueChange={(value) => value && setStatus(value as "current" | "past" | "needs-signoff")}
              variant="segmented"
            >
              <ToggleGroupItem value="current" aria-label="Current programs">
                Current
              </ToggleGroupItem>
              <ToggleGroupItem value="needs-signoff" aria-label="Needs sign-off">
                <div className="flex items-center gap-2">
                  <span>Needs sign-off</span>
                  {needsSignoffCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#171716] text-[#979795] text-[10px] font-['Montserrat'] border border-[#292928]">
                      {needsSignoffCount}
                    </span>
                  )}
                  {hasOverdueSignoff && (
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                  )}
                </div>
              </ToggleGroupItem>
              <ToggleGroupItem value="past" aria-label="Past programs">
                Past
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="flex items-center gap-3">
            {/* Search Field */}
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
            {/* Filter Button */}
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

        {/* Content Area */}
        <div className="px-5 pb-5 bg-surface-base">
          {/* Athlete List */}
          {isLoading ? (
            <div className="border border-[#292928] rounded-lg overflow-hidden w-full bg-surface-base">
              {/* Loading Skeleton */}
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
                  {status === "needs-signoff" ? (
                    <>
                      <div className="w-16 h-16 mx-auto rounded-full bg-[#171716] flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                      </div>
                      <h3 className="text-lg font-semibold font-['Montserrat'] text-[#f7f6f2] mb-2">
                        No blocks pending sign-off
                      </h3>
                      <p className="text-sm font-['Montserrat'] text-[#979795] mb-6">
                        All blocks are approved or in draft
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 mx-auto rounded-full bg-[#171716] flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-[#979795]" />
                                    </div>
                      <h3 className="text-lg font-semibold font-['Montserrat'] text-[#f7f6f2] mb-2">
                        No {status} athletes found
                      </h3>
                      <p className="text-sm font-['Montserrat'] text-[#979795] mb-6">
                        {hasActiveFilters 
                          ? "Try reaching your filters to see more results."
                          : "Use filters or go to an athlete to create the first block."}
                      </p>
                    </>
                  )}
                          </div>
                          </div>
              
              </div>
            ) : (
              <div className="w-full">
                {filteredAndSortedAthletes.map((athleteData) => {
                  // Calculate which blocks match the filters
                  const matchingBlockIds = new Set(
                    athleteData.blocks
                      .filter((block) => blockMatchesFilters(block))
                      .map((block) => block.id)
                  );
                  return (
                    <AthleteProgramCard
                      key={athleteData.athlete.id}
                      athleteData={athleteData}
                      isExpanded={expandedAthletes.has(athleteData.athlete.id)}
                      onToggleExpand={() => toggleAthleteExpanded(athleteData.athlete.id)}
                      matchingBlockIds={matchingBlockIds}
                    />
                  );
                })}
              </div>
            )}
        </div>
      </div>

      {/* Filter Sheet */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="right" className="h-full flex flex-col bg-surface-base border-l border-[#292928] w-full sm:max-w-md p-0">
          {/* Fixed Header */}
          <SheetHeader className="border-b border-[#292928] pb-4 px-6 pt-6 flex-shrink-0">
            <SheetTitle className="text-xl font-['Montserrat'] text-[#f7f6f2]">Filters</SheetTitle>
          </SheetHeader>

          {/* Scrollable Content */}
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
