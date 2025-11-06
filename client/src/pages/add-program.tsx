import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { CalendarIcon, X, ChevronDown, ChevronRight, ChevronLeft, EyeOff, Lock, Shuffle, Trash2, Moon, Plus, Star, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { format, differenceInWeeks, addWeeks, addDays, startOfWeek, endOfWeek, isWithinInterval, getDay, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Athlete, Program } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// Extended athlete interface with demographics
interface ExtendedAthlete extends Athlete {
  photo?: string;
  location?: string;
  position?: string;
  age?: number;
  height?: string;
  weight?: string;
  levelOfPlay?: string;
  team?: string;
  league?: string;
  season?: string;
  xRole?: string;
  status?: "cleared" | "not cleared" | "injured";
  availability?: string;
  phaseEndDate?: string;
}

const mockAthletes: ExtendedAthlete[] = [
  { id: "1", name: "Sarah Johnson", position: "Pitcher", age: 22, height: "5'8\"", weight: "145 lbs", levelOfPlay: "College", team: "State University", league: "NCAA Division I", season: "2024-25", xRole: "Starting Pitcher", status: "cleared", location: "Austin, TX" },
  { id: "2", name: "Michael Chen", position: "Catcher", age: 21, height: "6'0\"", weight: "180 lbs", levelOfPlay: "College", team: "State University", league: "NCAA Division I", season: "2024-25", xRole: "Starting Catcher", status: "cleared", location: "Dallas, TX" },
  { id: "3", name: "Emma Rodriguez", position: "Outfielder", age: 20, height: "5'6\"", weight: "135 lbs", levelOfPlay: "High School", team: "Central High", league: "Varsity", season: "2024-25", xRole: "Center Field", status: "not cleared", location: "Houston, TX" },
  { id: "4", name: "James Williams", position: "Infielder", age: 23, height: "6'2\"", weight: "195 lbs", levelOfPlay: "Professional", team: "Minor League A", league: "MiLB", season: "2024-25", xRole: "Shortstop", status: "cleared", location: "San Antonio, TX" },
  { id: "5", name: "Olivia Martinez", position: "Pitcher", age: 19, height: "5'7\"", weight: "140 lbs", levelOfPlay: "College", team: "State University", league: "NCAA Division I", season: "2024-25", xRole: "Relief Pitcher", status: "cleared", location: "Austin, TX" },
  { id: "6", name: "Daniel Anderson", position: "First Base", age: 22, height: "6'1\"", weight: "190 lbs", levelOfPlay: "College", team: "State University", league: "NCAA Division I", season: "2024-25", xRole: "First Baseman", status: "cleared", location: "Dallas, TX" },
  { id: "7", name: "Sophia Taylor", position: "Outfielder", age: 21, height: "5'5\"", weight: "130 lbs", levelOfPlay: "High School", team: "East High", league: "Varsity", season: "2024-25", xRole: "Left Field", status: "injured", location: "Houston, TX" },
  { id: "8", name: "Liam Brown", position: "Catcher", age: 20, height: "5'11\"", weight: "175 lbs", levelOfPlay: "College", team: "State University", league: "NCAA Division I", season: "2024-25", xRole: "Backup Catcher", status: "cleared", location: "Austin, TX" },
  { id: "9", name: "Ava Davis", position: "Infielder", age: 18, height: "5'4\"", weight: "125 lbs", levelOfPlay: "High School", team: "West High", league: "Varsity", season: "2024-25", xRole: "Second Base", status: "cleared", location: "Dallas, TX" },
  { id: "10", name: "Noah Wilson", position: "Pitcher", age: 24, height: "6'0\"", weight: "185 lbs", levelOfPlay: "Professional", team: "Minor League AA", league: "MiLB", season: "2024-25", xRole: "Starting Pitcher", status: "cleared", location: "San Antonio, TX" },
];

const buildTypeOptions = [
  { id: "standard", label: "Standard", tooltip: "Standard program type" },
  { id: "intervention", label: "Intervention", tooltip: "Intervention program type" },
  { id: "custom", label: "Custom", tooltip: "Custom program type" },
];

const routineTypeOptions = [
  { id: "movement", label: "Movement" },
  { id: "throwing", label: "Throwing" },
  { id: "lifting", label: "Lifting" },
  { id: "nutrition", label: "Nutrition" },
];

// Removed split selection from Settings step; default training logic uses a 4-day split

const DEFAULT_BLOCK_DURATION = 4;
const DEFAULT_PROGRAM_DURATION = 6; // weeks
const MIN_PROGRAM_DURATION = 1; // weeks
const MAX_PROGRAM_DURATION = 16; // weeks

const programFormSchema = z.object({
  athleteId: z.string().min(1, "Please select an athlete"),
  buildType: z.string().default("standard"),
  startDate: z.date({
    required_error: "Please select a start date",
  }),
  endDate: z.date({
    required_error: "Please select an end date",
  }),
  programDuration: z.coerce.number().int().min(MIN_PROGRAM_DURATION, `Minimum duration is ${MIN_PROGRAM_DURATION} week`).max(MAX_PROGRAM_DURATION, `Maximum duration is ${MAX_PROGRAM_DURATION} weeks`).default(DEFAULT_PROGRAM_DURATION),
  blockDuration: z.coerce.number().int().default(DEFAULT_BLOCK_DURATION),
  routineTypes: z.array(z.string()).min(1, "Please select at least one routine type"),
});

type ProgramFormValues = z.infer<typeof programFormSchema>;

// Types for routine settings hierarchy
type RoutineSettings = {
  throwing: {
    xRole: string;
    throwingPhase: string;
    throwingFocus: string;
  };
  movement: {
    rFocus: string;
    movementType: string;
    intensity: string;
    volume: string;
  };
  lifting: {
    rFocus: string;
    focusUpper: string;
    focusLower: string;
  };
  nutrition: {
    focus: string;
    rate: string;
    macrosHigh: string;
    macrosRest: string;
  };
  "training-split": {
    type: string;
  };
};

type SettingsLevel = "block" | "week" | "day";

type SettingsOverride = {
  blockIndex: number;
  weekIndex?: number;
  dayIndex?: number;
  level: SettingsLevel;
  routine: keyof RoutineSettings;
  field: string;
  value: string;
};

type Exercise = {
  id: string;
  targetBodyGroup: string;
  name: string;
  sets: number;
  reps: number;
  restTime: string;
  weight?: string;
  tempo: string;
};

type LiftingCell = {
  exercises: Exercise[];
};

type LiftingDayData = {
  focus: string;
  emphasis: string;
  preparatory: {
    p1: LiftingCell;
    p2: LiftingCell;
    p3: LiftingCell;
    p4: LiftingCell;
  };
};

// Generate a unique program ID
const generateProgramId = () => {
  const prefix = "P";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

export default function AddProgram() {
  const [, setLocation] = useLocation();
  const [athleteComboboxOpen, setAthleteComboboxOpen] = useState(false);
  const [overrideConfirmation, setOverrideConfirmation] = useState<{
    show: boolean;
    programId?: string;
    startDate?: Date;
    endDate?: Date;
    onConfirm?: () => void;
  }>({ show: false });
  const [currentStep, setCurrentStep] = useState(1);
  const [viewMode, setViewMode] = useState<"blocks" | "weeks" | "days">("blocks");
  const [selectedBlockIndex, setSelectedBlockIndex] = useState(0);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [selectedDayWeekIndex, setSelectedDayWeekIndex] = useState(0);
  const [daysOff, setDaysOff] = useState<Set<number>>(new Set([0])); // Sunday (0) hidden by default
  const [programId] = useState(() => generateProgramId());
  
  // Block phases state
  const [blockPhases, setBlockPhases] = useState<Map<number, string>>(new Map());
  
  // Calendar month state for monthly visualization on Settings step
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());
  
  // Block durations state
  const [blockDurations, setBlockDurations] = useState<Map<number, number>>(new Map());
  
  // Block start/end dates state for individual block date control
  const [blockStartDates, setBlockStartDates] = useState<Map<number, Date>>(new Map());
  const [blockEndDates, setBlockEndDates] = useState<Map<number, Date>>(new Map());
  
  // Track recently changed blocks for visual feedback
  const [recentlyChangedBlocks, setRecentlyChangedBlocks] = useState<Set<number>>(new Set());
  
  // Track editing block in blocks table
  const [editingBlockIndex, setEditingBlockIndex] = useState<number | null>(null);
  
  // Issue Resolution Modal state
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  
  // Routine settings state - stores settings at block level by default
  const [blockSettings, setBlockSettings] = useState<Map<number, Partial<RoutineSettings>>>(new Map());
  
  // Track overrides at week and day levels
  const [settingsOverrides, setSettingsOverrides] = useState<SettingsOverride[]>([]);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    routine: keyof RoutineSettings | null;
    field: string | null;
    newValue: string | null;
    blockIndex: number | null;
    affectedCount: number;
  }>({
    open: false,
    routine: null,
    field: null,
    newValue: null,
    blockIndex: null,
    affectedCount: 0,
  });
  
  // Step 3 (Review) state
  const [reviewRoutineTab, setReviewRoutineTab] = useState<string>("lifting");
  const [reviewWeekIndex, setReviewWeekIndex] = useState(0);
  const [liftingData, setLiftingData] = useState<Map<string, LiftingDayData>>(new Map());
  
  const { toast } = useToast();

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programFormSchema),
    defaultValues: {
      athleteId: "",
      buildType: "standard",
      blockDuration: DEFAULT_BLOCK_DURATION,
      programDuration: DEFAULT_PROGRAM_DURATION,
      startDate: new Date(),
      endDate: undefined,
      routineTypes: ["movement", "throwing", "lifting"],
    },
  });

  // Fetch all programs to check for existing programming
  const { data: allPrograms = [] } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
  });

  const createProgramMutation = useMutation({
    mutationFn: async (data: { 
      athleteId: string;
      athleteName: string;
      blockDuration: number;
      startDate: string;
      endDate: string;
      routineTypes: string[];
    }) => {
      return await apiRequest("POST", "/api/programs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      toast({
        title: "Success",
        description: "Program created successfully",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create program",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: ProgramFormValues) => {
    const athlete = mockAthletes.find((a) => a.id === values.athleteId) as ExtendedAthlete | undefined;
    if (!athlete) return;

    // Block submission if athlete is not cleared
    if (athlete.status === "not cleared") {
      toast({
        title: "Error",
        description: "Cannot create program for athlete with 'Not cleared' status",
        variant: "destructive",
      });
      return;
    }

    createProgramMutation.mutate({
      athleteId: values.athleteId,
      athleteName: athlete.name,
      blockDuration: values.blockDuration,
      startDate: format(values.startDate, "yyyy-MM-dd"),
      endDate: format(values.endDate, "yyyy-MM-dd"),
      routineTypes: values.routineTypes,
    });
  };

  const selectedAthleteId = form.watch("athleteId");
  const selectedAthlete = mockAthletes.find((a) => a.id === selectedAthleteId) as ExtendedAthlete | undefined;
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const programDuration = form.watch("programDuration");
  const blockDuration = form.watch("blockDuration");
  const routineTypes = form.watch("routineTypes");

  // Get existing programs for selected athlete
  const athletePrograms = useMemo(() => {
    if (!selectedAthleteId) return [];
    return allPrograms.filter((p) => p.athleteId === selectedAthleteId);
  }, [allPrograms, selectedAthleteId]);

  // Get active programs (In Progress or Scheduled)
  const activePrograms = useMemo(() => {
    if (!selectedAthleteId) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return athletePrograms.filter((program) => {
      const programStart = new Date(program.startDate);
      const programEnd = new Date(program.endDate);
      programStart.setHours(0, 0, 0, 0);
      programEnd.setHours(0, 0, 0, 0);
      return programEnd >= today;
    });
  }, [athletePrograms, selectedAthleteId]);

  // Calculate default start date: today if no existing programs, or day after latest program ends
  const calculateDefaultStartDate = useMemo(() => {
    if (activePrograms.length === 0) {
      return new Date();
    }
    // Find the latest end date
    const latestEndDate = activePrograms.reduce((latest, program) => {
      const programEndDate = new Date(program.endDate);
      return programEndDate > latest ? programEndDate : latest;
    }, new Date(0));
    // Return day after latest program ends
    return addDays(latestEndDate, 1);
  }, [activePrograms]);

  // Check if date is in active programming
  const isDateInActiveProgramming = (date: Date): { blocked: boolean; program?: Program } => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    for (const program of activePrograms) {
      const programStart = new Date(program.startDate);
      const programEnd = new Date(program.endDate);
      programStart.setHours(0, 0, 0, 0);
      programEnd.setHours(0, 0, 0, 0);
      if (checkDate >= programStart && checkDate <= programEnd) {
        return { blocked: true, program };
      }
    }
    return { blocked: false };
  };

  // Check if date is in the past
  const isDateInPast = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  // Update start date when athlete changes
  useEffect(() => {
    if (selectedAthleteId) {
      const defaultStart = calculateDefaultStartDate;
      const currentStart = form.getValues("startDate");
      const currentEnd = form.getValues("endDate");
      // Only update if start date hasn't been manually set or is the old default
      if (!currentStart || currentStart.getTime() === new Date().getTime()) {
        form.setValue("startDate", defaultStart);
        // Auto-populate end date to +6 weeks if not set
        if (!currentEnd && defaultStart) {
          const defaultEnd = addDays(addWeeks(defaultStart, DEFAULT_PROGRAM_DURATION), -1);
          form.setValue("endDate", defaultEnd);
          form.setValue("programDuration", DEFAULT_PROGRAM_DURATION);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAthleteId, calculateDefaultStartDate]);

  // Update end date when start date or program duration changes
  // Auto-populate to +6 weeks when start date is selected (if end date not set)
  useEffect(() => {
    if (startDate && programDuration) {
      const newEndDate = addDays(addWeeks(startDate, programDuration), -1);
      const currentEndDate = form.getValues("endDate");
      // Auto-populate to +6 weeks if start date just changed and no end date set
      if (!currentEndDate || currentEndDate.getTime() === addDays(addWeeks(startDate, DEFAULT_PROGRAM_DURATION), -1).getTime()) {
        form.setValue("endDate", newEndDate);
      } else {
        // Otherwise update based on duration
        form.setValue("endDate", newEndDate);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, programDuration]);

  // Update program duration when end date changes (if start date exists)
  useEffect(() => {
    if (startDate && endDate && endDate > startDate) {
      const newDuration = differenceInWeeks(endDate, startDate) + 1;
      if (newDuration >= MIN_PROGRAM_DURATION && newDuration <= MAX_PROGRAM_DURATION) {
        form.setValue("programDuration", newDuration);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDate]);

  const weeksCount =
    startDate && endDate ? differenceInWeeks(endDate, startDate) : 0;

  // Calculate blocks based on start date, end date, and block duration
  // Block duration is fixed at 4 weeks (DEFAULT_BLOCK_DURATION)
  // Blocks can only start on Monday
  const blocks = useMemo(() => {
    if (!startDate || !endDate) {
      return [];
    }

    const totalWeeks = differenceInWeeks(endDate, startDate);
    if (totalWeeks <= 0) {
      return [];
    }

    const generatedBlocks: Array<{ name: string; startDate: Date; endDate: Date }> = [];
    
    // Find the first Monday from the start date (or use start date if it's already a Monday)
    let currentStart = new Date(startDate);
    const dayOfWeek = currentStart.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    if (dayOfWeek !== 1) {
      // If not Monday, find the next Monday
      // Sunday (0) -> 1 day, Tuesday (2) -> 6 days, ..., Saturday (6) -> 2 days
      const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
      currentStart = addDays(currentStart, daysUntilMonday);
    }
    
    // Ensure we don't start after the end date
    if (currentStart > endDate) {
      return [];
    }
    
    let blockNumber = 1;

    while (currentStart < endDate) {
      // Calculate the end date for this block (4 weeks from start - fixed duration)
      const potentialEnd = addDays(addWeeks(currentStart, DEFAULT_BLOCK_DURATION), -1);
      
      // If the potential end is after the program end date, cap it at program end date
      // This handles the last block which may have less than 4 weeks
      const blockEnd = potentialEnd > endDate ? endDate : potentialEnd;

      generatedBlocks.push({
        name: `Block ${blockNumber}`,
        startDate: currentStart,
        endDate: blockEnd,
      });

      // Next block starts the next Monday after this one ends
      const dayAfterBlockEnd = addDays(blockEnd, 1);
      const nextDayOfWeek = dayAfterBlockEnd.getDay();
      if (nextDayOfWeek !== 1) {
        // Find the next Monday
        // Sunday (0) -> 1 day, Tuesday (2) -> 6 days, ..., Saturday (6) -> 2 days
        const daysUntilMonday = nextDayOfWeek === 0 ? 1 : (8 - nextDayOfWeek);
        currentStart = addDays(dayAfterBlockEnd, daysUntilMonday);
      } else {
        currentStart = dayAfterBlockEnd;
      }
      blockNumber++;
    }

    return generatedBlocks;
  }, [startDate, endDate]);

  // Function to recalculate blocks when duration changes
  const recalculateBlocks = (changedBlockIndex: number, newDuration: number) => {
    if (!startDate || !endDate) return;
    
    // Update the duration for the changed block
    setBlockDurations(prev => {
      const newMap = new Map(prev);
      newMap.set(changedBlockIndex, newDuration);
      return newMap;
    });
    
    // Note: The actual block recalculation will happen in the next render
    // when the blocks useMemo runs with the updated blockDurations
  };

  // Check if step 1 is complete (all required fields filled)
  // Note: blockDuration is fixed at 4 weeks, so we don't need to check it
  const isStep1Complete = useMemo(() => {
    return !!(selectedAthleteId && startDate && endDate && routineTypes.length > 0 && blocks.length > 0);
  }, [selectedAthleteId, startDate, endDate, routineTypes, blocks.length]);

  // Detect issues for Issue Resolution Modal
  const issues = useMemo(() => {
    const blockingIssues: Array<{ type: 'error' | 'warning'; category: string; description: string; affected: string; action?: string }> = [];
    const warnings: Array<{ type: 'error' | 'warning'; category: string; description: string; affected: string; action?: string }> = [];

    // Athlete Status Issues
    if (selectedAthlete?.status === "not cleared") {
      blockingIssues.push({
        type: 'error',
        category: 'Athlete Status',
        description: `${selectedAthlete.name} has status "Not Cleared" and cannot receive programming`,
        affected: 'Athlete Selection',
        action: 'Change Athlete'
      });
    }

    // Date Validation Issues
    if (startDate) {
      const startDayOfWeek = startDate.getDay();
      if (startDayOfWeek !== 1) {
        blockingIssues.push({
          type: 'error',
          category: 'Date Validation',
          description: `Program must start on Monday. Current: ${format(startDate, "EEEE, MMM d, yyyy")}`,
          affected: 'Program Duration',
          action: 'Adjust to Monday'
        });
      }
    }

    // Block Validation Issues
    blocks.forEach((block, index) => {
      const blockEndDate = blockEndDates.get(index) || block.endDate;
      const blockStartDate = blockStartDates.get(index) || block.startDate;
      const duration = differenceInWeeks(blockEndDate, blockStartDate);

      if (duration < 1) {
        blockingIssues.push({
          type: 'error',
          category: 'Block Duration',
          description: `Block ${index + 1} has duration of ${duration} weeks (minimum 1 week required)`,
          affected: `Block ${index + 1}`,
          action: 'Extend Block'
        });
      }

      if (blockEndDate < blockStartDate) {
        blockingIssues.push({
          type: 'error',
          category: 'Block Date',
          description: `Block ${index + 1} end date is before start date`,
          affected: `Block ${index + 1}`,
          action: 'Edit Block'
        });
      }

      // Check for overlaps
      if (index < blocks.length - 1) {
        const nextBlockStart = blockStartDates.get(index + 1) || blocks[index + 1].startDate;
        if (blockEndDate >= nextBlockStart) {
          blockingIssues.push({
            type: 'error',
            category: 'Block Overlap',
            description: `Block ${index + 1} end date (${format(blockEndDate, "MMM d")}) overlaps with Block ${index + 2} start date (${format(nextBlockStart, "MMM d")})`,
            affected: `Blocks ${index + 1} and ${index + 2}`,
            action: 'Auto-fix Dates'
          });
        }
      }

      // Warnings
      const endDayOfWeek = blockEndDate.getDay();
      if (endDayOfWeek !== 0 && endDayOfWeek !== 1 && index < blocks.length - 1) {
        const nextMonday = addDays(blockEndDate, endDayOfWeek === 0 ? 1 : (8 - endDayOfWeek));
        warnings.push({
          type: 'warning',
          category: 'Block End Date',
          description: `Block ${index + 1} ends mid-week, creating gap to next Monday (${format(nextMonday, "EEE, MMM d")})`,
          affected: `Block ${index + 1}`,
          action: 'Extend to Sunday'
        });
      }

      if (duration < 4 && duration >= 1) {
        warnings.push({
          type: 'warning',
          category: 'Block Duration',
          description: `Block ${index + 1} is only ${duration} weeks (recommended minimum 4 weeks)`,
          affected: `Block ${index + 1}`,
          action: 'Extend Block'
        });
      }
    });

    // Program Duration Issues
    if (startDate && endDate) {
      const programDuration = differenceInWeeks(endDate, startDate) + 1;
      if (programDuration > 16) {
        blockingIssues.push({
          type: 'error',
          category: 'Program Duration',
          description: `Program duration is ${programDuration} weeks (maximum 16 weeks allowed)`,
          affected: 'Program Duration',
          action: 'Reduce Duration'
        });
      }
    }

    // Phase Boundary Warnings
    if (selectedAthlete?.phaseEndDate && endDate) {
      const phaseEnd = new Date(selectedAthlete.phaseEndDate);
      if (endDate > phaseEnd) {
        warnings.push({
          type: 'warning',
          category: 'Phase Boundary',
          description: `Program ends ${format(endDate, "MMM d, yyyy")} but current phase ends ${format(phaseEnd, "MMM d, yyyy")}`,
          affected: 'Program Duration',
          action: 'Adjust to Phase End'
        });
      }
    }

    // Routine Type Issues
    if (routineTypes.length === 0) {
      blockingIssues.push({
        type: 'error',
        category: 'Routine Type',
        description: 'At least one routine type must be selected',
        affected: 'Routine Type Selection',
        action: 'Select Routine Type'
      });
    }

    return { blockingIssues, warnings, total: blockingIssues.length + warnings.length };
  }, [selectedAthlete, startDate, endDate, blocks, blockStartDates, blockEndDates, routineTypes]);

  // Helper to get phase display name
  const getPhaseDisplayName = (phaseValue: string): string => {
    const phaseMap: Record<string, string> = {
      "pre-season": "Pre-Season",
      "in-season": "In-Season",
      "off-season": "Off-Season",
      "playoff": "Playoff",
      "immediate-post-season": "Immediate Post-Season",
      "return-to-training": "Return-to-Training",
      "transition-phase": "Transition Phase",
    };
    return phaseMap[phaseValue] || "Pre-Season";
  };

  // Helper to get training days based on split
  // Returns day indices that should be ACTIVE (not hidden)
  const getTrainingDays = (split: string): number[] => {
    switch (split) {
      case "4":
        return [1, 2, 4, 5]; // Mon, Tue, Thu, Fri
      case "3":
        return [1, 3, 5]; // Mon, Wed, Fri
      case "2":
        return [1, 4]; // Mon, Thu
      default:
        return [1, 2, 4, 5]; // Default to 4-day split
    }
  };

  // Calculate which days should be hidden (default 4-day split)
  const calculatedDaysOff = useMemo(() => {
    const hiddenDays = new Set<number>();
    
    // Sunday is always hidden
    hiddenDays.add(0);
    
    // If we're viewing a specific block in days view, use that block's training split
    if (viewMode === "days" && blocks.length > 0 && blocks[selectedBlockIndex]) {
      const trainingSplit = "4";
      const activeDays = getTrainingDays(trainingSplit);
      
      // Hide all days except the active training days
      for (let day = 1; day <= 6; day++) {
        if (!activeDays.includes(day)) {
          hiddenDays.add(day);
        }
      }
    }
    
    return hiddenDays;
  }, [viewMode, selectedBlockIndex, blocks]);

  // Calculate columns to display based on view mode
  const displayColumns = useMemo(() => {
    if (viewMode === "blocks") {
      return blocks.map((block, index) => {
        // Calculate total days in block
        const totalDays = Math.ceil((block.endDate.getTime() - block.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        // Count training days based on split type
        const splitType = "4";
        const activeTrainingDays = getTrainingDays(splitType);
        let trainingDays = 0;
        let currentDate = new Date(block.startDate);
        
        for (let i = 0; i < totalDays; i++) {
          const dayOfWeek = currentDate.getDay();
          // Count day if it's in the active training days for this split
          if (activeTrainingDays.includes(dayOfWeek)) {
            trainingDays++;
          }
          currentDate = addDays(currentDate, 1);
        }
        
        // Get the phase for this block
        const phaseValue = blockPhases.get(index) || "pre-season";
        const phaseDisplayName = getPhaseDisplayName(phaseValue);
        
        return {
          type: "block" as const,
          index,
          title: block.name,
          subtitle: phaseDisplayName,
          dateRange: `${format(block.startDate, "MM/dd/yy")} - ${format(block.endDate, "MM/dd/yy")}`,
          duration: {
            weeks: differenceInWeeks(block.endDate, block.startDate),
            days: trainingDays,
          },
        };
      });
    } else if (viewMode === "weeks" && blocks.length > 0) {
      // Show weeks for all blocks (Monday to Sunday)
      const weekColumns: Array<{
        type: "week";
        blockIndex: number;
        weekIndex: number;
        title: string;
        subtitle: string;
        dateRange: string;
        startDate: Date;
        endDate: Date;
      }> = [];
      
      blocks.forEach((block, blockIndex) => {
        // Get the phase for this block
        const phaseValue = blockPhases.get(blockIndex) || "pre-season";
        const phaseDisplayName = getPhaseDisplayName(phaseValue);
        
        let currentDate = block.startDate;
        let weekIndex = 0;
        
        while (currentDate <= block.endDate) {
          // Get the Monday of the current week (or start date if it's later)
          const weekMonday = startOfWeek(currentDate, { weekStartsOn: 1 });
          const weekStart = weekMonday < block.startDate ? block.startDate : weekMonday;
          
          // Get the Sunday of the current week (or end date if it's earlier)
          const weekSunday = endOfWeek(currentDate, { weekStartsOn: 1 });
          const weekEnd = weekSunday > block.endDate ? block.endDate : weekSunday;
          
          weekColumns.push({
            type: "week",
            blockIndex,
            weekIndex,
            title: `Week ${weekIndex + 1}`,
            subtitle: `${block.name} ${phaseDisplayName}`,
            dateRange: `${format(weekStart, "MM/dd/yy")} - ${format(weekEnd, "MM/dd/yy")}`,
            startDate: weekStart,
            endDate: weekEnd,
          });
          
          // Move to the next Monday
          currentDate = addDays(weekSunday, 1);
          weekIndex++;
        }
      });
      
      return weekColumns;
    } else if (viewMode === "days" && blocks.length > 0 && blocks[selectedBlockIndex]) {
      // Show days for the selected week (Monday to Sunday), only showing days that exist
      const block = blocks[selectedBlockIndex];
      
      // Calculate which week we're on
      let currentDate = block.startDate;
      let targetWeekStart = block.startDate;
      let targetWeekEnd = block.endDate;
      
      for (let i = 0; i <= selectedDayWeekIndex; i++) {
        const weekMonday = startOfWeek(currentDate, { weekStartsOn: 1 });
        targetWeekStart = weekMonday < block.startDate ? block.startDate : weekMonday;
        
        const weekSunday = endOfWeek(currentDate, { weekStartsOn: 1 });
        targetWeekEnd = weekSunday > block.endDate ? block.endDate : weekSunday;
        
        if (i < selectedDayWeekIndex) {
          currentDate = addDays(weekSunday, 1);
        }
      }
      
      // Day names (Monday = 1, Sunday = 0)
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      
      // Generate columns for each day in the week, but filter to only show days within the block
      const allDays = Array.from({ length: 7 }).map((_, dayIndex) => {
        // Map dayIndex to actual day: Monday=0 -> getDay()=1, Sunday=6 -> getDay()=0
        const actualDayOfWeek = dayIndex === 6 ? 0 : dayIndex + 1;
        
        // Find the date for this day in the target week
        const monday = startOfWeek(targetWeekStart, { weekStartsOn: 1 });
        const day = addDays(monday, dayIndex);
        
        return {
          type: "day" as const,
          index: actualDayOfWeek, // Use actual day of week (0=Sunday, 1=Monday, etc.) for daysOff checking
          title: dayNames[actualDayOfWeek],
          subtitle: `Week ${selectedDayWeekIndex + 1}`,
          dateRange: format(day, "MM/dd/yy"),
          date: day,
          isInBlock: isWithinInterval(day, { start: block.startDate, end: block.endDate }),
        };
      });
      
      // Filter to only show days that are within the block
      return allDays.filter(day => day.isInBlock);
    }
    
    return [];
  }, [viewMode, blocks, selectedBlockIndex, selectedWeekIndex, selectedDayWeekIndex, daysOff, blockPhases]);

  // Helper functions for managing routine settings hierarchy
  
  // Get the value for a specific cell (block/week/day)
  const getCellValue = (
    routine: keyof RoutineSettings,
    field: string,
    blockIndex: number,
    weekIndex?: number,
    dayIndex?: number
  ): string | undefined => {
    // Check for day-level override first (most specific)
    if (dayIndex !== undefined && weekIndex !== undefined) {
      const dayOverride = settingsOverrides.find(
        o => o.blockIndex === blockIndex && 
             o.weekIndex === weekIndex && 
             o.dayIndex === dayIndex && 
             o.routine === routine && 
             o.field === field
      );
      if (dayOverride) return dayOverride.value;
    }
    
    // Check for week-level override
    if (weekIndex !== undefined) {
      const weekOverride = settingsOverrides.find(
        o => o.blockIndex === blockIndex && 
             o.weekIndex === weekIndex && 
             o.dayIndex === undefined && 
             o.routine === routine && 
             o.field === field
      );
      if (weekOverride) return weekOverride.value;
    }
    
    // Fall back to block-level setting
    const blockSetting = blockSettings.get(blockIndex);
    return blockSetting?.[routine]?.[field as keyof typeof blockSetting[typeof routine]];
  };
  
  // Check if a cell has been overridden at a lower level
  const hasOverrides = (
    routine: keyof RoutineSettings,
    field: string,
    blockIndex: number,
    level: SettingsLevel
  ): boolean => {
    if (level === "block") {
      // Check if any week or day in this block has overrides
      return settingsOverrides.some(
        o => o.blockIndex === blockIndex && 
             o.routine === routine && 
             o.field === field
      );
    } else if (level === "week") {
      // Check if any day in this week has overrides
      const column = displayColumns.find(c => c.type === "week" && c.blockIndex === blockIndex);
      if (!column || column.type !== "week") return false;
      
      return settingsOverrides.some(
        o => o.blockIndex === blockIndex && 
             o.weekIndex === column.weekIndex && 
             o.dayIndex !== undefined &&
             o.routine === routine && 
             o.field === field
      );
    }
    return false;
  };
  
  // Handle value change with override checking
  const handleValueChange = (
    routine: keyof RoutineSettings,
    field: string,
    value: string,
    blockIndex: number,
    weekIndex?: number,
    dayIndex?: number,
    level: SettingsLevel = "block"
  ) => {
    // If changing at block level, check for overrides
    if (level === "block") {
      const overridesCount = settingsOverrides.filter(
        o => o.blockIndex === blockIndex && 
             o.routine === routine && 
             o.field === field
      ).length;
      
      if (overridesCount > 0) {
        // Show confirmation dialog
        setConfirmDialog({
          open: true,
          routine,
          field,
          newValue: value,
          blockIndex,
          affectedCount: overridesCount,
        });
        return;
      }
    }
    
    // Apply the change
    applyValueChange(routine, field, value, blockIndex, weekIndex, dayIndex, level);
  };
  
  // Apply value change and manage overrides
  const applyValueChange = (
    routine: keyof RoutineSettings,
    field: string,
    value: string,
    blockIndex: number,
    weekIndex?: number,
    dayIndex?: number,
    level: SettingsLevel = "block"
  ) => {
    if (level === "block") {
      // Update block-level settings
      setBlockSettings(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(blockIndex) || {};
        newMap.set(blockIndex, {
          ...existing,
          [routine]: {
            ...existing[routine],
            [field]: value,
          },
        });
        return newMap;
      });
      
      // Remove all overrides for this field in this block
      setSettingsOverrides(prev =>
        prev.filter(
          o => !(o.blockIndex === blockIndex && o.routine === routine && o.field === field)
        )
      );
    } else if (level === "week" && weekIndex !== undefined) {
      // Add/update week-level override
      setSettingsOverrides(prev => {
        const filtered = prev.filter(
          o => !(o.blockIndex === blockIndex && 
                 o.weekIndex === weekIndex && 
                 o.dayIndex === undefined &&
                 o.routine === routine && 
                 o.field === field)
        );
        return [
          ...filtered,
          { blockIndex, weekIndex, level, routine, field, value },
        ];
      });
    } else if (level === "day" && weekIndex !== undefined && dayIndex !== undefined) {
      // Add/update day-level override
      setSettingsOverrides(prev => {
        const filtered = prev.filter(
          o => !(o.blockIndex === blockIndex && 
                 o.weekIndex === weekIndex && 
                 o.dayIndex === dayIndex &&
                 o.routine === routine && 
                 o.field === field)
        );
        return [
          ...filtered,
          { blockIndex, weekIndex, dayIndex, level, routine, field, value },
        ];
      });
    }
  };
  
  // Confirm and apply block-level change, removing overrides
  const confirmBlockChange = () => {
    if (confirmDialog.routine && confirmDialog.field && confirmDialog.newValue !== null && confirmDialog.blockIndex !== null) {
      applyValueChange(
        confirmDialog.routine,
        confirmDialog.field,
        confirmDialog.newValue,
        confirmDialog.blockIndex
      );
    }
    setConfirmDialog({
      open: false,
      routine: null,
      field: null,
      newValue: null,
      blockIndex: null,
      affectedCount: 0,
    });
  };

  // Helper functions for Step 3 (Review)
  const getLiftingDayKey = (weekIndex: number, dayIndex: number) => `w${weekIndex}-d${dayIndex}`;
  
  const getLiftingDayData = (weekIndex: number, dayIndex: number): LiftingDayData => {
    const key = getLiftingDayKey(weekIndex, dayIndex);
    return liftingData.get(key) || {
      focus: "Non-specific",
      emphasis: "Restorative",
      preparatory: {
        p1: { exercises: [] },
        p2: { exercises: [] },
        p3: { exercises: [] },
        p4: { exercises: [] },
      },
    };
  };
  
  const updateLiftingDayData = (weekIndex: number, dayIndex: number, data: Partial<LiftingDayData>) => {
    const key = getLiftingDayKey(weekIndex, dayIndex);
    const existing = getLiftingDayData(weekIndex, dayIndex);
    setLiftingData(prev => {
      const newMap = new Map(prev);
      newMap.set(key, { ...existing, ...data });
      return newMap;
    });
  };
  
  const shuffleExercise = (weekIndex: number, dayIndex: number, section: keyof LiftingDayData['preparatory'], exerciseIndex: number) => {
    // Mock shuffle - in real app, this would fetch a new exercise from API
    const mockExercises = [
      { targetBodyGroup: "Upper Body [Pressing]", name: "Bench Press" },
      { targetBodyGroup: "Upper Body [Pulling]", name: "Pull-ups" },
      { targetBodyGroup: "Lower Body [Quad]", name: "Back Squat" },
      { targetBodyGroup: "Core", name: "Plank" },
    ];
    
    const randomExercise = mockExercises[Math.floor(Math.random() * mockExercises.length)];
    const key = getLiftingDayKey(weekIndex, dayIndex);
    const dayData = getLiftingDayData(weekIndex, dayIndex);
    const cell = dayData.preparatory[section];
    
    if (cell.exercises[exerciseIndex]) {
      const updatedExercises = [...cell.exercises];
      updatedExercises[exerciseIndex] = {
        ...updatedExercises[exerciseIndex],
        targetBodyGroup: randomExercise.targetBodyGroup,
        name: randomExercise.name,
      };
      
      setLiftingData(prev => {
        const newMap = new Map(prev);
        newMap.set(key, {
          ...dayData,
          preparatory: {
            ...dayData.preparatory,
            [section]: { exercises: updatedExercises },
          },
        });
        return newMap;
      });
    }
  };
  
  const removeExercise = (weekIndex: number, dayIndex: number, section: keyof LiftingDayData['preparatory'], exerciseIndex: number) => {
    const key = getLiftingDayKey(weekIndex, dayIndex);
    const dayData = getLiftingDayData(weekIndex, dayIndex);
    const updatedExercises = dayData.preparatory[section].exercises.filter((_, idx) => idx !== exerciseIndex);
    
    setLiftingData(prev => {
      const newMap = new Map(prev);
      newMap.set(key, {
        ...dayData,
        preparatory: {
          ...dayData.preparatory,
          [section]: { exercises: updatedExercises },
        },
      });
      return newMap;
    });
  };
  
  const clearCell = (weekIndex: number, dayIndex: number, section: keyof LiftingDayData['preparatory']) => {
    const key = getLiftingDayKey(weekIndex, dayIndex);
    const dayData = getLiftingDayData(weekIndex, dayIndex);
    
    setLiftingData(prev => {
      const newMap = new Map(prev);
      newMap.set(key, {
        ...dayData,
        preparatory: {
          ...dayData.preparatory,
          [section]: { exercises: [] },
        },
      });
      return newMap;
    });
  };
  
  const addExercises = (weekIndex: number, dayIndex: number, section: keyof LiftingDayData['preparatory']) => {
    const key = getLiftingDayKey(weekIndex, dayIndex);
    const dayData = getLiftingDayData(weekIndex, dayIndex);
    
    // Generate sample exercises
    const newExercises: Exercise[] = [
      {
        id: `ex1-${key}-${section}`,
        targetBodyGroup: "Upper Body [Pressing]",
        name: "Barbell Bench Press",
        sets: 4,
        reps: 8,
        restTime: "2:00",
        weight: "185 lbs",
        tempo: "3-0-1-0",
      },
      {
        id: `ex2-${key}-${section}`,
        targetBodyGroup: "Upper Body [Pulling]",
        name: "Barbell Row",
        sets: 4,
        reps: 10,
        restTime: "90s",
        weight: "155 lbs",
        tempo: "2-0-1-0",
      },
    ];
    
    setLiftingData(prev => {
      const newMap = new Map(prev);
      newMap.set(key, {
        ...dayData,
        preparatory: {
          ...dayData.preparatory,
          [section]: { exercises: newExercises },
        },
      });
      return newMap;
    });
  };
  
  // Initialize sample exercises for demo
  const initializeSampleExercises = (weekIndex: number, dayIndex: number) => {
    const key = getLiftingDayKey(weekIndex, dayIndex);
    if (liftingData.has(key)) return; // Already initialized
    
    const sampleExercises: Exercise[] = [
      {
        id: `ex1-${key}`,
        targetBodyGroup: "Upper Body [Pressing]",
        name: "Barbell Bench Press",
        sets: 4,
        reps: 8,
        restTime: "2:00",
        weight: "185 lbs",
        tempo: "3-0-1-0",
      },
      {
        id: `ex2-${key}`,
        targetBodyGroup: "Upper Body [Pulling]",
        name: "Barbell Row",
        sets: 4,
        reps: 10,
        restTime: "90s",
        weight: "155 lbs",
        tempo: "2-0-1-0",
      },
    ];
    
    setLiftingData(prev => {
      const newMap = new Map(prev);
      newMap.set(key, {
        focus: "Non-specific",
        emphasis: "Restorative",
        preparatory: {
          p1: { exercises: sampleExercises },
          p2: { exercises: [] },
          p3: { exercises: [] },
          p4: { exercises: [] },
        },
      });
      return newMap;
    });
  };

  return (
    <div className="min-h-screen bg-surface-base">
      <div className="sticky top-0 z-50 border-b bg-surface-base">
        <div className="flex h-16 items-center justify-between px-5">
          {/* Left side: Title and Step Tabs */}
            <div className="flex items-center gap-4">
            <h1 className="text-xs font-medium text-foreground" data-testid="text-page-title">
              New program
            </h1>
            <span className="text-xs font-medium text-muted-foreground" data-testid="text-program-id">
              {programId}
            </span>
            
            {/* Step Tabs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={cn(
                  "rounded-md px-4 py-2 text-xs font-medium transition-colors",
                  currentStep === 1
                    ? "bg-muted text-foreground"
                    : "text-foreground hover:bg-muted/50"
                )}
                data-testid="tab-step-1"
              >
                1. Settings
              </button>
              <button
                type="button"
                onClick={() => isStep1Complete && setCurrentStep(2)}
                disabled={!isStep1Complete}
                className={cn(
                  "rounded-md px-4 py-2 text-xs font-medium transition-colors flex items-center gap-2",
                  currentStep === 2
                    ? "bg-muted text-foreground"
                    : isStep1Complete
                    ? "text-foreground hover:bg-muted/50"
                    : "text-muted-foreground cursor-not-allowed opacity-50"
                )}
                data-testid="tab-step-2"
              >
                {!isStep1Complete && <Lock className="h-3.5 w-3.5" />}
                2. Configuration
              </button>
              <button
                type="button"
                onClick={() => isStep1Complete && setCurrentStep(3)}
                disabled={!isStep1Complete}
                className={cn(
                  "rounded-md px-4 py-2 text-xs font-medium transition-colors flex items-center gap-2",
                  currentStep === 3
                    ? "bg-muted text-foreground"
                    : isStep1Complete
                    ? "text-foreground hover:bg-muted/50"
                    : "text-muted-foreground cursor-not-allowed opacity-50"
                )}
                data-testid="tab-step-3"
              >
                {!isStep1Complete && <Lock className="h-3.5 w-3.5" />}
                3. Review
              </button>
            </div>
          </div>

          {/* Right side: Action Buttons */}
          <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (issues.total > 0) {
                    setIssueModalOpen(true);
                  } else {
                    setLocation("/");
                  }
                }}
                data-testid="button-save-back"
                className="relative"
              >
                Save & back
                {issues.total > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {issues.total}
                  </span>
                )}
              </Button>
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={currentStep === 1 && !isStep1Complete}
                data-testid="button-next"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                form="program-form"
                disabled={createProgramMutation.isPending || selectedAthlete?.status === "not cleared"}
                data-testid="button-submit"
              >
                {createProgramMutation.isPending ? "Publishing..." : "Publish"}
              </Button>
            )}
            </div>
          </div>
        </div>

      {/* Step 2 Sub-Header */}
      {currentStep === 2 && (
        <div className="sticky top-16 z-40 border-b bg-surface-base">
          <div className="flex h-16 items-center justify-between px-5">
            {/* Left side: View Mode Tabs */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-foreground">View by</span>
              
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(value) => value && setViewMode(value as "blocks" | "weeks")}
                variant="segmented"
              >
                <ToggleGroupItem value="blocks" aria-label="View by block" data-testid="view-blocks">
                  By Block
                </ToggleGroupItem>
                <ToggleGroupItem value="weeks" aria-label="View by week" data-testid="view-weeks">
                  By Week
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Right side: Block Navigation Arrows */}
            {viewMode === "blocks" && blocks.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setSelectedBlockIndex(Math.max(0, selectedBlockIndex - 1))}
                  disabled={selectedBlockIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground min-w-[100px] text-center">
                  Block {selectedBlockIndex + 1} of {blocks.length}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setSelectedBlockIndex(Math.min(blocks.length - 1, selectedBlockIndex + 1))}
                  disabled={selectedBlockIndex >= blocks.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="px-5">
        <Form {...form}>
          <form id="program-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Step 1: General Settings */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 py-[20px]">
                {/* Left: Form + Blocks table (40% - 2 columns) */}
                <div className="lg:col-span-2 space-y-6">
                <FormField
                  control={form.control}
                  name="athleteId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Athlete</FormLabel>
                      <Popover
                        open={athleteComboboxOpen}
                        onOpenChange={setAthleteComboboxOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <button
                              type="button"
                              role="combobox"
                              aria-expanded={athleteComboboxOpen}
                              className={cn(
                                "flex h-8 w-full items-center justify-between rounded-lg border border-[#292928] bg-transparent px-3 py-2 text-xs text-[#f7f6f2] font-['Montserrat'] ring-offset-background placeholder:text-[#979795] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-[#f7f6f2] disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
                                !selectedAthlete && "text-[#979795]"
                              )}
                              data-testid="button-athlete-select"
                            >
                              <span className="text-left">
                                {selectedAthlete
                                  ? selectedAthlete.name
                                  : "Select athlete..."}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder="Search athletes..."
                              data-testid="input-athlete-search"
                            />
                            <CommandList>
                              <CommandEmpty>No athlete found.</CommandEmpty>
                              <CommandGroup>
                                {mockAthletes.map((athlete) => (
                                  <CommandItem
                                    key={athlete.id}
                                    value={athlete.name}
                                    onSelect={() => {
                                      field.onChange(athlete.id);
                                      setAthleteComboboxOpen(false);
                                    }}
                                    data-testid={`option-athlete-${athlete.id}`}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedAthleteId === athlete.id
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {athlete.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Athlete Profile Card */}
                {selectedAthlete && (
                  <div className="border border-[#292928] rounded-lg p-4 bg-[#171716] space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center gap-3">
                        {selectedAthlete.photo ? (
                          <img src={selectedAthlete.photo} alt={selectedAthlete.name} className="w-12 h-12 rounded-full" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#292928] flex items-center justify-center text-[#f7f6f2] font-semibold">
                            {selectedAthlete.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-[#f7f6f2] font-['Montserrat']">{selectedAthlete.name}</h3>
                          {selectedAthlete.location && (
                            <p className="text-xs text-[#979795] font-['Montserrat']">{selectedAthlete.location}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedAthlete.status && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#979795] font-['Montserrat']">Status:</span>
                        {selectedAthlete.status === "cleared" ? (
                          <Badge variant="default" icon={<Check className="h-3 w-3" />}>
                            Cleared
                          </Badge>
                        ) : selectedAthlete.status === "not cleared" ? (
                          <Badge variant="secondary" icon={<AlertTriangle className="h-3 w-3" />}>
                            Not Cleared
                          </Badge>
                        ) : (
                          <Badge variant="destructive" icon={<AlertTriangle className="h-3 w-3" />}>
                            Injured
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {selectedAthlete.position && (
                        <div>
                          <span className="text-[#979795] font-['Montserrat']">Position:</span>
                          <span className="ml-2 text-[#f7f6f2] font-['Montserrat']">{selectedAthlete.position}</span>
                        </div>
                      )}
                      {selectedAthlete.age && (
                        <div>
                          <span className="text-[#979795] font-['Montserrat']">Age:</span>
                          <span className="ml-2 text-[#f7f6f2] font-['Montserrat']">{selectedAthlete.age}</span>
                        </div>
                      )}
                      {selectedAthlete.height && (
                        <div>
                          <span className="text-[#979795] font-['Montserrat']">Height:</span>
                          <span className="ml-2 text-[#f7f6f2] font-['Montserrat']">{selectedAthlete.height}</span>
                        </div>
                      )}
                      {selectedAthlete.weight && (
                        <div>
                          <span className="text-[#979795] font-['Montserrat']">Weight:</span>
                          <span className="ml-2 text-[#f7f6f2] font-['Montserrat']">{selectedAthlete.weight}</span>
                        </div>
                      )}
                      {selectedAthlete.levelOfPlay && (
                        <div>
                          <span className="text-[#979795] font-['Montserrat']">Level:</span>
                          <span className="ml-2 text-[#f7f6f2] font-['Montserrat']">{selectedAthlete.levelOfPlay}</span>
                        </div>
                      )}
                      {selectedAthlete.team && (
                        <div>
                          <span className="text-[#979795] font-['Montserrat']">Team:</span>
                          <span className="ml-2 text-[#f7f6f2] font-['Montserrat']">{selectedAthlete.team}</span>
                        </div>
                      )}
                      {selectedAthlete.league && (
                        <div>
                          <span className="text-[#979795] font-['Montserrat']">League:</span>
                          <span className="ml-2 text-[#f7f6f2] font-['Montserrat']">{selectedAthlete.league}</span>
                        </div>
                      )}
                      {selectedAthlete.season && (
                        <div>
                          <span className="text-[#979795] font-['Montserrat']">Season:</span>
                          <span className="ml-2 text-[#f7f6f2] font-['Montserrat']">{selectedAthlete.season}</span>
                        </div>
                      )}
                      {selectedAthlete.xRole && (
                        <div>
                          <span className="text-[#979795] font-['Montserrat']">Role:</span>
                          <span className="ml-2 text-[#f7f6f2] font-['Montserrat']">{selectedAthlete.xRole}</span>
                        </div>
                      )}
                    </div>

                    {selectedAthlete.availability && (
                      <div className="pt-2 border-t border-[#292928]">
                        <span className="text-xs text-[#979795] font-['Montserrat']">Availability:</span>
                        <span className="ml-2 text-xs text-[#f7f6f2] font-['Montserrat']">{selectedAthlete.availability}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Validation Warnings */}
                {selectedAthlete?.status === "not cleared" && (
                  <Alert variant="destructive" className="border-red-500 bg-red-500/10">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="font-['Montserrat']">
                      Program creation is blocked for athletes with "Not cleared" status.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Phase End Date Warning */}
                {selectedAthlete?.phaseEndDate && endDate && (() => {
                  const phaseEnd = new Date(selectedAthlete.phaseEndDate);
                  const programEnd = endDate;
                  if (programEnd > phaseEnd) {
                    return (
                      <Alert className="border-yellow-500 bg-yellow-500/10">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <AlertDescription className="font-['Montserrat']">
                          Warning: New program extends beyond current Phase End Date ({format(phaseEnd, "MMM d, yyyy")}).
                        </AlertDescription>
                      </Alert>
                    );
                  }
                  return null;
                })()}

                {/* Build Type */}
                <FormField
                  control={form.control}
                  name="buildType"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Build Type</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-3 gap-3">
                          {buildTypeOptions.map((option) => {
                            const isSelected = field.value === option.id;
                            return (
                              <TooltipProvider key={option.id}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        field.onChange(option.id);
                                      }}
                                      className={cn(
                                        "flex items-center justify-between rounded-lg border h-10 px-4 transition-colors w-full",
                                        isSelected
                                          ? "border-transparent bg-[#292928] text-[#f7f6f2]"
                                          : "border-[#292928] bg-transparent text-[#979795] hover:border-[#292928] hover:bg-[#171716]"
                                      )}
                                      data-testid={`build-type-card-${option.id}`}
                                    >
                                      <span className="text-xs font-['Montserrat'] font-medium text-left">
                                        {option.label}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <Info className="h-4 w-4 shrink-0 text-[#979795]" />
                                        {isSelected && (
                                          <Check className="h-4 w-4 shrink-0 text-[#f7f6f2]" />
                                        )}
                                      </div>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="font-['Montserrat']">{option.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          })}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Routine Type */}
                <FormField
                  control={form.control}
                  name="routineTypes"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Routine type</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-4 gap-3">
                          {routineTypeOptions.map((option) => {
                            const isSelected = field.value.includes(option.id);
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => {
                                  const isSelected = field.value.includes(option.id);
                                  field.onChange(
                                    isSelected
                                      ? field.value.filter((val) => val !== option.id)
                                      : [...field.value, option.id]
                                  );
                                }}
                                className={cn(
                                  "flex items-center justify-between rounded-lg border h-10 px-4 transition-colors w-full",
                                  isSelected
                                    ? "border-transparent bg-[#292928] text-[#f7f6f2]"
                                    : "border-[#292928] bg-transparent text-[#979795] hover:border-[#292928] hover:bg-[#171716]"
                                )}
                                data-testid={`routine-card-${option.id}`}
                              >
                                <span className="text-xs font-['Montserrat'] font-medium text-left">
                                  {option.label}
                                </span>
                                {isSelected && (
                                  <Check className="h-4 w-4 shrink-0 text-[#f7f6f2]" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Start Date */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <button
                                type="button"
                                className={cn(
                                  "flex h-8 w-full items-center justify-start rounded-lg border border-[#292928] bg-transparent px-3 py-2 text-xs text-[#f7f6f2] font-['Montserrat'] ring-offset-background placeholder:text-[#979795] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-[#f7f6f2] disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
                                  !field.value && "text-[#979795]"
                                )}
                                data-testid="button-start-date"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                                <span className="text-left">
                                  {field.value
                                    ? format(field.value, "MMM dd, yyyy")
                                    : "Pick start date"}
                                </span>
                              </button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                if (!date) return;
                                
                                // Check if date is in past (blocked, no override)
                                if (isDateInPast(date)) {
                                  return;
                                }
                                
                                // Check if date is Monday (required for program start)
                                const dayOfWeek = date.getDay();
                                if (dayOfWeek !== 1) {
                                  // Auto-correct to next Monday
                                  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
                                  const nextMonday = addDays(date, daysUntilMonday);
                                  date = nextMonday;
                                }
                                
                                // Check if date is in active programming (requires override)
                                const { blocked, program } = isDateInActiveProgramming(date);
                                if (blocked && program) {
                                  setOverrideConfirmation({
                                    show: true,
                                    programId: program.programId,
                                    startDate: new Date(program.startDate),
                                    endDate: new Date(program.endDate),
                                    onConfirm: () => {
                                      field.onChange(date);
                                      if (date) {
                                        setCalendarMonth(date);
                                      }
                                      setOverrideConfirmation({ show: false });
                                    },
                                  });
                                  return;
                                }
                                
                                // Date is valid, set it
                                field.onChange(date);
                                if (date) {
                                  setCalendarMonth(date);
                                }
                              }}
                              disabled={(date) => {
                                // Block past dates
                                if (isDateInPast(date)) return true;
                                
                                // Block non-Monday dates (programs must start on Monday)
                                const dayOfWeek = date.getDay();
                                return dayOfWeek !== 1;
                              }}
                              modifiers={{
                                today: new Date(),
                                monday: (() => {
                                  // Generate all future Mondays for highlighting
                                  const mondays: Date[] = [];
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  let current = new Date(today);
                                  const dayOfWeek = current.getDay();
                                  const daysUntilMonday = dayOfWeek === 0 ? 1 : (dayOfWeek === 1 ? 0 : (8 - dayOfWeek));
                                  if (daysUntilMonday > 0) {
                                    current = addDays(current, daysUntilMonday);
                                  }
                                  // Generate next 12 months of Mondays
                                  for (let i = 0; i < 52; i++) {
                                    mondays.push(new Date(current));
                                    current = addDays(current, 7);
                                  }
                                  return mondays;
                                })(),
                                recommended: calculateDefaultStartDate ? [calculateDefaultStartDate] : [],
                                hasProgramming: activePrograms.flatMap((p) => {
                                  const start = new Date(p.startDate);
                                  const end = new Date(p.endDate);
                                  const dates: Date[] = [];
                                  let current = new Date(start);
                                  while (current <= end) {
                                    dates.push(new Date(current));
                                    current = addDays(current, 1);
                                  }
                                  return dates;
                                }),
                              }}
                              modifiersClassNames={{
                                today: "font-bold border-2 border-[#f7f6f2]",
                                monday: "bg-green-500/20 border border-green-500",
                                recommended: "bg-green-500/20 border border-green-500",
                                hasProgramming: "bg-[#292928] line-through",
                              }}
                              classNames={{
                                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                day_disabled: "opacity-30 cursor-not-allowed",
                              }}
                              initialFocus
                              data-testid="calendar-start-date"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Duration and End Date in one row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Duration in weeks */}
                    <FormField
                      control={form.control}
                      name="programDuration"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Duration (weeks)</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newValue = Math.max(MIN_PROGRAM_DURATION, (field.value || DEFAULT_PROGRAM_DURATION) - 1);
                                  field.onChange(newValue);
                                }}
                                disabled={(field.value || DEFAULT_PROGRAM_DURATION) <= MIN_PROGRAM_DURATION}
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                min={MIN_PROGRAM_DURATION}
                                max={MAX_PROGRAM_DURATION}
                                value={field.value || DEFAULT_PROGRAM_DURATION}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || MIN_PROGRAM_DURATION;
                                  const clampedValue = Math.max(MIN_PROGRAM_DURATION, Math.min(MAX_PROGRAM_DURATION, value));
                                  field.onChange(clampedValue);
                                }}
                                className="flex-1 text-center"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newValue = Math.min(MAX_PROGRAM_DURATION, (field.value || DEFAULT_PROGRAM_DURATION) + 1);
                                  field.onChange(newValue);
                                }}
                                disabled={(field.value || DEFAULT_PROGRAM_DURATION) >= MAX_PROGRAM_DURATION}
                              >
                                +
                              </Button>
                            </div>
                          </FormControl>
                          <div className="text-xs text-[#979795] font-['Montserrat'] mt-1">
                            Min: {MIN_PROGRAM_DURATION} week, Max: {MAX_PROGRAM_DURATION} weeks
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* End Date */}
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <button
                                  type="button"
                                  className={cn(
                                    "flex h-8 w-full items-center justify-start rounded-lg border border-[#292928] bg-transparent px-3 py-2 text-xs text-[#f7f6f2] font-['Montserrat'] ring-offset-background placeholder:text-[#979795] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-[#f7f6f2] disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
                                    !field.value && "text-[#979795]"
                                  )}
                                  data-testid="button-end-date"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                                  <span className="text-left">
                                    {field.value
                                      ? format(field.value, "MMM dd, yyyy")
                                      : "Pick end date"}
                                  </span>
                                </button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  if (!date || !startDate) return;
                                  
                                  // Check if date is before start date
                                  if (date < startDate) {
                                    return;
                                  }
                                  
                                  // Check if duration would be < 1 week or > 16 weeks
                                  const duration = differenceInWeeks(date, startDate) + 1;
                                  if (duration < MIN_PROGRAM_DURATION || duration > MAX_PROGRAM_DURATION) {
                                    return;
                                  }
                                  
                                  field.onChange(date);
                                  if (date && date < calendarMonth) {
                                    // keep month in visible range
                                    setCalendarMonth(date);
                                  }
                                }}
                                disabled={(date) => {
                                  if (!startDate) return true;
                                  // Block dates before start date
                                  if (date < startDate) return true;
                                  // Block dates that result in invalid duration
                                  const duration = differenceInWeeks(date, startDate) + 1;
                                  return duration < MIN_PROGRAM_DURATION || duration > MAX_PROGRAM_DURATION;
                                }}
                                modifiers={{
                                  recommended: startDate ? [addDays(addWeeks(startDate, DEFAULT_PROGRAM_DURATION), -1)] : [],
                                  phaseEnd: selectedAthlete?.phaseEndDate ? [new Date(selectedAthlete.phaseEndDate)] : [],
                                }}
                                modifiersClassNames={{
                                  recommended: "bg-green-500/20 border border-green-500",
                                  phaseEnd: "border-2 border-red-500",
                                }}
                                initialFocus
                                data-testid="calendar-end-date"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                {/* Programming History */}
                {selectedAthleteId && athletePrograms.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-[#f7f6f2] font-['Montserrat']">Programming History</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {athletePrograms.map((program) => {
                        const programStart = new Date(program.startDate);
                        const programEnd = new Date(program.endDate);
                        const today = new Date();
                        const isPast = programEnd < today;
                        const isCurrent = programStart <= today && programEnd >= today;
                        const overlapsWithNew = startDate && (
                          (programStart <= startDate && programEnd >= startDate) ||
                          (programStart <= endDate && programEnd >= endDate) ||
                          (programStart >= startDate && programEnd <= endDate)
                        );
                        
                        return (
                          <div
                            key={program.id}
                            className={cn(
                              "border rounded-lg p-3 text-xs",
                              overlapsWithNew ? "border-yellow-500 bg-yellow-500/10" : "border-[#292928] bg-[#171716]",
                              isCurrent && "border-blue-500 bg-blue-500/10"
                            )}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-[#f7f6f2] font-['Montserrat']">{program.programId}</span>
                              <Badge variant={isPast ? "tertiary" : "default"} className="text-xs">
                                {isPast ? "Past" : isCurrent ? "Current" : "Upcoming"}
                              </Badge>
                            </div>
                            <div className="text-[#979795] font-['Montserrat'] text-xs">
                              {format(programStart, "MMM d, yyyy")} - {format(programEnd, "MMM d, yyyy")}
                            </div>
                            {overlapsWithNew && (
                              <div className="mt-2 text-xs text-yellow-500 font-['Montserrat'] flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Overlaps with proposed program
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Validation Messages */}
                {startDate && endDate && selectedAthlete?.phaseEndDate && (() => {
                  const phaseEnd = new Date(selectedAthlete.phaseEndDate);
                  if (endDate > phaseEnd) {
                    return (
                      <Alert className="border-yellow-500 bg-yellow-500/10 mt-4">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <AlertDescription className="font-['Montserrat']">
                          Warning: Program extends beyond Phase end date ({format(phaseEnd, "MMM d, yyyy")}).
                        </AlertDescription>
                      </Alert>
                    );
                  }
                  return null;
                })()}

                {selectedAthleteId && activePrograms.length > 0 && startDate && (() => {
                  const latestEnd = activePrograms.reduce((latest, program) => {
                    const programEnd = new Date(program.endDate);
                    return programEnd > latest ? programEnd : latest;
                  }, new Date(0));
                  return (
                    <Alert className="border-blue-500 bg-blue-500/10 mt-4">
                      <AlertTriangle className="h-4 w-4 text-blue-500" />
                      <AlertDescription className="font-['Montserrat']">
                        Notice: Existing programming ends {format(latestEnd, "MMM d, yyyy")}.
                      </AlertDescription>
                    </Alert>
                  );
                })()}

                {/* Override Confirmation Modal */}
                <AlertDialog open={overrideConfirmation.show} onOpenChange={(open) => {
                  if (!open) {
                    setOverrideConfirmation({ show: false });
                  }
                }}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-['Montserrat']">Override Existing Programming?</AlertDialogTitle>
                      <AlertDialogDescription className="font-['Montserrat']">
                        This will replace existing programming from {overrideConfirmation.startDate && format(overrideConfirmation.startDate, "MMM d, yyyy")} to {overrideConfirmation.endDate && format(overrideConfirmation.endDate, "MMM d, yyyy")}.
                        <br /><br />
                        Program ID: {overrideConfirmation.programId}
                        <br /><br />
                        Continue?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setOverrideConfirmation({ show: false })}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                        if (overrideConfirmation.onConfirm) {
                          overrideConfirmation.onConfirm();
                        }
                      }}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Issue Resolution Modal */}
                <AlertDialog open={issueModalOpen} onOpenChange={setIssueModalOpen}>
                  <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-['Montserrat']">
                        {issues.blockingIssues.length > 0 
                          ? "Cannot Continue - Issues Found" 
                          : "Review Issues - Warnings Found"}
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-['Montserrat']">
                        {issues.blockingIssues.length > 0
                          ? `Please resolve the following ${issues.blockingIssues.length} blocking issue${issues.blockingIssues.length > 1 ? 's' : ''} before proceeding.`
                          : `Please review the following ${issues.warnings.length} warning${issues.warnings.length > 1 ? 's' : ''}.`}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="space-y-4 mt-4">
                      {/* Blocking Issues */}
                      {issues.blockingIssues.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Blocking Issues ({issues.blockingIssues.length})
                          </h4>
                          <div className="space-y-3">
                            {issues.blockingIssues.map((issue, idx) => (
                              <div key={idx} className="border border-red-500/30 rounded-lg p-3 bg-red-500/10">
                                <div className="flex items-start gap-3">
                                  <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-semibold text-red-400 uppercase">{issue.category}</span>
                                      <span className="text-xs text-muted-foreground">•</span>
                                      <span className="text-xs text-muted-foreground">Affected: {issue.affected}</span>
                                    </div>
                                    <p className="text-xs text-foreground mb-2">{issue.description}</p>
                                    {issue.action && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs"
                                        onClick={() => {
                                          // Handle action based on issue type
                                          if (issue.category === 'Date Validation' && issue.action === 'Adjust to Monday') {
                                            if (startDate) {
                                              const dayOfWeek = startDate.getDay();
                                              if (dayOfWeek !== 1) {
                                                const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
                                                const nextMonday = addDays(startDate, daysUntilMonday);
                                                form.setValue("startDate", nextMonday);
                                              }
                                            }
                                          }
                                          // Add more action handlers as needed
                                        }}
                                      >
                                        {issue.action}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Warnings */}
                      {issues.warnings.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Warnings ({issues.warnings.length})
                          </h4>
                          <div className="space-y-3">
                            {issues.warnings.map((warning, idx) => (
                              <div key={idx} className="border border-yellow-500/30 rounded-lg p-3 bg-yellow-500/10">
                                <div className="flex items-start gap-3">
                                  <Info className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-semibold text-yellow-400 uppercase">{warning.category}</span>
                                      <span className="text-xs text-muted-foreground">•</span>
                                      <span className="text-xs text-muted-foreground">Affected: {warning.affected}</span>
                                    </div>
                                    <p className="text-xs text-foreground mb-2">{warning.description}</p>
                                    {warning.action && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {warning.action}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <AlertDialogFooter className="mt-6">
                      <div className="flex items-center justify-between w-full">
                        <div className="text-xs text-muted-foreground">
                          {issues.blockingIssues.length} Blocking Issue{issues.blockingIssues.length !== 1 ? 's' : ''}, {issues.warnings.length} Warning{issues.warnings.length !== 1 ? 's' : ''}
                        </div>
                        <div className="flex gap-2">
                          <AlertDialogCancel onClick={() => setIssueModalOpen(false)}>
                            Close
                          </AlertDialogCancel>
                          {issues.blockingIssues.length === 0 && (
                            <AlertDialogAction onClick={() => {
                              setIssueModalOpen(false);
                              setLocation("/");
                            }}>
                              Continue Anyway
                            </AlertDialogAction>
                          )}
                        </div>
                      </div>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

              {blocks.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-medium">Program blocks</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Block</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead>Duration (weeks)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {blocks.map((block, index) => {
                          const blockEndDate = blockEndDates.get(index) || block.endDate;
                          const blockStartDate = blockStartDates.get(index) || block.startDate;
                          const endDayOfWeek = blockEndDate.getDay();
                          const isSunday = endDayOfWeek === 0;
                          const isMidWeek = endDayOfWeek !== 0 && endDayOfWeek !== 1;
                          const isRecentlyChanged = recentlyChangedBlocks.has(index);
                          const isSelected = editingBlockIndex === index;
                          
                          // Validation: check if block is invalid
                          const duration = differenceInWeeks(blockEndDate, blockStartDate);
                          const isInvalid = duration < 1 || blockEndDate < blockStartDate;
                          
                          return (
                          <TableRow 
                            key={index} 
                            data-testid={`block-row-${index + 1}`}
                            className={cn(
                              "transition-all",
                              isSelected && "bg-blue-500/10 border-l-2 border-blue-500",
                              isRecentlyChanged && "bg-yellow-500/10 border-l-2 border-yellow-500",
                              isInvalid && "bg-red-500/10 border-l-2 border-red-500",
                              "hover:bg-muted/50"
                            )}
                          >
                            <TableCell className="font-medium" data-testid={`block-name-${index + 1}`}>
                              {block.name}
                            </TableCell>
                            <TableCell data-testid={`block-start-date-${index + 1}`}>
                              <div className="flex h-8 w-full items-center justify-start rounded-lg border border-[#292928] bg-[#292928] px-3 py-2 text-xs text-[#f7f6f2] font-['Montserrat']">
                                {format(blockStartDate, "EEE, MM/dd/yy")}
                              </div>
                            </TableCell>
                            <TableCell data-testid={`block-end-date-${index + 1}`}>
                              <Popover onOpenChange={(open) => open && setEditingBlockIndex(index)}>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className={cn(
                                      "flex h-8 w-full items-center justify-start rounded-lg border px-3 py-2 text-xs font-['Montserrat'] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
                                      isSunday && "border-green-500 bg-green-500/20 text-green-400",
                                      isMidWeek && "border-yellow-500 bg-yellow-500/20 text-yellow-400",
                                      !isSunday && !isMidWeek && "border-[#292928] bg-[#292928] text-[#f7f6f2]",
                                      isInvalid && "border-red-500 bg-red-500/20 text-red-400"
                                    )}
                                  >
                                    {format(blockEndDate, "EEE, MM/dd/yy")}
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={blockEndDates.get(index) || block.endDate}
                                    onSelect={(date) => {
                                      if (!date) return;
                                      
                                      const currentStartDate = blockStartDates.get(index) || block.startDate;
                                      
                                      // End date can't be less than start date
                                      if (date < currentStartDate) {
                                        return;
                                      }
                                      
                                      // End date can't be less than previous block's start date
                                      if (index > 0) {
                                        const prevBlockStartDate = blockStartDates.get(index - 1) || blocks[index - 1].startDate;
                                        if (date < prevBlockStartDate) {
                                          return;
                                        }
                                      }
                                      
                                      // End date can't be more than next block's start date
                                      if (index < blocks.length - 1) {
                                        const nextBlockStartDate = blockStartDates.get(index + 1) || blocks[index + 1].startDate;
                                        if (date >= nextBlockStartDate) {
                                          return;
                                        }
                                      }
                                      
                                      setBlockEndDates(prev => {
                                        const newMap = new Map(prev);
                                        newMap.set(index, date);
                                        
                                        // Mark this block as recently changed
                                        setRecentlyChangedBlocks(prev => new Set(prev).add(index));
                                        setTimeout(() => {
                                          setRecentlyChangedBlocks(prev => {
                                            const newSet = new Set(prev);
                                            newSet.delete(index);
                                            return newSet;
                                          });
                                        }, 2000);
                                        
                                        // Cascade: Update next block's start date to next Monday after this block ends
                                        if (index < blocks.length - 1) {
                                          const dayAfterBlockEnd = addDays(date, 1);
                                          const nextDayOfWeek = dayAfterBlockEnd.getDay();
                                          let nextBlockStart: Date;
                                          
                                          if (nextDayOfWeek === 1) {
                                            // Already Monday
                                            nextBlockStart = dayAfterBlockEnd;
                                          } else {
                                            // Find next Monday
                                            const daysUntilMonday = nextDayOfWeek === 0 ? 1 : (8 - nextDayOfWeek);
                                            nextBlockStart = addDays(dayAfterBlockEnd, daysUntilMonday);
                                          }
                                          
                                          // Update next block's start date
                                          setBlockStartDates(prevStarts => {
                                            const newStartMap = new Map(prevStarts);
                                            newStartMap.set(index + 1, nextBlockStart);
                                            return newStartMap;
                                          });
                                          
                                          // Mark next block as recently changed
                                          setRecentlyChangedBlocks(prev => new Set(prev).add(index + 1));
                                          setTimeout(() => {
                                            setRecentlyChangedBlocks(prev => {
                                              const newSet = new Set(prev);
                                              newSet.delete(index + 1);
                                              return newSet;
                                            });
                                          }, 2000);
                                          
                                          // If next block's end date is now invalid (before start), adjust it
                                          const nextBlockEnd = blockEndDates.get(index + 1) || blocks[index + 1].endDate;
                                          if (nextBlockEnd < nextBlockStart) {
                                            // Extend next block to maintain minimum 1 week, or use program end date
                                            const minEnd = addDays(nextBlockStart, 6); // 1 week minimum
                                            const programEnd = endDate;
                                            const adjustedEnd = minEnd > programEnd ? programEnd : minEnd;
                                            newMap.set(index + 1, adjustedEnd);
                                          }
                                        }
                                        
                                        return newMap;
                                      });
                                    }}
                                    disabled={(date) => {
                                      const currentStartDate = blockStartDates.get(index) || block.startDate;
                                      
                                      // Disable dates before start date
                                      if (date < currentStartDate) return true;
                                      
                                      // Disable dates before previous block's start date
                                      if (index > 0) {
                                        const prevBlockStartDate = blockStartDates.get(index - 1) || blocks[index - 1].startDate;
                                        if (date < prevBlockStartDate) return true;
                                      }
                                      
                                      // Disable dates on or after next block's start date
                                      if (index < blocks.length - 1) {
                                        const nextBlockStartDate = blockStartDates.get(index + 1) || blocks[index + 1].startDate;
                                        if (date >= nextBlockStartDate) return true;
                                      }
                                      
                                      return false;
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </TableCell>
                            <TableCell data-testid={`block-duration-${index + 1}`}>
                              <div className={cn(
                                "text-xs",
                                isInvalid && "text-red-400",
                                !isInvalid && "text-muted-foreground"
                              )}>
                                {duration} weeks
                              </div>
                            </TableCell>
                          </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Validation Messages */}
                  {(() => {
                    const validationErrors: string[] = [];
                    const validationWarnings: string[] = [];
                    
                    blocks.forEach((block, index) => {
                      const blockEndDate = blockEndDates.get(index) || block.endDate;
                      const blockStartDate = blockStartDates.get(index) || block.startDate;
                      const duration = differenceInWeeks(blockEndDate, blockStartDate);
                      
                      if (duration < 1) {
                        validationErrors.push(`Block ${index + 1} duration is less than 1 week`);
                      }
                      
                      if (blockEndDate < blockStartDate) {
                        validationErrors.push(`Block ${index + 1} end date is before start date`);
                      }
                      
                      const endDayOfWeek = blockEndDate.getDay();
                      if (endDayOfWeek !== 0 && endDayOfWeek !== 1 && index < blocks.length - 1) {
                        const daysUntilMonday = endDayOfWeek === 0 ? 1 : (8 - endDayOfWeek);
                        const nextMonday = addDays(blockEndDate, daysUntilMonday);
                        validationWarnings.push(`Block ${index + 1} ends mid-week. Next block will start on ${format(nextMonday, "EEE, MMM d")}`);
                      }
                      
                      if (duration < 4 && duration >= 1) {
                        validationWarnings.push(`Block ${index + 1} is shorter than recommended 4 weeks`);
                      }
                    });
                    
                    if (validationErrors.length === 0 && validationWarnings.length === 0) {
                      return null;
                    }
                    
                    return (
                      <div className="space-y-2 mt-4">
                        {validationErrors.map((error, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-red-400">
                            <AlertTriangle className="h-4 w-4" />
                            <span>{error}</span>
                          </div>
                        ))}
                        {validationWarnings.map((warning, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-yellow-400">
                            <Info className="h-4 w-4" />
                            <span>{warning}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
              </div>

                {/* Right: Monthly Calendar Visualization (60% - 3 columns) */}
                <div className="lg:col-span-3 lg:sticky lg:top-16">
                  <div className="rounded-md border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setCalendarMonth((prev) => addMonths(prev, -1))}
                        aria-label="Previous month"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="text-xs font-medium">
                        {format(calendarMonth, "MMMM yyyy")}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setCalendarMonth((prev) => addMonths(prev, 1))}
                        aria-label="Next month"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 gap-1 text-[11px] text-muted-foreground mb-1">
                      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
                        <div key={d} className="text-center py-1">{d}</div>
                      ))}
                    </div>

                    {/* Month grid with large cells */}
                    <div className="grid grid-cols-7 gap-1">
                      {(() => {
                        const start = startOfWeek(startOfMonth(calendarMonth), { weekStartsOn: 0 });
                        const end = endOfWeek(endOfMonth(calendarMonth), { weekStartsOn: 0 });
                        const days: Date[] = [];
                        let cursor = new Date(start);
                        while (cursor <= end) {
                          days.push(new Date(cursor));
                          cursor = addDays(cursor, 1);
                        }

                        // All blocks use the same color
                        const blockColor = "bg-blue-500";

                        const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

                        // Get key dates for the calendar
                        const getKeyDates = () => {
                          const currentYear = new Date().getFullYear();
                          const eventTypes = ["Game", "Assessment", "Training"] as const;
                          const eventLabels: Record<string, string[]> = {
                            Game: ["Game Day", "Championship Game", "Regular Season Game", "Playoff Game"],
                            Assessment: ["Performance Assessment", "Fitness Test", "Medical Assessment"],
                            Training: ["Training Camp", "Intensive Training", "Recovery Session"],
                          };

                          const generateRandomDate = (month: number, year: number) => {
                            const daysInMonth = new Date(year, month + 1, 0).getDate();
                            const day = Math.floor(Math.random() * daysInMonth) + 1;
                            return new Date(year, month, day);
                          };

                          const mockEvents: Array<{ date: Date; type: string; label: string }> = [];
                          
                          // November events (month 10)
                          for (let i = 0; i < 4; i++) {
                            const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                            const labels = eventLabels[type];
                            mockEvents.push({
                              date: generateRandomDate(10, currentYear),
                              type,
                              label: labels[Math.floor(Math.random() * labels.length)],
                            });
                          }

                          // December events (month 11)
                          for (let i = 0; i < 5; i++) {
                            const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                            const labels = eventLabels[type];
                            mockEvents.push({
                              date: generateRandomDate(11, currentYear),
                              type,
                              label: labels[Math.floor(Math.random() * labels.length)],
                            });
                          }

                          // January events (month 0)
                          for (let i = 0; i < 4; i++) {
                            const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                            const labels = eventLabels[type];
                            mockEvents.push({
                              date: generateRandomDate(0, currentYear),
                              type,
                              label: labels[Math.floor(Math.random() * labels.length)],
                            });
                          }

                          // Remove duplicates
                          return Array.from(
                            new Map(mockEvents.map(event => [event.date.getTime(), event])).values()
                          );
                        };

                        // Only get key dates if athlete is selected
                        const keyDates = selectedAthleteId ? getKeyDates() : [];

                        return days.map((day) => {
                          const inMonth = day.getMonth() === calendarMonth.getMonth();
                          const dayOfWeek = day.getDay();
                          const isMonday = dayOfWeek === 1;
                          
                          // Check if day is in program duration (for overlay)
                          const isInProgramDuration = startDate && endDate && 
                            isWithinInterval(day, { start: startDate, end: endDate });
                          const isProgramStart = startDate && isSameDay(day, startDate);
                          
                          // Check for existing active programming
                          const existingProgram = activePrograms.find(p => {
                            const progStart = new Date(p.startDate);
                            const progEnd = new Date(p.endDate);
                            return isWithinInterval(day, { start: progStart, end: progEnd });
                          });
                          
                          // Check for phase boundaries (if phase end date exists)
                          const isPhaseBoundary = selectedAthlete?.phaseEndDate && 
                            isSameDay(day, new Date(selectedAthlete.phaseEndDate));
                          
                          // For each day, find blocks that include this day
                          const dayBlocks = blocks.filter((b) => isWithinInterval(day, { start: b.startDate, end: b.endDate }));
                          
                          // Check if this day has a key date (only if athlete is selected)
                          const dayKeyDate = selectedAthleteId ? keyDates.find(kd => {
                            const kdDate = new Date(kd.date);
                            kdDate.setHours(0, 0, 0, 0);
                            const dayDate = new Date(day);
                            dayDate.setHours(0, 0, 0, 0);
                            return kdDate.getTime() === dayDate.getTime();
                          }) : null;

                          return (
                            <div
                              key={day.toISOString()}
                              className={cn(
                                "min-h-[96px] rounded-md border p-1 flex flex-col relative",
                                inMonth ? "bg-background" : "bg-muted/30",
                                isPhaseBoundary && "border-l-2 border-l-orange-500 border-dashed"
                              )}
                            >
                              {/* Program Duration Overlay */}
                              {isInProgramDuration && (
                                <div className="absolute inset-0 bg-blue-500/20 pointer-events-none rounded-md" />
                              )}
                              
                              {/* Existing Programming Background */}
                              {existingProgram && (
                                <div 
                                  className="absolute inset-0 opacity-30 pointer-events-none rounded-md"
                                  style={{
                                    backgroundImage: 'repeating-linear-gradient(45deg, #808080, #808080 10px, transparent 10px, transparent 20px)'
                                  }}
                                />
                              )}
                              
                              <div className="text-[11px] text-right mb-1 text-muted-foreground flex items-center justify-end gap-1 relative z-10">
                                {format(day, "d")}
                                {dayKeyDate && (
                                  <Star className={cn(
                                    "h-3 w-3",
                                    dayKeyDate.type === "Game" && "text-blue-400 fill-blue-400",
                                    dayKeyDate.type === "Assessment" && "text-amber-400 fill-amber-400",
                                    dayKeyDate.type === "Training" && "text-green-400 fill-green-400",
                                    (!dayKeyDate.type || (!["Game", "Assessment", "Training"].includes(dayKeyDate.type))) && "text-yellow-500 fill-yellow-500"
                                  )} />
                                )}
                              </div>
                              
                              {/* Monday Indicator */}
                              {isMonday && (
                                <div className="absolute bottom-1 left-1 z-10">
                                  <div className="w-2 h-2 bg-green-500 rounded-full" title="Monday - Valid start date" />
                                </div>
                              )}
                              
                              {/* Program Duration Label */}
                              {isProgramStart && startDate && (
                                <div className="absolute top-1 left-1 z-10 bg-blue-500/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                                  New Program
                                </div>
                              )}
                              
                              <div className="flex-1 flex flex-col gap-1 relative z-10">
                                {dayBlocks.slice(0, dayKeyDate ? 2 : 3).map((b, idx) => {
                                  const isStart = isSameDay(day, b.startDate);
                                  const isEnd = isSameDay(day, b.endDate);
                                  return (
                                    <div
                                      key={`${b.name}-${idx}`}
                                      className={cn(
                                        "h-5 rounded-sm text-[10px] px-1 text-black flex items-center",
                                        blockColor
                                      )}
                                      title={`${b.name}: ${format(b.startDate, 'MMM d')} - ${format(b.endDate, 'MMM d')}`}
                                    >
                                      {isStart && <span className="truncate mr-1">{b.name}</span>}
                                      {!isStart && !isEnd && <span className="opacity-70">•</span>}
                                      {isEnd && <span className="opacity-70 ml-auto">↘</span>}
                                    </div>
                                  );
                                })}
                                {dayBlocks.length > (dayKeyDate ? 2 : 3) && (
                                  <div className="h-5 rounded-sm text-[10px] px-1 bg-muted text-muted-foreground flex items-center justify-center">
                                    +{dayBlocks.length - (dayKeyDate ? 2 : 3)} more
                                  </div>
                                )}
                                {dayKeyDate && (
                                  <div className={cn(
                                    "h-5 rounded-sm text-[10px] px-1 border flex items-center gap-1",
                                    dayKeyDate.type === "Game" && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                                    dayKeyDate.type === "Assessment" && "bg-amber-500/20 text-amber-400 border-amber-500/30",
                                    dayKeyDate.type === "Training" && "bg-green-500/20 text-green-400 border-green-500/30"
                                  )}>
                                    <Star className={cn(
                                      "h-3 w-3 flex-shrink-0",
                                      dayKeyDate.type === "Game" && "text-blue-400 fill-blue-400",
                                      dayKeyDate.type === "Assessment" && "text-amber-400 fill-amber-400",
                                      dayKeyDate.type === "Training" && "text-green-400 fill-green-400"
                                    )} />
                                    <span className="truncate">{dayKeyDate.label}</span>
                                  </div>
                                )}
                                {existingProgram && dayBlocks.length === 0 && (
                                  <div className="h-5 rounded-sm text-[10px] px-1 bg-gray-500/30 text-gray-400 flex items-center gap-1">
                                    <span className="truncate">{existingProgram.programId}</span>
                                  </div>
                                )}
                                {isPhaseBoundary && (
                                  <div className="h-5 rounded-sm text-[10px] px-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                                    <span className="truncate">Phase Boundary</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>

                    {/* Legend */}
                    {blocks.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-sm inline-block bg-blue-500" />
                          <span className="text-xs text-muted-foreground">Blocks</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-muted-foreground">Key Dates</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Key Dates Panel - Only show when athlete is selected */}
                  {selectedAthleteId && (
                    <div className="mt-4 rounded-md border p-3">
                      <h3 className="text-xs font-medium mb-3">Key Dates</h3>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {(() => {
                          // Generate mock athlete events randomly across November, December, and January
                          const currentYear = new Date().getFullYear();
                          const eventTypes = ["Game", "Assessment", "Training"] as const;
                          const eventLabels: Record<string, string[]> = {
                            Game: ["Game Day", "Championship Game", "Regular Season Game", "Playoff Game"],
                            Assessment: ["Performance Assessment", "Fitness Test", "Medical Assessment"],
                            Training: ["Training Camp", "Intensive Training", "Recovery Session"],
                          };

                          // Generate random dates across November (10), December (11), and January (0)
                          const generateRandomDate = (month: number, year: number) => {
                            const daysInMonth = new Date(year, month + 1, 0).getDate();
                            const day = Math.floor(Math.random() * daysInMonth) + 1;
                            return new Date(year, month, day);
                          };

                          const mockEvents: Array<{ date: Date; type: string; label: string }> = [];
                          
                          // November events (month 10)
                          for (let i = 0; i < 4; i++) {
                            const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                            const labels = eventLabels[type];
                            mockEvents.push({
                              date: generateRandomDate(10, currentYear),
                              type,
                              label: labels[Math.floor(Math.random() * labels.length)],
                            });
                          }

                          // December events (month 11)
                          for (let i = 0; i < 5; i++) {
                            const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                            const labels = eventLabels[type];
                            mockEvents.push({
                              date: generateRandomDate(11, currentYear),
                              type,
                              label: labels[Math.floor(Math.random() * labels.length)],
                            });
                          }

                          // January events (month 0)
                          for (let i = 0; i < 4; i++) {
                            const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                            const labels = eventLabels[type];
                            mockEvents.push({
                              date: generateRandomDate(0, currentYear),
                              type,
                              label: labels[Math.floor(Math.random() * labels.length)],
                            });
                          }

                          // Remove duplicates and filter events that fall within program date range if available
                          const uniqueEvents = Array.from(
                            new Map(mockEvents.map(event => [event.date.getTime(), event])).values()
                          );

                          const filteredEvents = startDate && endDate
                            ? uniqueEvents.filter(event => {
                                const eventDate = new Date(event.date);
                                eventDate.setHours(0, 0, 0, 0);
                                const start = new Date(startDate);
                                start.setHours(0, 0, 0, 0);
                                const end = new Date(endDate);
                                end.setHours(0, 0, 0, 0);
                                return eventDate >= start && eventDate <= end;
                              })
                            : uniqueEvents;

                          // Sort by date
                          const sortedEvents = filteredEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

                          if (sortedEvents.length === 0) {
                            return (
                              <p className="text-xs text-muted-foreground text-center py-4">
                                No key dates in the selected date range
                              </p>
                            );
                          }

                          return sortedEvents.map((event, index) => {
                            const typeColors: Record<string, string> = {
                              Game: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                              Assessment: "bg-amber-500/20 text-amber-400 border-amber-500/30",
                              Training: "bg-green-500/20 text-green-400 border-green-500/30",
                            };

                            return (
                              <div
                                key={`${event.date.getTime()}-${index}`}
                                className="flex items-center gap-2 p-2 rounded-md border bg-background hover:bg-muted/50 transition-colors"
                              >
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-medium text-foreground">
                                      {format(event.date, "MMM d, yyyy")}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-xs px-2 py-0.5",
                                        typeColors[event.type] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                      )}
                                    >
                                      {event.type}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {event.label}
                                  </p>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Blocks */}
            {currentStep === 2 && (
              <div className="w-full">
                {blocks.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-border p-12 text-center">
                    <h3 className="text-lg font-semibold mb-2">No blocks available</h3>
                    <p className="text-muted-foreground">
                      Please complete Step 1 to generate blocks first.
                    </p>
                        </div>
                ) : (
                  <div className="w-full px-0 bg-muted/20 overflow-x-auto">
                    {/* Block Headers Row */}
                    <div className="flex min-w-max border-b bg-background">
                      {/* Empty space for category labels */}
                      <div className="flex flex-col items-center shrink-0 sticky left-0 z-30 bg-background">
                        <div className="h-14 w-10 border-r" />
                      </div>

                      {/* Empty space for row headers */}
                      <div className="flex flex-col shrink-0 w-32 sticky left-10 z-30 bg-background">
                        <div className="h-14 border-r" />
                      </div>

                      {/* Column Headers (Blocks/Weeks/Days) */}
                      {displayColumns.map((column, columnIndex) => {
                        const isDayOff = column.type === "day" && calculatedDaysOff.has(column.index);
                        
                        return (
                          <div key={`header-${columnIndex}`} className="flex flex-col shrink-0 w-[236px] border-l mx-1">
                            <div className={cn(
                              "px-3 py-2 h-14 flex flex-col justify-center group transition-colors cursor-pointer",
                              isDayOff ? "bg-muted/30" : "hover:bg-muted/50"
                            )}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-medium">
                                  <span className={cn("text-foreground", isDayOff && "line-through opacity-50")}>{column.title}</span>
                                  <span className="text-muted-foreground">{column.subtitle}</span>
                                </div>
                                {column.type === "block" && (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                                {column.type === "day" && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setDaysOff(prev => {
                                              const newSet = new Set(prev);
                                              if (newSet.has(columnIndex)) {
                                                newSet.delete(columnIndex);
                                              } else {
                                                newSet.add(columnIndex);
                                              }
                                              return newSet;
                                            });
                                          }}
                                          className={cn(
                                            "p-1 rounded hover:bg-muted transition-colors opacity-0 group-hover:opacity-100",
                                            isDayOff && "opacity-100"
                                          )}
                                        >
                                          <EyeOff className={cn(
                                            "h-4 w-4",
                                            isDayOff ? "text-foreground" : "text-muted-foreground"
                                          )} />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{isDayOff ? "Restore Day" : "Mark as Day Off"}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                              <div className="flex items-center justify-between mt-0.5">
                                <div className="flex flex-col gap-0.5">
                                  <p className={cn("text-xs text-foreground", isDayOff && "opacity-50")}>
                                    {column.dateRange}
                                  </p>
                                  {column.type === "block" && column.subtitle && (
                                    <p className="text-xs text-muted-foreground">
                                      Season Phase: {column.subtitle}
                                    </p>
                                  )}
                                </div>
                                {column.type === "block" && column.duration && (
                                  <div className="text-xs text-muted-foreground">
                                    {column.duration.weeks}w | {column.duration.days}d
                                  </div>
                                )}
                              </div>
                      </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Schedule Section */}
                    <div className="flex min-w-max px-0 my-2 relative">
                      {/* Category Label (Rotated) */}
                      <div className="flex flex-col items-center shrink-0 sticky left-0 z-20 bg-background">
                        <div className="flex items-center justify-center h-20 w-10 border-r bg-green-500/10">
                          <div className="-rotate-90 whitespace-nowrap">
                            <span className="text-xs font-medium text-green-700">Schedule</span>
                          </div>
                        </div>
                        <div className="w-10 border-r bg-background" />
                      </div>

                      {/* Row Headers */}
                      <div className="flex flex-col shrink-0 w-32 sticky left-10 z-20 bg-background border-r">
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Season</p>
                        </div>
                        <div className="h-10 flex items-center px-3">
                          <p className="text-xs font-medium text-muted-foreground">Sub-Season</p>
                        </div>
                      </div>

                      {/* Schedule Content */}
                      {displayColumns.map((column, columnIndex) => {
                        const isDayOff = column.type === "day" && calculatedDaysOff.has((column as any).index);
                        const blockIndex = column.type === "block" ? column.index : undefined;
                        const weekIndex = column.type === "week" ? (column as any).weekIndex : undefined;
                        const dayIndex = column.type === "day" ? (column as any).index : undefined;
                        
                        return (
                          <div key={`schedule-${columnIndex}`} className="flex flex-col shrink-0 w-[236px] border-l mx-1">
                            {/* Season Dropdown */}
                            <div className={cn(
                              "h-10 flex items-center border-b relative",
                              isDayOff ? "bg-muted/30" : "bg-green-500/10 hover:bg-green-500/20 transition-colors"
                            )}>
                              {!isDayOff && (
                                <>
                                  <Select 
                                    value={getCellValue("schedule", "season", blockIndex || 0, weekIndex || 0, dayIndex || 0) || "season"}
                                    onValueChange={(value) => {
                                      if (blockIndex !== undefined) {
                                        handleValueChange("schedule", "season", value, blockIndex, weekIndex || 0, dayIndex || 0, "block");
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="season">Season</SelectItem>
                                      <SelectItem value="off-season">Off-Season</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {blockIndex !== undefined && hasOverrides("schedule", "season", blockIndex, "block") && (
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-green-500" 
                                         title="Customized at lower level" />
                                  )}
                                </>
                              )}
                            </div>

                            {/* Sub-Season Dropdown */}
                            <div className={cn(
                              "h-10 flex items-center relative",
                              isDayOff ? "bg-muted/30" : "bg-green-500/10 hover:bg-green-500/20 transition-colors"
                            )}>
                              {!isDayOff && (
                                <>
                                  <Select 
                                    value={getCellValue("schedule", "subSeason", blockIndex || 0, weekIndex || 0, dayIndex || 0) || "general-off-season"}
                                    onValueChange={(value) => {
                                      if (blockIndex !== undefined) {
                                        handleValueChange("schedule", "subSeason", value, blockIndex, weekIndex || 0, dayIndex || 0, "block");
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="general-off-season">General Off-Season (GOS)</SelectItem>
                                      <SelectItem value="early-off-season">Early Off-Season (EOS)</SelectItem>
                                      <SelectItem value="late-off-season">Late Off-Season (LOS)</SelectItem>
                                      <SelectItem value="pre-season">Pre-Season</SelectItem>
                                      <SelectItem value="in-season">In-Season</SelectItem>
                                      <SelectItem value="post-season">Post-Season</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {blockIndex !== undefined && hasOverrides("schedule", "subSeason", blockIndex, "block") && (
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-green-500" 
                                         title="Customized at lower level" />
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* xRole Section */}
                    <div className="flex min-w-max px-0 my-2 relative">
                      {/* Category Label (Rotated) */}
                      <div className="flex flex-col items-center shrink-0 sticky left-0 z-20 bg-background">
                        <div className="flex items-center justify-center h-20 w-10 border-r bg-cyan-500/10">
                          <div className="-rotate-90 whitespace-nowrap">
                            <span className="text-xs font-medium text-cyan-700">xRole</span>
                          </div>
                        </div>
                        <div className="w-10 border-r bg-background" />
                      </div>

                      {/* Row Headers */}
                      <div className="flex flex-col shrink-0 w-32 sticky left-10 z-20 bg-background border-r">
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">xRole (Pitcher)</p>
                        </div>
                        <div className="h-10 flex items-center px-3">
                          <p className="text-xs font-medium text-muted-foreground">xRole (Hitter)</p>
                        </div>
                      </div>

                      {/* xRole Content */}
                      {displayColumns.map((column, columnIndex) => {
                        const isDayOff = column.type === "day" && calculatedDaysOff.has((column as any).index);
                        const blockIndex = column.type === "block" ? column.index : undefined;
                        const weekIndex = column.type === "week" ? (column as any).weekIndex : undefined;
                        const dayIndex = column.type === "day" ? (column as any).index : undefined;
                        
                        // Determine if athlete is pitcher or hitter based on position
                        const isPitcher = selectedAthlete?.position?.toLowerCase().includes("pitcher") || false;
                        
                        return (
                          <div key={`xrole-${columnIndex}`} className="flex flex-col shrink-0 w-[236px] border-l mx-1">
                            {/* xRole (Pitcher) Dropdown */}
                            <div className={cn(
                              "h-10 flex items-center border-b relative",
                              isDayOff ? "bg-muted/30" : "bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
                            )}>
                              {!isDayOff && (
                                <>
                                  <Select 
                                    value={getCellValue("xrole", "pitcher", blockIndex || 0, weekIndex || 0, dayIndex || 0) || (isPitcher ? "rotation-starter" : "")}
                                    onValueChange={(value) => {
                                      if (blockIndex !== undefined) {
                                        handleValueChange("xrole", "pitcher", value, blockIndex, weekIndex || 0, dayIndex || 0, "block");
                                      }
                                    }}
                                    disabled={!isPitcher}
                                  >
                                    <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent disabled:opacity-50">
                                      <SelectValue placeholder={isPitcher ? "Select..." : "--"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="rotation-starter">Rotation Starter</SelectItem>
                                      <SelectItem value="bullpen-reliever">Bullpen Reliever</SelectItem>
                                      <SelectItem value="closer">Closer</SelectItem>
                                      <SelectItem value="setup">Setup</SelectItem>
                                      <SelectItem value="long-relief">Long Relief</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {blockIndex !== undefined && hasOverrides("xrole", "pitcher", blockIndex, "block") && (
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-500" 
                                         title="Customized at lower level" />
                                  )}
                                </>
                              )}
                            </div>

                            {/* xRole (Hitter) Dropdown */}
                            <div className={cn(
                              "h-10 flex items-center relative",
                              isDayOff ? "bg-muted/30" : "bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
                            )}>
                              {!isDayOff && (
                                <>
                                  <Select 
                                    value={getCellValue("xrole", "hitter", blockIndex || 0, weekIndex || 0, dayIndex || 0) || (!isPitcher ? "everyday-player" : "")}
                                    onValueChange={(value) => {
                                      if (blockIndex !== undefined) {
                                        handleValueChange("xrole", "hitter", value, blockIndex, weekIndex || 0, dayIndex || 0, "block");
                                      }
                                    }}
                                    disabled={isPitcher}
                                  >
                                    <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent disabled:opacity-50">
                                      <SelectValue placeholder={!isPitcher ? "Select..." : "--"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="everyday-player">Everyday Player</SelectItem>
                                      <SelectItem value="platoon-player">Platoon Player</SelectItem>
                                      <SelectItem value="bench-player">Bench Player</SelectItem>
                                      <SelectItem value="designated-hitter">Designated Hitter</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {blockIndex !== undefined && hasOverrides("xrole", "hitter", blockIndex, "block") && (
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-500" 
                                         title="Customized at lower level" />
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Throwing Section */}
                    {routineTypes.includes("throwing") && (
                    <div className="flex min-w-max px-0 relative">
                      {/* Category Label (Rotated) */}
                      <div className="flex flex-col items-center shrink-0 sticky left-0 z-20 bg-background">
                        <div className="flex items-center justify-center h-20 w-10 border-r bg-blue-500/10">
                          <div className="-rotate-90 whitespace-nowrap">
                            <p className="text-xs font-medium text-foreground">Throwing</p>
                            </div>
                        </div>
                        <div className="w-10 border-r bg-background" />
                      </div>

                      {/* Row Headers */}
                      <div className="flex flex-col shrink-0 w-32 sticky left-10 z-20 bg-background border-r">
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Phase</p>
                        </div>
                        <div className="h-10 flex items-center px-3">
                          <p className="text-xs font-medium text-muted-foreground">Exclusions</p>
                        </div>
                      </div>

                      {/* Columns (Blocks/Weeks/Days) */}
                      {displayColumns.map((column, columnIndex) => {
                        const isDayOff = column.type === "day" && calculatedDaysOff.has(column.index);
                        
                        // Determine level and indices based on column type
                        const level: SettingsLevel = column.type === "block" ? "block" : column.type === "week" ? "week" : "day";
                        const blockIndex = column.type === "block" ? column.index : 
                                          column.type === "week" ? column.blockIndex : 
                                          columnIndex; // For day, we'll use columnIndex as blockIndex (simplified)
                        const weekIndex = column.type === "week" ? column.weekIndex : 
                                         column.type === "day" ? 0 : undefined; // Simplified for now
                        const dayIndex = column.type === "day" ? column.index : undefined;
                        
                        return (
                        <div key={columnIndex} className="flex flex-col shrink-0 w-[236px] border-l mx-1">
                          {/* Phase Dropdown */}
                          <div className={cn(
                            "h-10 flex items-center border-b relative",
                            isDayOff ? "bg-muted/20" : "bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                          )}>
                            {!isDayOff && (
                            <>
                              <Select 
                                value={getCellValue("throwing", "phase", blockIndex, weekIndex, dayIndex) || "pitch-design"}
                                onValueChange={(value) => handleValueChange("throwing", "phase", value, blockIndex, weekIndex, dayIndex, level)}
                              >
                                <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="building">Building</SelectItem>
                                  <SelectItem value="pitch-design">Pitch Design (PD)</SelectItem>
                                  <SelectItem value="transition">Transition</SelectItem>
                                  <SelectItem value="in-season">In-Season</SelectItem>
                                  <SelectItem value="deload">Deload</SelectItem>
                                  <SelectItem value="rest">Rest</SelectItem>
                                  <SelectItem value="return-to-throw">Return to Throw (RTT)</SelectItem>
                                </SelectContent>
                              </Select>
                              {hasOverrides("throwing", "phase", blockIndex, level) && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" 
                                     title="Customized at lower level" />
                              )}
                            </>
                          )}
                        </div>

                          {/* Exclusions Dropdown */}
                          <div className={cn(
                            "h-10 flex items-center relative",
                            isDayOff ? "bg-muted/20" : "bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                          )}>
                            {!isDayOff && (
                            <>
                              <Select 
                                value={getCellValue("throwing", "exclusions", blockIndex, weekIndex, dayIndex) || "none"}
                                onValueChange={(value) => handleValueChange("throwing", "exclusions", value, blockIndex, weekIndex, dayIndex, level)}
                              >
                                <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  <SelectItem value="flatground">Flatground</SelectItem>
                                  <SelectItem value="mound">Mound</SelectItem>
                                  <SelectItem value="long-toss">Long Toss</SelectItem>
                                  <SelectItem value="weighted-balls">Weighted Balls</SelectItem>
                                  <SelectItem value="high-intent">High Intent</SelectItem>
                                </SelectContent>
                              </Select>
                              {hasOverrides("throwing", "exclusions", blockIndex, level) && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" 
                                     title="Customized at lower level" />
                              )}
                            </>
                            )}
                      </div>
                        </div>
                        );
                      })}
                            </div>
                          )}

                    {/* Movement Section */}
                    {routineTypes.includes("movement") && (
                    <div className="flex min-w-max px-0 my-2 relative">
                      {/* Category Label (Rotated) */}
                      <div className="flex flex-col items-center shrink-0 sticky left-0 z-20 bg-background">
                        <div className="flex items-center justify-center h-40 w-10 border-r bg-violet-500/10">
                          <div className="-rotate-90 whitespace-nowrap">
                            <p className="text-xs font-medium text-foreground">Movement</p>
                          </div>
                        </div>
                      </div>

                      {/* Row Headers */}
                      <div className="flex flex-col shrink-0 w-32 sticky left-10 z-20 bg-background border-r">
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">R-focus</p>
                        </div>
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Movement Type</p>
                        </div>
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Intensity</p>
                        </div>
                        <div className="h-10 flex items-center px-3">
                          <p className="text-xs font-medium text-muted-foreground">Volume</p>
                        </div>
                      </div>

                      {/* Columns (Blocks/Weeks/Days) */}
                      {displayColumns.map((column, columnIndex) => {
                        const isDayOff = column.type === "day" && calculatedDaysOff.has(column.index);
                        
                        // Determine level and indices based on column type
                        const level: SettingsLevel = column.type === "block" ? "block" : column.type === "week" ? "week" : "day";
                        const blockIndex = column.type === "block" ? column.index : 
                                          column.type === "week" ? column.blockIndex : 
                                          columnIndex; // For day, we'll use columnIndex as blockIndex (simplified)
                        const weekIndex = column.type === "week" ? column.weekIndex : 
                                         column.type === "day" ? 0 : undefined; // Simplified for now
                        const dayIndex = column.type === "day" ? column.index : undefined;
                        
                            return (
                        <div key={`movement-${columnIndex}`} className="flex flex-col shrink-0 w-[236px] border-l mx-1">
                          {/* R-focus Dropdown */}
                          <div className={cn(
                            "h-10 flex items-center border-b relative",
                            isDayOff ? "bg-muted/20" : "bg-violet-500/10 hover:bg-violet-500/20 transition-colors"
                          )}>
                            {!isDayOff && (
                            <>
                              <Select 
                                value={getCellValue("movement", "rFocus", blockIndex, weekIndex, dayIndex) || "r1"}
                                onValueChange={(value) => handleValueChange("movement", "rFocus", value, blockIndex, weekIndex, dayIndex, level)}
                              >
                                <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="r1">R1</SelectItem>
                                  <SelectItem value="r2">R2</SelectItem>
                                  <SelectItem value="r3">R3</SelectItem>
                                  <SelectItem value="r4">R4</SelectItem>
                                  <SelectItem value="r5">R5</SelectItem>
                                  <SelectItem value="r6">R6</SelectItem>
                                  <SelectItem value="r7">R7</SelectItem>
                                  <SelectItem value="r8">R8</SelectItem>
                                </SelectContent>
                              </Select>
                              {hasOverrides("movement", "rFocus", blockIndex, level) && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-500" 
                                     title="Customized at lower level" />
                              )}
                            </>
                            )}
                          </div>

                          {/* Movement Type Dropdown */}
                          <div className={cn(
                            "h-10 flex items-center border-b relative",
                            isDayOff ? "bg-muted/20" : "bg-violet-500/10 hover:bg-violet-500/20 transition-colors"
                          )}>
                            {!isDayOff && (
                            <>
                              <Select 
                                value={getCellValue("movement", "movementType", blockIndex, weekIndex, dayIndex) || "strength"}
                                onValueChange={(value) => handleValueChange("movement", "movementType", value, blockIndex, weekIndex, dayIndex, level)}
                              >
                                <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="strength">Strength & Conditioning</SelectItem>
                                  <SelectItem value="power">Power</SelectItem>
                                  <SelectItem value="endurance">Endurance</SelectItem>
                                  <SelectItem value="mobility">Mobility</SelectItem>
                                </SelectContent>
                              </Select>
                              {hasOverrides("movement", "movementType", blockIndex, level) && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-500" 
                                     title="Customized at lower level" />
                              )}
                            </>
                            )}
                          </div>

                          {/* Intensity Dropdown */}
                          <div className={cn(
                            "h-10 flex items-center border-b relative",
                            isDayOff ? "bg-muted/20" : "bg-violet-500/10 hover:bg-violet-500/20 transition-colors"
                          )}>
                            {!isDayOff && (
                            <>
                              <Select 
                                value={getCellValue("movement", "intensity", blockIndex, weekIndex, dayIndex) || "moderate"}
                                onValueChange={(value) => handleValueChange("movement", "intensity", value, blockIndex, weekIndex, dayIndex, level)}
                              >
                                <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="moderate">Moderate</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="maximal">Maximal</SelectItem>
                                </SelectContent>
                              </Select>
                              {hasOverrides("movement", "intensity", blockIndex, level) && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-500" 
                                     title="Customized at lower level" />
                              )}
                            </>
                            )}
                          </div>

                          {/* Volume Dropdown */}
                          <div className={cn(
                            "h-10 flex items-center relative",
                            isDayOff ? "bg-muted/20" : "bg-violet-500/10 hover:bg-violet-500/20 transition-colors"
                          )}>
                            {!isDayOff && (
                            <>
                              <Select 
                                value={getCellValue("movement", "volume", blockIndex, weekIndex, dayIndex) || "standard"}
                                onValueChange={(value) => handleValueChange("movement", "volume", value, blockIndex, weekIndex, dayIndex, level)}
                              >
                                <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="standard">Standard</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="peak">Peak</SelectItem>
                                </SelectContent>
                              </Select>
                              {hasOverrides("movement", "volume", blockIndex, level) && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-500" 
                                     title="Customized at lower level" />
                              )}
                            </>
                            )}
                          </div>
                              </div>
                            );
                          })}
                    </div>
                    )}

                    {/* Lifting Section */}
                    {routineTypes.includes("lifting") && (
                    <div className="flex min-w-max px-0 my-2 relative">
                      {/* Category Label (Rotated) */}
                      <div className="flex flex-col items-center shrink-0 sticky left-0 z-20 bg-background">
                        <div className="flex items-center justify-center h-50 w-10 border-r bg-orange-500/10">
                          <div className="-rotate-90 whitespace-nowrap">
                            <p className="text-xs font-medium text-foreground">Lifting</p>
                          </div>
                        </div>
                      </div>

                      {/* Row Headers */}
                      <div className="flex flex-col shrink-0 w-32 sticky left-10 z-20 bg-background border-r">
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Training Split</p>
                        </div>
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Core Emphasis</p>
                        </div>
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Variability</p>
                        </div>
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Scheme</p>
                        </div>
                        <div className="h-10 flex items-center px-3">
                          <p className="text-xs font-medium text-muted-foreground">Exclusions</p>
                        </div>
                      </div>

                      {/* Columns (Blocks/Weeks/Days) */}
                      {displayColumns.map((column, columnIndex) => {
                        const isDayOff = column.type === "day" && calculatedDaysOff.has(column.index);
                        
                        // Determine level and indices based on column type
                        const level: SettingsLevel = column.type === "block" ? "block" : column.type === "week" ? "week" : "day";
                        const blockIndex = column.type === "block" ? column.index : 
                                          column.type === "week" ? column.blockIndex : 
                                          columnIndex; // For day, we'll use columnIndex as blockIndex (simplified)
                        const weekIndex = column.type === "week" ? column.weekIndex : 
                                         column.type === "day" ? 0 : undefined; // Simplified for now
                        const dayIndex = column.type === "day" ? column.index : undefined;
                        
                            return (
                        <div key={`lifting-${columnIndex}`} className="flex flex-col shrink-0 w-[236px] border-l mx-1">
                          {/* Training Split Dropdown */}
                          <div className={cn(
                            "h-10 flex items-center border-b relative",
                            isDayOff ? "bg-muted/20" : "bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
                          )}>
                            {!isDayOff && (
                            <>
                              <Select 
                                value={getCellValue("training-split", "type", blockIndex || 0, weekIndex || 0, dayIndex || 0) || "4x2"}
                                onValueChange={(value) => {
                                  if (blockIndex !== undefined) {
                                    handleValueChange("training-split", "type", value, blockIndex, weekIndex || 0, dayIndex || 0, "block");
                                  }
                                }}
                              >
                                <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="4x2">4 x 2</SelectItem>
                                  <SelectItem value="4x1">4 x 1</SelectItem>
                                  <SelectItem value="3x2">3 x 2</SelectItem>
                                  <SelectItem value="3x1">3 x 1</SelectItem>
                                  <SelectItem value="2x2">2 x 2</SelectItem>
                                  <SelectItem value="2x1">2 x 1</SelectItem>
                                </SelectContent>
                              </Select>
                              {blockIndex !== undefined && hasOverrides("training-split", "type", blockIndex, "block") && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500" 
                                     title="Customized at lower level" />
                              )}
                            </>
                            )}
                          </div>

                          {/* Core Emphasis Dropdown */}
                          <div className={cn(
                            "h-10 flex items-center border-b relative",
                            isDayOff ? "bg-muted/20" : "bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
                          )}>
                            {!isDayOff && (
                            <>
                              <Select 
                                value={getCellValue("lifting", "coreEmphasis", blockIndex, weekIndex, dayIndex) || "restorative"}
                                onValueChange={(value) => handleValueChange("lifting", "coreEmphasis", value, blockIndex, weekIndex, dayIndex, level)}
                              >
                                <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="restorative">Restorative (Rv)</SelectItem>
                                  <SelectItem value="strength">Strength</SelectItem>
                                  <SelectItem value="strength-speed">Strength-Speed</SelectItem>
                                  <SelectItem value="speed-strength">Speed-Strength</SelectItem>
                                  <SelectItem value="speed">Speed</SelectItem>
                                  <SelectItem value="testing">Testing</SelectItem>
                                  <SelectItem value="deload">Deload</SelectItem>
                                </SelectContent>
                              </Select>
                              {hasOverrides("lifting", "coreEmphasis", blockIndex, level) && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500" 
                                     title="Customized at lower level" />
                              )}
                            </>
                            )}
                          </div>

                          {/* Variability Dropdown */}
                          <div className={cn(
                            "h-10 flex items-center border-b relative",
                            isDayOff ? "bg-muted/20" : "bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
                          )}>
                            {!isDayOff && (
                            <>
                              <Select 
                                value={getCellValue("lifting", "variability", blockIndex, weekIndex, dayIndex) || "low"}
                                onValueChange={(value) => handleValueChange("lifting", "variability", value, blockIndex, weekIndex, dayIndex, level)}
                              >
                                <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                              </Select>
                              {hasOverrides("lifting", "variability", blockIndex, level) && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500" 
                                     title="Customized at lower level" />
                              )}
                            </>
                            )}
                          </div>

                          {/* Scheme Dropdown */}
                          <div className={cn(
                            "h-10 flex items-center border-b relative",
                            isDayOff ? "bg-muted/20" : "bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
                          )}>
                            {!isDayOff && (
                            <>
                              <Select 
                                value={getCellValue("lifting", "scheme", blockIndex, weekIndex, dayIndex) || "straight"}
                                onValueChange={(value) => handleValueChange("lifting", "scheme", value, blockIndex, weekIndex, dayIndex, level)}
                              >
                                <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="straight">Straight</SelectItem>
                                  <SelectItem value="wave">Wave</SelectItem>
                                  <SelectItem value="pyramid">Pyramid</SelectItem>
                                  <SelectItem value="cluster">Cluster</SelectItem>
                                  <SelectItem value="drop-set">Drop Set</SelectItem>
                                </SelectContent>
                              </Select>
                              {hasOverrides("lifting", "scheme", blockIndex, level) && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500" 
                                     title="Customized at lower level" />
                              )}
                            </>
                            )}
                          </div>

                          {/* Exclusions Dropdown */}
                          <div className={cn(
                            "h-10 flex items-center relative",
                            isDayOff ? "bg-muted/20" : "bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
                          )}>
                            {!isDayOff && (
                            <>
                              <Select 
                                value={getCellValue("lifting", "exclusions", blockIndex, weekIndex, dayIndex) || "none"}
                                onValueChange={(value) => handleValueChange("lifting", "exclusions", value, blockIndex, weekIndex, dayIndex, level)}
                              >
                                <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  <SelectItem value="overhead-pressing">Overhead Pressing</SelectItem>
                                  <SelectItem value="heavy-squatting">Heavy Squatting</SelectItem>
                                  <SelectItem value="olympic-lifts">Olympic Lifts</SelectItem>
                                  <SelectItem value="jumping">Jumping</SelectItem>
                                  <SelectItem value="deadlifts">Deadlifts</SelectItem>
                                </SelectContent>
                              </Select>
                              {hasOverrides("lifting", "exclusions", blockIndex, level) && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500" 
                                     title="Customized at lower level" />
                              )}
                            </>
                            )}
                          </div>
                              </div>
                            );
                          })}
                        </div>
                    )}

                    {/* Conditioning Section */}
                    <div className="flex min-w-max px-0 my-2 relative">
                      {/* Category Label (Rotated) */}
                      <div className="flex flex-col items-center shrink-0 sticky left-0 z-20 bg-background">
                        <div className="flex items-center justify-center h-30 w-10 border-r bg-teal-500/10">
                          <div className="-rotate-90 whitespace-nowrap">
                            <span className="text-xs font-medium text-teal-700">Conditioning</span>
                          </div>
                        </div>
                      </div>

                      {/* Row Headers */}
                      <div className="flex flex-col shrink-0 w-32 sticky left-10 z-20 bg-background border-r">
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Core Emphasis</p>
                        </div>
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Adaptation</p>
                        </div>
                        <div className="h-10 flex items-center px-3">
                          <p className="text-xs font-medium text-muted-foreground">Method</p>
                        </div>
                      </div>

                      {/* Conditioning Content */}
                      {displayColumns.map((column, columnIndex) => {
                        const isDayOff = column.type === "day" && calculatedDaysOff.has((column as any).index);
                        const blockIndex = column.type === "block" ? column.index : undefined;
                        const weekIndex = column.type === "week" ? (column as any).weekIndex : undefined;
                        const dayIndex = column.type === "day" ? (column as any).index : undefined;
                        const level: SettingsLevel = column.type === "block" ? "block" : column.type === "week" ? "week" : "day";
                        
                        return (
                          <div key={`conditioning-${columnIndex}`} className="flex flex-col shrink-0 w-[236px] border-l mx-1">
                            {/* Core Emphasis Dropdown */}
                            <div className={cn(
                              "h-10 flex items-center border-b relative",
                              isDayOff ? "bg-muted/30" : "bg-teal-500/10 hover:bg-teal-500/20 transition-colors"
                            )}>
                              {!isDayOff && (
                                <>
                                  <Select 
                                    value={getCellValue("conditioning", "coreEmphasis", blockIndex || 0, weekIndex || 0, dayIndex || 0) || "mitochondrial"}
                                    onValueChange={(value) => {
                                      if (blockIndex !== undefined) {
                                        handleValueChange("conditioning", "coreEmphasis", value, blockIndex, weekIndex || 0, dayIndex || 0, level);
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="mitochondrial">Mitochondrial</SelectItem>
                                      <SelectItem value="cardiac-output">Cardiac Output</SelectItem>
                                      <SelectItem value="aerobic-power">Aerobic Power</SelectItem>
                                      <SelectItem value="anaerobic-capacity">Anaerobic Capacity</SelectItem>
                                      <SelectItem value="alactic-power">Alactic Power</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {blockIndex !== undefined && hasOverrides("conditioning", "coreEmphasis", blockIndex, level) && (
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-teal-500" 
                                         title="Customized at lower level" />
                                  )}
                                </>
                              )}
                            </div>

                            {/* Adaptation Dropdown */}
                            <div className={cn(
                              "h-10 flex items-center border-b relative",
                              isDayOff ? "bg-muted/30" : "bg-teal-500/10 hover:bg-teal-500/20 transition-colors"
                            )}>
                              {!isDayOff && (
                                <>
                                  <Select 
                                    value={getCellValue("conditioning", "adaptation", blockIndex || 0, weekIndex || 0, dayIndex || 0) || "angiogenesis"}
                                    onValueChange={(value) => {
                                      if (blockIndex !== undefined) {
                                        handleValueChange("conditioning", "adaptation", value, blockIndex, weekIndex || 0, dayIndex || 0, level);
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="angiogenesis">Angiogenesis</SelectItem>
                                      <SelectItem value="capillary-density">Capillary Density</SelectItem>
                                      <SelectItem value="stroke-volume">Stroke Volume</SelectItem>
                                      <SelectItem value="lactate-threshold">Lactate Threshold</SelectItem>
                                      <SelectItem value="power-endurance">Power Endurance</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {blockIndex !== undefined && hasOverrides("conditioning", "adaptation", blockIndex, level) && (
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-teal-500" 
                                         title="Customized at lower level" />
                                  )}
                                </>
                              )}
                            </div>

                            {/* Method Dropdown */}
                            <div className={cn(
                              "h-10 flex items-center relative",
                              isDayOff ? "bg-muted/30" : "bg-teal-500/10 hover:bg-teal-500/20 transition-colors"
                            )}>
                              {!isDayOff && (
                                <>
                                  <Select 
                                    value={getCellValue("conditioning", "method", blockIndex || 0, weekIndex || 0, dayIndex || 0) || "long-slow-duration"}
                                    onValueChange={(value) => {
                                      if (blockIndex !== undefined) {
                                        handleValueChange("conditioning", "method", value, blockIndex, weekIndex || 0, dayIndex || 0, level);
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="long-slow-duration">Long Slow Duration (LSD)</SelectItem>
                                      <SelectItem value="tempo-runs">Tempo Runs</SelectItem>
                                      <SelectItem value="intervals">Intervals</SelectItem>
                                      <SelectItem value="hiit">HIIT</SelectItem>
                                      <SelectItem value="fartlek">Fartlek</SelectItem>
                                      <SelectItem value="steady-state">Steady State</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {blockIndex !== undefined && hasOverrides("conditioning", "method", blockIndex, level) && (
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-teal-500" 
                                         title="Customized at lower level" />
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review & Publish */}
            {currentStep === 3 && (
              <div className="w-full">
                {/* Routine Tab Menu */}
                <div className="sticky top-16 z-40 border-b bg-background">
                  <div className="flex items-center justify-between px-5 h-14">
                    <div className="flex items-center gap-2">
                      {routineTypes.map((routineType) => {
                        const routine = routineTypeOptions.find(r => r.id === routineType);
                        if (!routine) return null;
                        
                        const isActive = reviewRoutineTab === routineType;
                        return (
                          <button
                            key={routineType}
                            type="button"
                            onClick={() => setReviewRoutineTab(routineType)}
                            className={cn(
                              "px-4 py-2 text-xs font-medium rounded-md transition-colors",
                              isActive 
                                ? "bg-muted text-foreground" 
                                : "text-muted-foreground hover:bg-muted/50"
                            )}
                          >
                            {routine.label}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Week Navigation */}
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setReviewWeekIndex(Math.max(0, reviewWeekIndex - 1))}
                        disabled={reviewWeekIndex === 0}
                        className="p-1.5 hover:bg-muted rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-xs font-medium min-w-[80px] text-center">
                        Week {reviewWeekIndex + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => setReviewWeekIndex(Math.min(weeksCount - 1, reviewWeekIndex + 1))}
                        disabled={reviewWeekIndex >= weeksCount - 1}
                        className="p-1.5 hover:bg-muted rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lifting Routine Table */}
                {reviewRoutineTab === "lifting" && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px] sticky left-0 z-10 bg-background">Section</TableHead>
                          {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                            const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                            const isDayOff = calculatedDaysOff.has(dayNum === 7 ? 0 : dayNum);
                            
                            return (
                              <TableHead key={dayNum} className="text-center min-w-[200px]">
                                {isDayOff ? (
                                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                    <Moon className="h-4 w-4" />
                                    <span>{dayNames[dayNum - 1]}</span>
                                  </div>
                                ) : (
                                  dayNames[dayNum - 1]
                                )}
                              </TableHead>
                            );
                          })}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Focus Row */}
                        <TableRow>
                          <TableCell className="font-medium sticky left-0 z-10 bg-background">Focus</TableCell>
                          {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                            const dayIndex = dayNum === 7 ? 0 : dayNum;
                            const isDayOff = calculatedDaysOff.has(dayIndex);
                            const dayData = getLiftingDayData(reviewWeekIndex, dayIndex);
                            
                            return (
                              <TableCell key={dayNum} className="p-2">
                                {!isDayOff && (
                                  <Select
                                    value={dayData.focus}
                                    onValueChange={(value) => updateLiftingDayData(reviewWeekIndex, dayIndex, { focus: value })}
                                  >
                                    <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-orange-500/10 hover:bg-orange-500/20">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Non-specific">Non-specific</SelectItem>
                                      <SelectItem value="Quad">Quad</SelectItem>
                                      <SelectItem value="Hamstring">Hamstring</SelectItem>
                                      <SelectItem value="Glute">Glute</SelectItem>
                                      <SelectItem value="Upper Push">Upper Push</SelectItem>
                                      <SelectItem value="Upper Pull">Upper Pull</SelectItem>
                                      <SelectItem value="Core">Core</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>

                        {/* Emphasis Row */}
                        <TableRow>
                          <TableCell className="font-medium sticky left-0 z-10 bg-background">Emphasis</TableCell>
                          {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                            const dayIndex = dayNum === 7 ? 0 : dayNum;
                            const isDayOff = calculatedDaysOff.has(dayIndex);
                            const dayData = getLiftingDayData(reviewWeekIndex, dayIndex);
                            
                            return (
                              <TableCell key={dayNum} className="p-2">
                                {!isDayOff && (
                                  <Select
                                    value={dayData.emphasis}
                                    onValueChange={(value) => updateLiftingDayData(reviewWeekIndex, dayIndex, { emphasis: value })}
                                  >
                                    <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-orange-500/10 hover:bg-orange-500/20">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Minimal">Minimal</SelectItem>
                                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                                      <SelectItem value="Restorative">Restorative</SelectItem>
                                      <SelectItem value="Functional">Functional</SelectItem>
                                      <SelectItem value="Strength">Strength & Conditioning</SelectItem>
                                      <SelectItem value="Power">Power</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>

                        {/* Section Header: Preparatory */}
                        <TableRow>
                          <TableCell colSpan={8} className="bg-orange-500/5 font-semibold text-xs py-3">
                            Section: Preparatory (P)
                          </TableCell>
                        </TableRow>

                        {/* Preparatory Subsections: P1, P2, P3, P4 */}
                        {(["p1", "p2", "p3", "p4"] as const).map((section, sectionIndex) => (
                          <TableRow key={section}>
                            <TableCell className="font-medium sticky left-0 z-10 bg-background">
                              Preparatory (P{sectionIndex + 1})
                            </TableCell>
                            {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                              const dayIndex = dayNum === 7 ? 0 : dayNum;
                              const isDayOff = calculatedDaysOff.has(dayIndex);
                              
                              // Initialize sample data for training days on first render
                              if (!isDayOff && section === "p1") {
                                initializeSampleExercises(reviewWeekIndex, dayIndex);
                              }
                              
                              const dayData = getLiftingDayData(reviewWeekIndex, dayIndex);
                              const cell = dayData.preparatory[section];
                              
                              return (
                                <TableCell key={dayNum} className="p-2 align-top">
                                  {!isDayOff && (
                                    <div className="space-y-3 bg-orange-500/5 p-3 rounded-md min-h-[120px]">
                                      {cell.exercises.length === 0 ? (
                                        <div className="flex items-center justify-center py-8">
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <button
                                                  type="button"
                                                  onClick={() => addExercises(reviewWeekIndex, dayIndex, section)}
                                                  className="p-3 hover:bg-orange-500/20 rounded-full transition-colors"
                                                >
                                                  <Plus className="h-5 w-5 text-orange-600" />
                                                </button>
                                              </TooltipTrigger>
                                              <TooltipContent>Add exercises</TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </div>
                                      ) : (
                                        cell.exercises.slice(0, 2).map((exercise, exerciseIndex) => (
                                          <div key={exercise.id || exerciseIndex} className="space-y-1.5 p-2 bg-background rounded border">
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="flex-1 min-w-0">
                                                <div className="text-xs font-medium text-orange-600 mb-0.5">
                                                  {exercise.targetBodyGroup}
                                                </div>
                                                <div className="text-xs font-semibold truncate">
                                                  {exercise.name}
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <TooltipProvider>
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <button
                                                        type="button"
                                                        onClick={() => shuffleExercise(reviewWeekIndex, dayIndex, section, exerciseIndex)}
                                                        className="p-1 hover:bg-muted rounded"
                                                      >
                                                        <Shuffle className="h-3 w-3" />
                                                      </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Change exercise</TooltipContent>
                                                  </Tooltip>
                                                </TooltipProvider>
                                                <TooltipProvider>
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <button
                                                        type="button"
                                                        onClick={() => removeExercise(reviewWeekIndex, dayIndex, section, exerciseIndex)}
                                                        className="p-1 hover:bg-destructive/10 rounded text-destructive"
                                                      >
                                                        <Trash2 className="h-3 w-3" />
                                                      </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Remove exercise</TooltipContent>
                                                  </Tooltip>
                                                </TooltipProvider>
                                              </div>
                                            </div>
                                            <div className="grid grid-cols-5 gap-1 text-[10px] text-muted-foreground">
                                              <div>
                                                <span className="font-medium">{exercise.sets}</span> sets
                                              </div>
                                              <div>
                                                <span className="font-medium">{exercise.reps}</span> reps
                                              </div>
                                              <div>
                                                <span className="font-medium">{exercise.restTime}</span>
                                              </div>
                                              {exercise.weight && (
                                                <div>
                                                  <span className="font-medium">{exercise.weight}</span>
                                                </div>
                                              )}
                                              <div>
                                                <span className="font-medium">{exercise.tempo}</span>
                                              </div>
                                            </div>
                                          </div>
                                        ))
                                      )}
                                      {cell.exercises.length > 0 && (
                                        <button
                                          type="button"
                                          onClick={() => clearCell(reviewWeekIndex, dayIndex, section)}
                                          className="w-full text-xs text-muted-foreground hover:text-foreground py-1"
                                        >
                                          Clear cell
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Placeholder for other routine tabs */}
                {reviewRoutineTab !== "lifting" && (
                  <div className="p-12 text-center text-muted-foreground">
                    {routineTypeOptions.find(r => r.id === reviewRoutineTab)?.label} routine view coming soon
                  </div>
                )}
              </div>
            )}
          </form>
        </Form>
      </main>
      
      {/* Confirmation Dialog for Block-Level Changes with Overrides */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => {
        if (!open) {
          setConfirmDialog({
            open: false,
            routine: null,
            field: null,
            newValue: null,
            blockIndex: null,
            affectedCount: 0,
          });
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to default?</AlertDialogTitle>
            <AlertDialogDescription>
              This field has been customized at {confirmDialog.affectedCount} week/day level{confirmDialog.affectedCount > 1 ? 's' : ''}.
              Changing the block-level value will reset all customizations to the new default.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBlockChange}>
              Reset & Apply
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
