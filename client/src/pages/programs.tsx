import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, Target, Zap, Dumbbell, UtensilsCrossed } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { type Program } from "@shared/schema";
import { cn } from "@/lib/utils";

type SortField = "athleteName" | "startDate" | "endDate";
type SortDirection = "asc" | "desc";

export default function Programs() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"active" | "completed">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("startDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  
  // Debug: Log to verify new code is loaded
  console.log("Programs component loaded - v2 with icons");

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

      if (status === "active" && !isActive) return false;
      if (status === "completed" && isActive) return false;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          program.athleteName.toLowerCase().includes(query) ||
          program.programId.toLowerCase().includes(query) ||
          program.athleteId.toLowerCase().includes(query);
        if (!matchesSearch) return false;
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
  }, [programs, status, searchQuery, sortField, sortDirection]);

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
    return format(date, "MM/dd/yyyy");
  };

  // Calculate training days progress (mock data)
  const calculateProgress = (program: Program) => {
    // Calculate total training days based on block duration
    // Assuming 4 training days per week
    const weeks = program.blockDuration;
    const totalTrainingDays = weeks * 4;
    
    // Mock: Deterministic completion based on program ID (for consistent display)
    // Hash program ID to get a consistent percentage between 30-80%
    const hash = program.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const completionPercentage = 30 + (hash % 50); // Between 30-80%
    const completedDays = Math.floor(totalTrainingDays * (completionPercentage / 100));
    
    return {
      completed: completedDays,
      total: totalTrainingDays,
      percentage: completionPercentage,
      weeks: weeks,
    };
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

  const routineTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    throwing: Target,
    movement: Zap,
    lifting: Dumbbell,
    nutrition: UtensilsCrossed,
  };

  return (
    <div className="min-h-screen bg-[#0d0d0c]">
      <div className="max-w-7xl mx-auto">
        {/* Header - Figma Style */}
        <div className="flex items-center justify-between p-5 border-b border-[#292928]">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-semibold text-[#f7f6f2] font-['Montserrat'] leading-[1.32]">
              Programs
            </h1>
            {/* Active/Completed Toggle */}
            <ToggleGroup
              type="single"
              value={status}
              onValueChange={(value) => value && setStatus(value as "active" | "completed")}
              className="border border-[#292928] rounded-full p-0.5 h-7 bg-[#171716]"
            >
              <ToggleGroupItem value="active" aria-label="Active programs" className="px-3 py-1 text-xs h-6 rounded-full text-[#979795] data-[state=on]:text-[#f7f6f2] data-[state=on]:bg-[#292928]">
                Active
              </ToggleGroupItem>
              <ToggleGroupItem value="completed" aria-label="Completed programs" className="px-3 py-1 text-xs h-6 rounded-full text-[#979795] data-[state=on]:text-[#f7f6f2] data-[state=on]:bg-[#292928]">
                Completed
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="flex items-center gap-3">
            {/* Search Field */}
            <div className="bg-[#292928] flex items-center h-8 px-3 py-2 rounded-lg w-[337px]">
              <Search className="h-4 w-4 text-[#979795] mr-2.5" />
              <input
                type="text"
                placeholder="Search by program ID, athlete name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-[#979795] font-['Montserrat'] placeholder:text-[#979795] border-none outline-none"
              />
            </div>
            {/* Filter Button */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 border-[#292928] bg-[#171716] text-[#f7f6f2] hover:bg-[#1a1a19] font-['Montserrat']"
              onClick={() => {
                // TODO: Open filter modal
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              <span className="text-xs font-medium font-['Montserrat']">Filters</span>
            </Button>
            {/* Add Program Button */}
            <Button
              onClick={() => setLocation("/add-program")}
              size="sm"
              className="h-8 px-3 bg-[#e5e4e1] text-black hover:bg-[#d5d4d1] font-['Montserrat']"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="text-xs font-semibold font-['Montserrat']">Add Program</span>
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 bg-[#0d0d0c]">
          {/* Table */}
          {isLoading ? (
            <div className="text-center py-12 text-[#979795] font-['Montserrat']">Loading programs...</div>
          ) : filteredAndSortedPrograms.length === 0 ? (
            <div className="text-center py-12 text-[#979795] font-['Montserrat']">
              No {status} programs found
            </div>
          ) : (
            <div className="border border-[#292928] rounded-lg overflow-x-auto w-full bg-[#0d0d0c]">
              <Table className="min-w-[800px] w-full">
                <TableHeader>
                  <TableRow className="border-b border-[#292928] hover:bg-transparent">
                    <SortableHeader field="athleteName">Athlete</SortableHeader>
                    <TableHead className="text-xs font-['Montserrat'] text-[#979795]">Program ID</TableHead>
                    <SortableHeader field="startDate">Start</SortableHeader>
                    <SortableHeader field="endDate">End</SortableHeader>
                    <TableHead className="text-xs font-['Montserrat'] text-[#979795]">Routine Types</TableHead>
                    <TableHead className="w-[200px] text-xs font-['Montserrat'] text-[#979795]">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedPrograms.map((program) => {
                    const progress = calculateProgress(program);
                    return (
                      <TableRow
                        key={program.id}
                        className="cursor-pointer hover:bg-[#171716] border-b border-[#292928]"
                        onClick={() => setLocation(`/program-page?id=${program.id}`)}
                      >
                        <TableCell className="font-medium py-2 whitespace-nowrap">
                          <div className="font-semibold font-['Montserrat'] text-[#f7f6f2] truncate">{program.athleteName}</div>
                        </TableCell>
                        <TableCell className="text-sm font-['Montserrat'] text-[#f7f6f2] py-2 whitespace-nowrap">{program.programId}</TableCell>
                        <TableCell className="py-2 whitespace-nowrap text-[#979795] font-['Montserrat']">{formatDate(program.startDate)}</TableCell>
                        <TableCell className="py-2 whitespace-nowrap text-[#979795] font-['Montserrat']">{formatDate(program.endDate)}</TableCell>
                        <TableCell className="py-2 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {program.routineTypes.map((type) => {
                              const IconComponent = routineTypeIcons[type.toLowerCase()];
                              if (!IconComponent) return null;
                              const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
                              return (
                                <Tooltip key={type}>
                                  <TooltipTrigger asChild>
                                    <div className="w-6 h-6 flex items-center justify-center rounded cursor-help">
                                      <IconComponent className="h-4 w-4 text-[#979795]" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{typeLabel}</p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="py-2 whitespace-nowrap">
                          {status === "active" ? (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 min-w-[60px]">
                                <StackedProgressBar completed={progress.completed} total={progress.total} />
                              </div>
                              <span className="text-xs text-[#979795] font-['Montserrat'] whitespace-nowrap">
                                {progress.completed}/{progress.total}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#979795] font-['Montserrat'] whitespace-nowrap">
                                {progress.weeks} {progress.weeks === 1 ? 'week' : 'weeks'}
                              </span>
                              <Badge variant="outline" className="text-xs bg-[#292928] border-[#292928] text-[#979795]">
                                {progress.total} days
                              </Badge>
                            </div>
                          )}
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
    </div>
  );
}
