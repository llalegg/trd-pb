import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, AlertTriangle, Activity, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { type Program } from "@shared/schema";
import { cn } from "@/lib/utils";

type SortField = "athleteName" | "startDate" | "endDate" | "lastModification" | "lastSubmission" | "nextBlockDue";
type SortDirection = "asc" | "desc";

interface FilterState {
  phaseTimelineStart: string;
  phaseTimelineEnd: string;
  statuses: string[];
  seasons: string[];
  subSeasons: string[];
  currentDayBlock: string;
  currentDayWeek: string;
  currentDayDay: string;
  lastModificationStart: string;
  lastModificationEnd: string;
  lastSubmissionStart: string;
  lastSubmissionEnd: string;
  nextBlockDueStart: string;
  nextBlockDueEnd: string;
}

const STATUS_OPTIONS = [
  { value: "injured", label: "Injured" },
  { value: "rehabbing", label: "Rehabbing" },
  { value: "lingering-issues", label: "Lingering Issues" },
];
const SEASON_OPTIONS = ["Pre-Season", "In-Season", "Off-Season"];
const SUB_SEASON_OPTIONS = ["Early", "Mid", "Late"];

export default function Programs() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"current" | "past" | "drafts">("current");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("startDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    phaseTimelineStart: "",
    phaseTimelineEnd: "",
    statuses: [],
    seasons: [],
    subSeasons: [],
    currentDayBlock: "",
    currentDayWeek: "",
    currentDayDay: "",
    lastModificationStart: "",
    lastModificationEnd: "",
    lastSubmissionStart: "",
    lastSubmissionEnd: "",
    nextBlockDueStart: "",
    nextBlockDueEnd: "",
  });
  

  // Fetch programs - uses default queryFn from queryClient
  const { data: programs = [], isLoading } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
  });

  // Filter and sort programs
  const filteredAndSortedPrograms = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = programs.filter((program) => {
      // Filter by status (active/completed)
      const endDate = new Date(program.endDate);
      endDate.setHours(0, 0, 0, 0);
      const isActive = endDate >= today;

      if (status === "current" && !isActive) return false;
      if (status === "past" && isActive) return false;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          program.athleteName.toLowerCase().includes(query) ||
          program.athleteId.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Filter by status
      if (filters.statuses.length > 0) {
        if (!program.status || !filters.statuses.includes(program.status)) return false;
      }

      // Filter by phase timeline
      if (filters.phaseTimelineStart) {
        const startDate = new Date(program.startDate);
        startDate.setHours(0, 0, 0, 0);
        const filterStart = new Date(filters.phaseTimelineStart);
        filterStart.setHours(0, 0, 0, 0);
        if (startDate < filterStart) return false;
      }
      if (filters.phaseTimelineEnd) {
        const endDate = new Date(program.endDate);
        endDate.setHours(0, 0, 0, 0);
        const filterEnd = new Date(filters.phaseTimelineEnd);
        filterEnd.setHours(23, 59, 59, 999);
        if (endDate > filterEnd) return false;
      }

      // Filter by season
      if (filters.seasons.length > 0) {
        if (!program.season || !filters.seasons.includes(program.season)) return false;
      }

      // Filter by sub-season
      if (filters.subSeasons.length > 0) {
        if (!program.subSeason || !filters.subSeasons.includes(program.subSeason)) return false;
      }

      // Filter by current day
      if (filters.currentDayBlock && filters.currentDayBlock.trim() !== "") {
        const blockNum = parseInt(filters.currentDayBlock);
        if (isNaN(blockNum) || !program.currentDay || program.currentDay.block !== blockNum) return false;
      }
      if (filters.currentDayWeek && filters.currentDayWeek.trim() !== "") {
        const weekNum = parseInt(filters.currentDayWeek);
        if (isNaN(weekNum) || !program.currentDay || program.currentDay.week !== weekNum) return false;
      }
      if (filters.currentDayDay && filters.currentDayDay.trim() !== "") {
        const dayNum = parseInt(filters.currentDayDay);
        if (isNaN(dayNum) || !program.currentDay || program.currentDay.day !== dayNum) return false;
      }

      // Filter by last modification
      if (filters.lastModificationStart && program.lastModification) {
        const modDate = new Date(program.lastModification);
        modDate.setHours(0, 0, 0, 0);
        const filterStart = new Date(filters.lastModificationStart);
        filterStart.setHours(0, 0, 0, 0);
        if (modDate < filterStart) return false;
      }
      if (filters.lastModificationEnd && program.lastModification) {
        const modDate = new Date(program.lastModification);
        modDate.setHours(0, 0, 0, 0);
        const filterEnd = new Date(filters.lastModificationEnd);
        filterEnd.setHours(23, 59, 59, 999);
        if (modDate > filterEnd) return false;
      }

      // Filter by last submission
      if (filters.lastSubmissionStart && program.lastSubmission) {
        const subDate = new Date(program.lastSubmission);
        subDate.setHours(0, 0, 0, 0);
        const filterStart = new Date(filters.lastSubmissionStart);
        filterStart.setHours(0, 0, 0, 0);
        if (subDate < filterStart) return false;
      }
      if (filters.lastSubmissionEnd && program.lastSubmission) {
        const subDate = new Date(program.lastSubmission);
        subDate.setHours(0, 0, 0, 0);
        const filterEnd = new Date(filters.lastSubmissionEnd);
        filterEnd.setHours(23, 59, 59, 999);
        if (subDate > filterEnd) return false;
      }

      // Filter by next block due
      if (filters.nextBlockDueStart && program.nextBlockDue) {
        const dueDate = new Date(program.nextBlockDue);
        dueDate.setHours(0, 0, 0, 0);
        const filterStart = new Date(filters.nextBlockDueStart);
        filterStart.setHours(0, 0, 0, 0);
        if (dueDate < filterStart) return false;
      }
      if (filters.nextBlockDueEnd && program.nextBlockDue) {
        const dueDate = new Date(program.nextBlockDue);
        dueDate.setHours(0, 0, 0, 0);
        const filterEnd = new Date(filters.nextBlockDueEnd);
        filterEnd.setHours(23, 59, 59, 999);
        if (dueDate > filterEnd) return false;
      }

      return true;
    });

    // Sort programs
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "athleteName":
          aValue = a.athleteName;
          bValue = b.athleteName;
          break;
        case "startDate":
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
          break;
        case "endDate":
          aValue = new Date(a.endDate).getTime();
          bValue = new Date(b.endDate).getTime();
          break;
        case "lastModification":
          aValue = a.lastModification ? new Date(a.lastModification).getTime() : Number.MAX_SAFE_INTEGER;
          bValue = b.lastModification ? new Date(b.lastModification).getTime() : Number.MAX_SAFE_INTEGER;
          break;
        case "lastSubmission":
          aValue = a.lastSubmission ? new Date(a.lastSubmission).getTime() : Number.MAX_SAFE_INTEGER;
          bValue = b.lastSubmission ? new Date(b.lastSubmission).getTime() : Number.MAX_SAFE_INTEGER;
          break;
        case "nextBlockDue":
          aValue = a.nextBlockDue ? new Date(a.nextBlockDue).getTime() : Number.MAX_SAFE_INTEGER;
          bValue = b.nextBlockDue ? new Date(b.nextBlockDue).getTime() : Number.MAX_SAFE_INTEGER;
          break;
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
  }, [programs, status, searchQuery, sortField, sortDirection, filters]);

  const handleStatusToggle = (status: string) => {
    setFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status]
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

  const clearFilters = () => {
    setFilters({
      phaseTimelineStart: "",
      phaseTimelineEnd: "",
      statuses: [],
      seasons: [],
      subSeasons: [],
      currentDayBlock: "",
      currentDayWeek: "",
      currentDayDay: "",
      lastModificationStart: "",
      lastModificationEnd: "",
      lastSubmissionStart: "",
      lastSubmissionEnd: "",
      nextBlockDueStart: "",
      nextBlockDueEnd: "",
    });
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.phaseTimelineStart ||
      filters.phaseTimelineEnd ||
      filters.statuses.length > 0 ||
      filters.seasons.length > 0 ||
      filters.subSeasons.length > 0 ||
      filters.currentDayBlock ||
      filters.currentDayWeek ||
      filters.currentDayDay ||
      filters.lastModificationStart ||
      filters.lastModificationEnd ||
      filters.lastSubmissionStart ||
      filters.lastSubmissionEnd ||
      filters.nextBlockDueStart ||
      filters.nextBlockDueEnd
    );
  }, [filters]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => {
    const isActive = sortField === field;
    return (
      <TableHead 
        className={cn(
          "cursor-pointer hover:bg-[#171716] text-xs font-['Montserrat'] transition-colors text-[#979795]",
          isActive && "text-[#f7f6f2]"
        )}
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center gap-2">
          {children}
          {isActive ? (
            sortDirection === "asc" ? (
              <ArrowUp className="h-4 w-4 text-[#f7f6f2]" />
            ) : (
              <ArrowDown className="h-4 w-4 text-[#f7f6f2]" />
            )
          ) : (
            <ArrowUpDown className="h-4 w-4 opacity-50 text-[#979795]" />
          )}
        </div>
      </TableHead>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MM/dd/yy");
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MM/dd/yy");
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)}d ago`;
    } else if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else if (diffDays <= 7) {
      return `In ${diffDays}d`;
    } else {
      return formatDateShort(dateString);
    }
  };

  // Calculate progress: days complete / days available in phase
  const calculateProgress = (program: Program) => {
    // Use provided values if available, otherwise calculate from block duration
    const daysComplete = program.daysComplete ?? 0;
    const daysAvailable = program.daysAvailable ?? (program.blockDuration * 4); // Default: 4 days per week
    
    return {
      completed: daysComplete,
      total: daysAvailable,
      percentage: daysAvailable > 0 ? (daysComplete / daysAvailable) * 100 : 0,
    };
  };

  // Get status icon for athlete status
  const getStatusIcon = (status?: "injured" | "rehabbing" | "lingering-issues" | null) => {
    if (!status) return null;
    
    switch (status) {
      case "injured":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "rehabbing":
        return <Activity className="h-4 w-4 text-blue-500" />;
      case "lingering-issues":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  // Get status tooltip text
  const getStatusTooltip = (status?: "injured" | "rehabbing" | "lingering-issues" | null) => {
    if (!status) return "";
    
    switch (status) {
      case "injured":
        return "Injured";
      case "rehabbing":
        return "Rehabbing";
      case "lingering-issues":
        return "Lingering Issues";
      default:
        return "";
    }
  };

  // Format season display
  const formatSeason = (program: Program) => {
    if (!program.season) return "—";
    const subSeason = program.subSeason ? ` (${program.subSeason})` : "";
    return `${program.season}${subSeason}`;
  };

  // Format current day display
  const formatCurrentDay = (program: Program) => {
    if (!program.currentDay) return "—";
    return `${program.currentDay.block}.${program.currentDay.week}.${program.currentDay.day}`;
  };

  // Narrow stacked progress bar component
  const StackedProgressBar = ({ completed, total }: { completed: number; total: number }) => {
    // Use up to 20 segments for display
    const segments = Math.min(Math.max(total, 10), 20);
    const segmentValue = total / segments;
    const completedSegments = Math.min(Math.floor(completed / segmentValue), segments);
    
    return (
      <div className="flex items-center gap-0.5 h-3 w-full">
        {Array.from({ length: segments }).map((_, index) => {
          const isCompleted = index < completedSegments;
          return (
            <div
              key={index}
              className={cn(
                "flex-1 h-full rounded-sm transition-colors",
                isCompleted ? "bg-primary" : "bg-muted"
              )}
            />
          );
        })}
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-surface-base">
      <div className="max-w-7xl mx-auto">
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
              onValueChange={(value) => value && setStatus(value as "current" | "past" | "drafts")}
              variant="segmented"
            >
              <ToggleGroupItem value="current" aria-label="Current programs">
                Current
              </ToggleGroupItem>
              <ToggleGroupItem value="past" aria-label="Past programs">
                Past
              </ToggleGroupItem>
              <ToggleGroupItem value="drafts" aria-label="Draft programs" disabled>
                Drafts
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
                "h-8 px-3 rounded-full border-[#292928] bg-[#171716] text-[#f7f6f2] hover:bg-[#1a1a19] font-['Montserrat']",
                hasActiveFilters && "border-primary"
              )}
              onClick={() => setFilterSheetOpen(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              <span className="text-xs font-medium font-['Montserrat']">Filters</span>
              {hasActiveFilters && (
                <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-primary"></span>
              )}
            </Button>
            {/* Add Program Button */}
            <Button
              onClick={() => setLocation("/add-program")}
              size="sm"
              className="h-8 px-3 rounded-full bg-[#e5e4e1] text-black hover:bg-[#d5d4d1] font-['Montserrat']"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="text-xs font-semibold font-['Montserrat']">Add Program</span>
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-5 pb-5 bg-surface-base">
          {/* Table */}
          {isLoading ? (
            <div className="text-center py-12 text-[#979795] font-['Montserrat']">Loading programs...</div>
          ) : filteredAndSortedPrograms.length === 0 ? (
            <div className="text-center py-12 text-[#979795] font-['Montserrat']">
              No {status} programs found
            </div>
          ) : (
            <div className="border border-[#292928] rounded-lg overflow-x-auto w-full bg-surface-base [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <Table className="min-w-[1200px] w-full">
                <TableHeader>
                  <TableRow className="border-b border-[#292928] hover:bg-transparent">
                    <SortableHeader field="athleteName">Athlete</SortableHeader>
                    <SortableHeader field="startDate">Phase timeline</SortableHeader>
                    <TableHead colSpan={3} className="text-xs font-['Montserrat'] text-[#979795]">Progress</TableHead>
                    <TableHead className="text-xs font-['Montserrat'] text-[#979795]">Season (sub-season)</TableHead>
                    <TableHead className="text-xs font-['Montserrat'] text-[#979795]">Current day</TableHead>
                    <SortableHeader field="lastModification">Last modification</SortableHeader>
                    <SortableHeader field="lastSubmission">Last submission</SortableHeader>
                    <SortableHeader field="nextBlockDue">Next block due</SortableHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedPrograms.map((program) => {
                    const progress = calculateProgress(program);
                    const statusIcon = getStatusIcon(program.status);
                    const statusTooltip = getStatusTooltip(program.status);
                    return (
                      <TableRow
                        key={program.id}
                        className="cursor-pointer hover:bg-[#171716] border-b border-[#292928]"
                        onClick={() => setLocation(`/program-page?id=${program.id}`)}
                      >
                        <TableCell className="font-medium py-2 whitespace-nowrap">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-full bg-[#292928] flex-shrink-0"></div>
                              <div className="font-semibold font-['Montserrat'] text-[#f7f6f2] truncate">{program.athleteName}</div>
                            </div>
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
                          </div>
                        </TableCell>
                        <TableCell className="py-2 whitespace-nowrap text-[#979795] font-['Montserrat']">
                          {formatDateShort(program.startDate)} - {formatDateShort(program.endDate)}
                        </TableCell>
                        <TableCell colSpan={3} className="py-2 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-[60px]">
                              <StackedProgressBar completed={progress.completed} total={progress.total} />
                            </div>
                            <span className="text-xs text-[#979795] font-['Montserrat'] whitespace-nowrap">
                              {progress.completed}/{progress.total}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 whitespace-nowrap text-[#979795] font-['Montserrat']">
                          {formatSeason(program)}
                        </TableCell>
                        <TableCell className="py-2 whitespace-nowrap text-[#979795] font-['Montserrat']">
                          {formatCurrentDay(program)}
                        </TableCell>
                        <TableCell className="py-2 whitespace-nowrap text-[#979795] font-['Montserrat'] text-xs">
                          {program.lastModification ? formatRelativeDate(program.lastModification) : "—"}
                        </TableCell>
                        <TableCell className="py-2 whitespace-nowrap text-[#979795] font-['Montserrat'] text-xs">
                          {program.lastSubmission ? formatRelativeDate(program.lastSubmission) : "—"}
                        </TableCell>
                        <TableCell className="py-2 whitespace-nowrap text-[#979795] font-['Montserrat'] text-xs">
                          {program.nextBlockDue ? formatRelativeDate(program.nextBlockDue) : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
            {/* Status */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold font-['Montserrat'] text-[#f7f6f2]">Status</Label>
              <div className="flex flex-wrap gap-4">
                {STATUS_OPTIONS.map((statusOption) => (
                  <div key={statusOption.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${statusOption.value}`}
                      checked={filters.statuses.includes(statusOption.value)}
                      onCheckedChange={() => handleStatusToggle(statusOption.value)}
                    />
                    <Label
                      htmlFor={`status-${statusOption.value}`}
                      className="text-sm font-['Montserrat'] text-[#f7f6f2] cursor-pointer flex items-center gap-2"
                    >
                      {getStatusIcon(statusOption.value as "injured" | "rehabbing" | "lingering-issues")}
                      {statusOption.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Phase Timeline */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold font-['Montserrat'] text-[#f7f6f2]">Phase timeline</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-['Montserrat'] text-[#979795]">Start date</Label>
                  <Input
                    type="date"
                    value={filters.phaseTimelineStart}
                    onChange={(e) => setFilters(prev => ({ ...prev, phaseTimelineStart: e.target.value }))}
                    className="bg-[#171716] border-[#292928] text-[#f7f6f2] font-['Montserrat']"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-['Montserrat'] text-[#979795]">End date</Label>
                  <Input
                    type="date"
                    value={filters.phaseTimelineEnd}
                    onChange={(e) => setFilters(prev => ({ ...prev, phaseTimelineEnd: e.target.value }))}
                    className="bg-[#171716] border-[#292928] text-[#f7f6f2] font-['Montserrat']"
                  />
                </div>
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

            {/* Current Day */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold font-['Montserrat'] text-[#f7f6f2]">Current day</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-['Montserrat'] text-[#979795]">Block</Label>
                  <Input
                    type="number"
                    placeholder="Block"
                    value={filters.currentDayBlock}
                    onChange={(e) => setFilters(prev => ({ ...prev, currentDayBlock: e.target.value }))}
                    className="bg-[#171716] border-[#292928] text-[#f7f6f2] font-['Montserrat']"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-['Montserrat'] text-[#979795]">Week</Label>
                  <Input
                    type="number"
                    placeholder="Week"
                    value={filters.currentDayWeek}
                    onChange={(e) => setFilters(prev => ({ ...prev, currentDayWeek: e.target.value }))}
                    className="bg-[#171716] border-[#292928] text-[#f7f6f2] font-['Montserrat']"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-['Montserrat'] text-[#979795]">Day</Label>
                  <Input
                    type="number"
                    placeholder="Day"
                    value={filters.currentDayDay}
                    onChange={(e) => setFilters(prev => ({ ...prev, currentDayDay: e.target.value }))}
                    className="bg-[#171716] border-[#292928] text-[#f7f6f2] font-['Montserrat']"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Last Modification */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold font-['Montserrat'] text-[#f7f6f2]">Last modification</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-['Montserrat'] text-[#979795]">Start date</Label>
                  <Input
                    type="date"
                    value={filters.lastModificationStart}
                    onChange={(e) => setFilters(prev => ({ ...prev, lastModificationStart: e.target.value }))}
                    className="bg-[#171716] border-[#292928] text-[#f7f6f2] font-['Montserrat']"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-['Montserrat'] text-[#979795]">End date</Label>
                  <Input
                    type="date"
                    value={filters.lastModificationEnd}
                    onChange={(e) => setFilters(prev => ({ ...prev, lastModificationEnd: e.target.value }))}
                    className="bg-[#171716] border-[#292928] text-[#f7f6f2] font-['Montserrat']"
                  />
                </div>
              </div>
            </div>

            {/* Last Submission */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold font-['Montserrat'] text-[#f7f6f2]">Last submission</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-['Montserrat'] text-[#979795]">Start date</Label>
                  <Input
                    type="date"
                    value={filters.lastSubmissionStart}
                    onChange={(e) => setFilters(prev => ({ ...prev, lastSubmissionStart: e.target.value }))}
                    className="bg-[#171716] border-[#292928] text-[#f7f6f2] font-['Montserrat']"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-['Montserrat'] text-[#979795]">End date</Label>
                  <Input
                    type="date"
                    value={filters.lastSubmissionEnd}
                    onChange={(e) => setFilters(prev => ({ ...prev, lastSubmissionEnd: e.target.value }))}
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
