import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { CalendarIcon, X, ChevronDown, ChevronRight, ChevronLeft, EyeOff, Lock, Shuffle, Trash2, Moon, Plus, Star, Info, Cloud, Settings, Undo2, GripVertical, Edit, Bed, Copy, CheckCircle } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { AlertTriangle, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

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
  { id: "1", name: "Samuel Johnson", position: "Pitcher", age: 22, height: "5'8\"", weight: "145 lbs", levelOfPlay: "College", team: "State University", league: "NCAA Division I", season: "2024-25", xRole: "Starting Pitcher", status: "cleared", location: "Austin, TX" },
  { id: "2", name: "Michael Chen", position: "Catcher", age: 21, height: "6'0\"", weight: "180 lbs", levelOfPlay: "College", team: "State University", league: "NCAA Division I", season: "2024-25", xRole: "Starting Catcher", status: "cleared", location: "Dallas, TX" },
  { id: "3", name: "Ethan Rodriguez", position: "Outfielder", age: 20, height: "5'6\"", weight: "135 lbs", levelOfPlay: "High School", team: "Central High", league: "Varsity", season: "2024-25", xRole: "Center Field", status: "not cleared", location: "Houston, TX" },
  { id: "4", name: "James Williams", position: "Infielder", age: 23, height: "6'2\"", weight: "195 lbs", levelOfPlay: "Professional", team: "Minor League A", league: "MiLB", season: "2024-25", xRole: "Shortstop", status: "cleared", location: "San Antonio, TX" },
  { id: "5", name: "Oliver Martinez", position: "Pitcher", age: 19, height: "5'7\"", weight: "140 lbs", levelOfPlay: "College", team: "State University", league: "NCAA Division I", season: "2024-25", xRole: "Relief Pitcher", status: "cleared", location: "Austin, TX" },
  { id: "6", name: "Daniel Anderson", position: "First Base", age: 22, height: "6'1\"", weight: "190 lbs", levelOfPlay: "College", team: "State University", league: "NCAA Division I", season: "2024-25", xRole: "First Baseman", status: "cleared", location: "Dallas, TX" },
  { id: "7", name: "Sebastian Taylor", position: "Outfielder", age: 21, height: "5'5\"", weight: "130 lbs", levelOfPlay: "High School", team: "East High", league: "Varsity", season: "2024-25", xRole: "Left Field", status: "injured", location: "Houston, TX" },
  { id: "8", name: "Liam Brown", position: "Catcher", age: 20, height: "5'11\"", weight: "175 lbs", levelOfPlay: "College", team: "State University", league: "NCAA Division I", season: "2024-25", xRole: "Backup Catcher", status: "cleared", location: "Austin, TX" },
  { id: "9", name: "Alexander Davis", position: "Infielder", age: 18, height: "5'4\"", weight: "125 lbs", levelOfPlay: "High School", team: "West High", league: "Varsity", season: "2024-25", xRole: "Second Base", status: "cleared", location: "Dallas, TX" },
  { id: "10", name: "Noah Wilson", position: "Pitcher", age: 24, height: "6'0\"", weight: "185 lbs", levelOfPlay: "Professional", team: "Minor League AA", league: "MiLB", season: "2024-25", xRole: "Starting Pitcher", status: "cleared", location: "San Antonio, TX" },
];

const buildTypeOptions = [
  { id: "standard", label: "Standard", tooltip: "Standard program type" },
  { id: "intervention", label: "Intervention", tooltip: "Intervention program type" },
  { id: "custom", label: "Custom", tooltip: "Custom program type" },
];

// Template definitions
interface ProgramTemplate {
  id: string;
  name: string;
  description: string;
  suitableFor: {
    levelOfPlay?: string[];
    position?: string[];
    trainingSplit?: string[];
    season?: string[];
  };
}

const programTemplates: ProgramTemplate[] = [
  {
    id: "college-pitcher-offseason-4x2",
    name: "College Pitcher Off-Season 4x2",
    description: "4x2 split for college pitchers in off-season",
    suitableFor: {
      levelOfPlay: ["College"],
      position: ["Pitcher"],
      trainingSplit: ["4x2"],
      season: ["Off-Season"],
    },
  },
  {
    id: "college-hitter-preseason-3x2",
    name: "College Hitter Pre-Season 3x2",
    description: "3x2 split for college hitters in pre-season",
    suitableFor: {
      levelOfPlay: ["College"],
      position: ["Catcher", "Infielder", "Outfielder", "First Base"],
      trainingSplit: ["3x2"],
      season: ["Pre-Season"],
    },
  },
  {
    id: "pro-pitcher-season-2x1",
    name: "Pro Pitcher In-Season 2x1",
    description: "2x1 split for professional pitchers during season",
    suitableFor: {
      levelOfPlay: ["Professional"],
      position: ["Pitcher"],
      trainingSplit: ["2x1"],
      season: ["In-Season"],
    },
  },
  {
    id: "highschool-general-4x1",
    name: "High School General 4x1",
    description: "4x1 split for high school athletes",
    suitableFor: {
      levelOfPlay: ["High School"],
      trainingSplit: ["4x1"],
    },
  },
  {
    id: "college-pitcher-preseason-4x2",
    name: "College Pitcher Pre-Season 4x2",
    description: "4x2 split for college pitchers in pre-season",
    suitableFor: {
      levelOfPlay: ["College"],
      position: ["Pitcher"],
      trainingSplit: ["4x2"],
      season: ["Pre-Season"],
    },
  },
  {
    id: "college-hitter-offseason-3x1",
    name: "College Hitter Off-Season 3x1",
    description: "3x1 split for college hitters in off-season",
    suitableFor: {
      levelOfPlay: ["College"],
      position: ["Catcher", "Infielder", "Outfielder", "First Base"],
      trainingSplit: ["3x1"],
      season: ["Off-Season"],
    },
  },
  {
    id: "pro-hitter-season-3x2",
    name: "Pro Hitter In-Season 3x2",
    description: "3x2 split for professional hitters during season",
    suitableFor: {
      levelOfPlay: ["Professional"],
      position: ["Catcher", "Infielder", "Outfielder", "First Base"],
      trainingSplit: ["3x2"],
      season: ["In-Season"],
    },
  },
  {
    id: "highschool-pitcher-3x1",
    name: "High School Pitcher 3x1",
    description: "3x1 split for high school pitchers",
    suitableFor: {
      levelOfPlay: ["High School"],
      position: ["Pitcher"],
      trainingSplit: ["3x1"],
    },
  },
  {
    id: "college-general-4x2",
    name: "College General 4x2",
    description: "4x2 split for college athletes",
    suitableFor: {
      levelOfPlay: ["College"],
      trainingSplit: ["4x2"],
    },
  },
  {
    id: "pro-pitcher-offseason-4x1",
    name: "Pro Pitcher Off-Season 4x1",
    description: "4x1 split for professional pitchers in off-season",
    suitableFor: {
      levelOfPlay: ["Professional"],
      position: ["Pitcher"],
      trainingSplit: ["4x1"],
      season: ["Off-Season"],
    },
  },
  {
    id: "college-hitter-season-2x2",
    name: "College Hitter In-Season 2x2",
    description: "2x2 split for college hitters during season",
    suitableFor: {
      levelOfPlay: ["College"],
      position: ["Catcher", "Infielder", "Outfielder", "First Base"],
      trainingSplit: ["2x2"],
      season: ["In-Season"],
    },
  },
  {
    id: "general-3x2",
    name: "General 3x2",
    description: "3x2 split for general use",
    suitableFor: {
      trainingSplit: ["3x2"],
    },
  },
];

const routineTypeOptions = [
  { id: "movement", label: "Movement" },
  { id: "throwing", label: "Throwing" },
  { id: "lifting", label: "Lifting" },
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
  rpe?: string;
};

type LiftingCell = {
  exercises: Exercise[];
};

type ThrowingDayData = {
  phase: string;
  intensity: string;
  exercises: Exercise[];
};

type LiftingDayData = {
  intensity?: string;
  focus: string;
  emphasis: string;
  exercises: Exercise[];
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
  
  // Block season and sub-season state
  const [blockSeasons, setBlockSeasons] = useState<Map<number, string>>(new Map());
  const [blockSubSeasons, setBlockSubSeasons] = useState<Map<number, string>>(new Map());
  
  // Block start/end dates state for individual block date control
  const [blockStartDates, setBlockStartDates] = useState<Map<number, Date>>(new Map());
  const [blockEndDates, setBlockEndDates] = useState<Map<number, Date>>(new Map());
  
  // Track recently changed blocks for visual feedback
  const [recentlyChangedBlocks, setRecentlyChangedBlocks] = useState<Set<number>>(new Set());
  
  // Track editing block in blocks table
  const [editingBlockIndex, setEditingBlockIndex] = useState<number | null>(null);
  
  // Issue Resolution Modal state
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [warningsModalOpen, setWarningsModalOpen] = useState(false);
  const [errorsModalOpen, setErrorsModalOpen] = useState(false);
  
  // Routine settings state - stores settings at block level by default
  const [blockSettings, setBlockSettings] = useState<Map<number, Partial<RoutineSettings>>>(new Map());
  
  // Template selection state - one template per block
  const [blockTemplates, setBlockTemplates] = useState<Map<number, string>>(new Map());
  
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
  const [reviewBlockIndex, setReviewBlockIndex] = useState(0);
  const [reviewViewMode, setReviewViewMode] = useState<"week" | "block">("week");
  const [liftingData, setLiftingData] = useState<Map<string, LiftingDayData>>(new Map());
  const [throwingData, setThrowingData] = useState<Map<string, ThrowingDayData>>(new Map());
  const [movementData, setMovementData] = useState<Map<string, MovementDayData>>(new Map());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["lifting", "throwing", "movement"]));
  const [showRepSchemes, setShowRepSchemes] = useState(true);
  const [exerciseSwapModalOpen, setExerciseSwapModalOpen] = useState(false);
  const [selectedExerciseForSwap, setSelectedExerciseForSwap] = useState<{weekIndex: number; dayIndex: number; section: string; exerciseIndex: number; routineType: string} | null>(null);
  const [exerciseEditModalOpen, setExerciseEditModalOpen] = useState(false);
  const [selectedExerciseForEdit, setSelectedExerciseForEdit] = useState<{weekIndex: number; dayIndex: number; section: string; exerciseIndex: number; routineType: string; exercise: Exercise} | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "error">("saved");
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Step completion tracking
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  // Save as draft state
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [legendExpanded, setLegendExpanded] = useState(false);
  
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
      setLocation("/programs");
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
  const blocks = useMemo(() => {
    if (!startDate || !endDate) {
      return [];
    }

    const totalWeeks = differenceInWeeks(endDate, startDate);
    if (totalWeeks <= 0) {
      return [];
    }

    const generatedBlocks: Array<{ name: string; startDate: Date; endDate: Date }> = [];
    
    // Start from the selected start date
    let currentStart = new Date(startDate);
    
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

      // Next block starts the day after this one ends
      currentStart = addDays(blockEnd, 1);
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

  // Get recommended templates based on athlete demographics and block settings
  const getRecommendedTemplates = (blockIndex: number): ProgramTemplate[] => {
    if (!selectedAthlete) return programTemplates;
    
    const blockSetting = blockSettings.get(blockIndex);
    const trainingSplit = blockSetting?.lifting?.["training-split"] as string || "";
    const season = blockSetting?.schedule?.season as string || "";
    const position = selectedAthlete.position || "";
    const levelOfPlay = selectedAthlete.levelOfPlay || "";
    
    // Filter templates based on suitability
    return programTemplates.filter(template => {
      const { suitableFor } = template;
      
      // Check level of play match
      if (suitableFor.levelOfPlay && suitableFor.levelOfPlay.length > 0) {
        if (!levelOfPlay || !suitableFor.levelOfPlay.includes(levelOfPlay)) {
          return false;
        }
      }
      
      // Check position match
      if (suitableFor.position && suitableFor.position.length > 0) {
        const isPitcher = position.toLowerCase().includes("pitcher");
        const isHitter = !isPitcher;
        const templateForPitcher = suitableFor.position.some(p => p.toLowerCase().includes("pitcher"));
        const templateForHitter = suitableFor.position.some(p => !p.toLowerCase().includes("pitcher"));
        
        if (isPitcher && !templateForPitcher) return false;
        if (isHitter && !templateForHitter) return false;
      }
      
      // Check training split match
      if (suitableFor.trainingSplit && suitableFor.trainingSplit.length > 0 && trainingSplit) {
        if (!suitableFor.trainingSplit.includes(trainingSplit)) {
          return false;
        }
      }
      
      // Check season match
      if (suitableFor.season && suitableFor.season.length > 0 && season) {
        if (!suitableFor.season.includes(season)) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Initialize default values for blocks when athlete is selected and blocks are created
  useEffect(() => {
    if (!selectedAthlete || blocks.length === 0) return;
    
    const isPitcher = selectedAthlete.position?.toLowerCase().includes("pitcher") || false;
    
    // Initialize xRole defaults for each block (pitcher only)
    setBlockSettings(prev => {
      const newMap = new Map(prev);
      let needsUpdate = false;
      
      blocks.forEach((_, blockIndex) => {
        const existing = newMap.get(blockIndex) || {};
        if (!existing.xrole) {
          newMap.set(blockIndex, {
            ...existing,
            xrole: {
              ...existing.xrole,
              pitcher: isPitcher ? "rotation-starter" : undefined,
            },
          });
          needsUpdate = true;
        } else {
          // Ensure defaults are set if not present
          if (!existing.xrole.pitcher && isPitcher) {
            newMap.set(blockIndex, {
              ...existing,
              xrole: {
                ...existing.xrole,
                pitcher: "rotation-starter",
              },
            });
            needsUpdate = true;
          }
        }
      });
      
      return needsUpdate ? newMap : prev;
    });
    
    // Initialize season and sub-season defaults (all blocks default to Off-Season / General Off-Season)
    blocks.forEach((_, blockIndex) => {
      if (!blockSeasons.has(blockIndex)) {
        setBlockSeasons(prev => {
          const newMap = new Map(prev);
          newMap.set(blockIndex, "off-season");
          return newMap;
        });
      }
      if (!blockSubSeasons.has(blockIndex)) {
        setBlockSubSeasons(prev => {
          const newMap = new Map(prev);
          newMap.set(blockIndex, "general-off-season");
          return newMap;
        });
      }
    });
  }, [selectedAthlete, blocks.length]);

  // Check if step 1 is complete (all required fields filled)
  // Note: blockDuration is fixed at 4 weeks, so we don't need to check it
  const isStep1Complete = useMemo(() => {
    return !!(selectedAthleteId && startDate && endDate && routineTypes.length > 0 && blocks.length > 0);
  }, [selectedAthleteId, startDate, endDate, routineTypes, blocks.length]);

  // Detect issues for Issue Resolution Modal
  const issues = useMemo(() => {
    const blockingIssues: Array<{ type: 'error' | 'warning'; category: string; description: string; affected: string; action?: string }> = [];
    const warnings: Array<{ type: 'error' | 'warning'; category: string; description: string; affected: string; action?: string }> = [];

    // Athlete Selection Issue
    if (!selectedAthleteId) {
      blockingIssues.push({
        type: 'error',
        category: 'Athlete Selection',
        description: 'Please select an athlete before proceeding',
        affected: 'Athlete Selection',
        action: 'Select Athlete'
      });
    }

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
    // (Monday requirement removed)

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
      // (Mid-week end date warnings removed - blocks can end on any day)

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

    return { 
      blocking: blockingIssues, 
      warnings, 
      total: blockingIssues.length + warnings.length 
    };
  }, [selectedAthlete, startDate, endDate, blocks, blockStartDates, blockEndDates, routineTypes]);

  // Helper function to handle step navigation
  const handleStepNavigation = (targetStep: number) => {
    // Can navigate to current step or any completed step
    if (targetStep === currentStep || completedSteps.has(targetStep)) {
      setCurrentStep(targetStep);
    }
  };

  // Helper function to handle Next button click
  const handleNext = () => {
    console.log('handleNext called, currentStep:', currentStep, 'issues:', issues);
    // For Step 2 -> Step 3, be very permissive - only block on absolutely critical issues
    let shouldBlock = false;
    
    if (!selectedAthleteId) {
      shouldBlock = true;
    } else if (currentStep === 2) {
      // For Step 2, only block on absolutely critical issues:
      // - Athlete status issues
      // - Date overlaps that would break the program
      const criticalIssues = (issues?.blocking || []).filter(issue => 
        issue.category === 'Athlete Status' ||
        issue.category === 'Block Overlap' ||
        issue.category === 'Program Duration'
      );
      shouldBlock = criticalIssues.length > 0;
    } else {
      // For Step 1, check all blocking issues
      shouldBlock = (issues?.blocking || []).length > 0;
    }
    
    console.log('shouldBlock:', shouldBlock);
    
    if (shouldBlock) {
      setIssueModalOpen(true);
      return;
    }

    // If on Step 3, submit the form
    if (currentStep === 3) {
      form.handleSubmit(handleSubmit)();
      return;
    }

    // Mark current step as complete
    setCompletedSteps(prev => new Set(prev).add(currentStep));
    
    // Auto-save before advancing
    handleSaveAsDraft();
    
    // Advance to next step
    if (currentStep < 3) {
      console.log('Advancing from step', currentStep, 'to step', currentStep + 1);
      setCurrentStep(currentStep + 1);
    }
  };

  // Helper function to save as draft
  const handleSaveAsDraft = () => {
    // In a real implementation, this would save to backend
    // For now, just update the timestamp
    setLastSaved(new Date());
    toast({
      title: "Saved",
      description: "Program saved as draft",
    });
  };

  // Helper function to get next button text
  const getNextButtonText = () => {
    switch (currentStep) {
      case 1:
        return "Next";
      case 2:
        return "Next";
      case 3:
        return "Save Program";
      default:
        return "Next";
    }
  };

  // Helper function to format last saved time
  const getLastSavedText = () => {
    if (!lastSaved) return null;
    const minutesAgo = Math.floor((new Date().getTime() - lastSaved.getTime()) / 60000);
    if (minutesAgo < 1) return "Just now";
    if (minutesAgo === 1) return "1 min ago";
    return `${minutesAgo} min ago`;
  };

  // Helper function to check if there are unsaved changes
  const hasUnsavedChanges = () => {
    return selectedAthleteId || startDate || endDate || routineTypes.length > 0;
  };

  // Helper function to handle back button
  const handleBack = () => {
    if (hasUnsavedChanges()) {
      setShowDiscardModal(true);
    } else {
      setLocation("/programs");
    }
  };

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
  const getLiftingDayKey = (weekIndex: number, dayIndex: number) => `lifting-w${weekIndex}-d${dayIndex}`;
  
  // Helper function to get 4x2 focus based on day of week
  // dayIndex: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  const get4x2Focus = (dayIndex: number): string => {
    // Mon: Lower Body #1, Tue: Upper Body #1, Wed: Conditioning #1
    // Thu: Rest, Fri: Lower Body #2, Sat: Upper Body #2, Sun: Conditioning #2
    switch (dayIndex) {
      case 1: // Monday
        return "Lower Body #1";
      case 2: // Tuesday
        return "Upper Body #1";
      case 3: // Wednesday
        return "Conditioning #1";
      case 4: // Thursday
        return "Rest"; // This will be handled by isRest check
      case 5: // Friday
        return "Lower Body #2";
      case 6: // Saturday
        return "Upper Body #2";
      case 0: // Sunday
        return "Conditioning #2";
      default:
        return "Non-specific";
    }
  };
  
  const getLiftingDayData = (weekIndex: number, dayIndex: number): LiftingDayData => {
    const key = getLiftingDayKey(weekIndex, dayIndex);
    const existing = liftingData.get(key);
    if (existing) {
      return existing;
    }
    // Return default with 4x2 focus pattern
    return {
      focus: get4x2Focus(dayIndex),
      emphasis: "Restorative",
      intensity: "light",
      exercises: [],
    };
  };
  
  // Helper functions for throwing and movement data
  const getThrowingDayKey = (weekIndex: number, dayIndex: number) => `throwing-w${weekIndex}-d${dayIndex}`;
  const getMovementDayKey = (weekIndex: number, dayIndex: number) => `movement-w${weekIndex}-d${dayIndex}`;
  
  const getThrowingDayData = (weekIndex: number, dayIndex: number): ThrowingDayData => {
    const key = getThrowingDayKey(weekIndex, dayIndex);
    return throwingData.get(key) || {
      phase: "pitch-design",
      intensity: "moderate",
      exercises: [],
    };
  };
  
  const getMovementDayData = (weekIndex: number, dayIndex: number): MovementDayData => {
    const key = getMovementDayKey(weekIndex, dayIndex);
    return movementData.get(key) || {
      intensity: "moderate",
      volume: "standard",
      exercises: [],
    };
  };
  
  const updateThrowingDayData = (weekIndex: number, dayIndex: number, data: Partial<ThrowingDayData>) => {
    const key = getThrowingDayKey(weekIndex, dayIndex);
    const existing = getThrowingDayData(weekIndex, dayIndex);
    setThrowingData(prev => {
      const newMap = new Map(prev);
      newMap.set(key, { ...existing, ...data });
      return newMap;
    });
  };
  
  const updateMovementDayData = (weekIndex: number, dayIndex: number, data: Partial<MovementDayData>) => {
    const key = getMovementDayKey(weekIndex, dayIndex);
    const existing = getMovementDayData(weekIndex, dayIndex);
    setMovementData(prev => {
      const newMap = new Map(prev);
      newMap.set(key, { ...existing, ...data });
      return newMap;
    });
  };
  
  const addThrowingExercise = (weekIndex: number, dayIndex: number) => {
    const key = getThrowingDayKey(weekIndex, dayIndex);
    const dayData = getThrowingDayData(weekIndex, dayIndex);
    const newExercise: Exercise = {
      id: `throwing-${key}-${Date.now()}`,
      targetBodyGroup: "Throwing",
      name: "Flatground Throwing",
      sets: 1,
      reps: 20,
      restTime: "2:00",
      tempo: "",
    };
    setThrowingData(prev => {
      const newMap = new Map(prev);
      newMap.set(key, {
        ...dayData,
        exercises: [...dayData.exercises, newExercise],
      });
      return newMap;
    });
  };
  
  const addMovementExercise = (weekIndex: number, dayIndex: number) => {
    const key = getMovementDayKey(weekIndex, dayIndex);
    const dayData = getMovementDayData(weekIndex, dayIndex);
    const newExercise: Exercise = {
      id: `movement-${key}-${Date.now()}`,
      targetBodyGroup: "Movement",
      name: "Hip Mobility Circuit",
      sets: 2,
      reps: 10,
      restTime: "60s",
      tempo: "",
    };
    setMovementData(prev => {
      const newMap = new Map(prev);
      newMap.set(key, {
        ...dayData,
        exercises: [...dayData.exercises, newExercise],
      });
      return newMap;
    });
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
  
  const shuffleExercise = (weekIndex: number, dayIndex: number, exerciseIndex: number) => {
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
    
    if (dayData.exercises[exerciseIndex]) {
      const updatedExercises = [...dayData.exercises];
      updatedExercises[exerciseIndex] = {
        ...updatedExercises[exerciseIndex],
        targetBodyGroup: randomExercise.targetBodyGroup,
        name: randomExercise.name,
      };
      
      setLiftingData(prev => {
        const newMap = new Map(prev);
        newMap.set(key, {
          ...dayData,
          exercises: updatedExercises,
        });
        return newMap;
      });
    }
  };
  
  const shuffleThrowingExercise = (weekIndex: number, dayIndex: number, exerciseIndex: number) => {
    const mockExercises = [
      { targetBodyGroup: "Throwing", name: "Long Toss" },
      { targetBodyGroup: "Throwing", name: "Bullpen Session" },
      { targetBodyGroup: "Throwing", name: "Flat Ground" },
      { targetBodyGroup: "Throwing", name: "Plyo Ball" },
    ];
    
    const randomExercise = mockExercises[Math.floor(Math.random() * mockExercises.length)];
    const key = getThrowingDayKey(weekIndex, dayIndex);
    const dayData = getThrowingDayData(weekIndex, dayIndex);
    
    if (dayData.exercises[exerciseIndex]) {
      const updatedExercises = [...dayData.exercises];
      updatedExercises[exerciseIndex] = {
        ...updatedExercises[exerciseIndex],
        targetBodyGroup: randomExercise.targetBodyGroup,
        name: randomExercise.name,
      };
      
      setThrowingData(prev => {
        const newMap = new Map(prev);
        newMap.set(key, {
          ...dayData,
          exercises: updatedExercises,
        });
        return newMap;
      });
    }
  };

  const shuffleMovementExercise = (weekIndex: number, dayIndex: number, exerciseIndex: number) => {
    const mockExercises = [
      { targetBodyGroup: "Movement", name: "Hip Mobility" },
      { targetBodyGroup: "Movement", name: "Shoulder Mobility" },
      { targetBodyGroup: "Movement", name: "Dynamic Warm-up" },
      { targetBodyGroup: "Movement", name: "Foam Rolling" },
    ];
    
    const randomExercise = mockExercises[Math.floor(Math.random() * mockExercises.length)];
    const key = getMovementDayKey(weekIndex, dayIndex);
    const dayData = getMovementDayData(weekIndex, dayIndex);
    
    if (dayData.exercises[exerciseIndex]) {
      const updatedExercises = [...dayData.exercises];
      updatedExercises[exerciseIndex] = {
        ...updatedExercises[exerciseIndex],
        targetBodyGroup: randomExercise.targetBodyGroup,
        name: randomExercise.name,
      };
      
      setMovementData(prev => {
        const newMap = new Map(prev);
        newMap.set(key, {
          ...dayData,
          exercises: updatedExercises,
        });
        return newMap;
      });
    }
  };

  const removeThrowingExercise = (weekIndex: number, dayIndex: number, exerciseIndex: number) => {
    const key = getThrowingDayKey(weekIndex, dayIndex);
    const dayData = getThrowingDayData(weekIndex, dayIndex);
    const updatedExercises = dayData.exercises.filter((_, idx) => idx !== exerciseIndex);
    
    setThrowingData(prev => {
      const newMap = new Map(prev);
      newMap.set(key, {
        ...dayData,
        exercises: updatedExercises,
      });
      return newMap;
    });
  };

  const removeExercise = (weekIndex: number, dayIndex: number, exerciseIndex: number) => {
    const key = getLiftingDayKey(weekIndex, dayIndex);
    const dayData = getLiftingDayData(weekIndex, dayIndex);
    const updatedExercises = dayData.exercises.filter((_, idx) => idx !== exerciseIndex);
    
    setLiftingData(prev => {
      const newMap = new Map(prev);
      newMap.set(key, {
        ...dayData,
        exercises: updatedExercises,
      });
      return newMap;
    });
  };
  
  const clearCell = (weekIndex: number, dayIndex: number) => {
    const key = getLiftingDayKey(weekIndex, dayIndex);
    const dayData = getLiftingDayData(weekIndex, dayIndex);
    
    setLiftingData(prev => {
      const newMap = new Map(prev);
      newMap.set(key, {
        ...dayData,
        exercises: [],
      });
      return newMap;
    });
  };
  
  const addExercises = (weekIndex: number, dayIndex: number) => {
    const key = getLiftingDayKey(weekIndex, dayIndex);
    const dayData = getLiftingDayData(weekIndex, dayIndex);
    
    // Generate sample exercises
    const newExercises: Exercise[] = [
      {
        id: `ex1-${key}-${Date.now()}`,
        targetBodyGroup: "Upper Body [Pressing]",
        name: "Barbell Bench Press",
        sets: 4,
        reps: 8,
        restTime: "2:00",
        weight: "185 lbs",
        tempo: "3-0-1-0",
      },
      {
        id: `ex2-${key}-${Date.now()}`,
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
        exercises: [...dayData.exercises, ...newExercises],
      });
      return newMap;
    });
  };
  
  // Update exercise function
  const updateExercise = (weekIndex: number, dayIndex: number, exerciseIndex: number, routineType: string, updatedExercise: Partial<Exercise>) => {
    if (routineType === "lifting") {
      const key = getLiftingDayKey(weekIndex, dayIndex);
      const dayData = getLiftingDayData(weekIndex, dayIndex);
      const updatedExercises = dayData.exercises.map((ex, idx) => 
        idx === exerciseIndex ? { ...ex, ...updatedExercise } : ex
      );
      
      setLiftingData(prev => {
        const newMap = new Map(prev);
        newMap.set(key, {
          ...dayData,
          exercises: updatedExercises,
        });
        return newMap;
      });
    } else if (routineType === "throwing") {
      const key = getThrowingDayKey(weekIndex, dayIndex);
      const dayData = getThrowingDayData(weekIndex, dayIndex);
      const updatedExercises = dayData.exercises.map((ex, idx) => 
        idx === exerciseIndex ? { ...ex, ...updatedExercise } : ex
      );
      
      setThrowingData(prev => {
        const newMap = new Map(prev);
        newMap.set(key, {
          ...dayData,
          exercises: updatedExercises,
        });
        return newMap;
      });
    } else if (routineType === "movement") {
      const key = getMovementDayKey(weekIndex, dayIndex);
      const dayData = getMovementDayData(weekIndex, dayIndex);
      const updatedExercises = dayData.exercises.map((ex, idx) => 
        idx === exerciseIndex ? { ...ex, ...updatedExercise } : ex
      );
      
      setMovementData(prev => {
        const newMap = new Map(prev);
        newMap.set(key, {
          ...dayData,
          exercises: updatedExercises,
        });
        return newMap;
      });
    }
  };
  
  // Initialize sample exercises for demo - pre-fill by default
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
        intensity: "light",
        focus: get4x2Focus(dayIndex),
        emphasis: "Restorative",
        exercises: sampleExercises,
      });
      return newMap;
    });
  };

  const initializeThrowingExercises = (weekIndex: number, dayIndex: number) => {
    const key = getThrowingDayKey(weekIndex, dayIndex);
    if (throwingData.has(key)) return; // Already initialized
    
    const sampleExercises: Exercise[] = [
      {
        id: `throwing-${key}-1`,
        targetBodyGroup: "Throwing",
        name: "Flatground Throwing",
        sets: 1,
        reps: 20,
        restTime: "2:00",
        tempo: "",
      },
    ];
    
    setThrowingData(prev => {
      const newMap = new Map(prev);
      newMap.set(key, {
        phase: "pitch-design",
        intensity: "moderate",
        exercises: sampleExercises,
      });
      return newMap;
    });
  };

  const initializeMovementExercises = (weekIndex: number, dayIndex: number) => {
    const key = getMovementDayKey(weekIndex, dayIndex);
    if (movementData.has(key)) return; // Already initialized
    
    const sampleExercises: Exercise[] = [
      {
        id: `movement-${key}-1`,
        targetBodyGroup: "Movement",
        name: "Hip Mobility Circuit",
        sets: 2,
        reps: 10,
        restTime: "60s",
        tempo: "",
      },
    ];
    
    setMovementData(prev => {
      const newMap = new Map(prev);
      newMap.set(key, {
        intensity: "moderate",
        volume: "standard",
        exercises: sampleExercises,
      });
      return newMap;
    });
  };

  // Step 3 Helper Functions
  // Calculate weeks for the selected block
  const getWeeksInBlock = useMemo(() => {
    if (!startDate || !endDate || blocks.length === 0) return [];
    const block = blocks[reviewBlockIndex];
    if (!block) return [];
    
    const weeks: Array<{ startDate: Date; endDate: Date; weekNumber: number }> = [];
    let currentDate = new Date(block.startDate);
    let weekNumber = 1;
    
    while (currentDate <= block.endDate) {
      const weekMonday = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekStart = weekMonday < block.startDate ? block.startDate : weekMonday;
      const weekSunday = endOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = weekSunday > block.endDate ? block.endDate : weekSunday;
      
      weeks.push({
        startDate: weekStart,
        endDate: weekEnd,
        weekNumber: weekNumber++,
      });
      
      currentDate = addDays(weekSunday, 1);
    }
    
    return weeks;
  }, [startDate, endDate, blocks, reviewBlockIndex]);

  // Get current week dates
  const currentWeek = useMemo(() => {
    if (getWeeksInBlock.length === 0) return null;
    return getWeeksInBlock[reviewWeekIndex] || getWeeksInBlock[0];
  }, [getWeeksInBlock, reviewWeekIndex]);

  // Get days of week with dates - always starts on Monday
  const getDaysOfWeek = useMemo(() => {
    if (!currentWeek) return [];
    const days = [];
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    // Always start from Monday of the week
    const weekMonday = startOfWeek(currentWeek.startDate, { weekStartsOn: 1 });
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekMonday, i);
      const dayOfWeek = getDay(date);
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to Sunday=6
      // In Step 3, Thursday (dayOfWeek === 4) is always rest for 4x2 split
      const isRest = currentStep === 3 
        ? (calculatedDaysOff.has(dayOfWeek) || dayOfWeek === 4) // Thursday is always rest in Step 3
        : calculatedDaysOff.has(dayOfWeek);
      days.push({
        name: dayNames[dayIndex],
        date,
        dayIndex: dayOfWeek, // 0=Sunday, 1=Monday, etc.
        isRest,
      });
    }
    
    return days;
  }, [currentWeek, calculatedDaysOff, currentStep]);

  // Auto-save effect for Step 3
  useEffect(() => {
    if (currentStep === 3) {
      // Initialize exercises for all days in all weeks for all routines
      getWeeksInBlock.forEach((week, weekIdx) => {
        const weekMonday = startOfWeek(week.startDate, { weekStartsOn: 1 });
        for (let i = 0; i < 7; i++) {
          const date = addDays(weekMonday, i);
          const dayOfWeek = getDay(date);
          // In Step 3, skip Thursday (dayOfWeek === 4) as it's always rest for 4x2 split
          const isRest = calculatedDaysOff.has(dayOfWeek) || dayOfWeek === 4;
          if (!isRest) {
            if (routineTypes.includes("lifting")) {
              initializeSampleExercises(weekIdx, dayOfWeek);
            }
            if (routineTypes.includes("throwing")) {
              initializeThrowingExercises(weekIdx, dayOfWeek);
            }
            if (routineTypes.includes("movement")) {
              initializeMovementExercises(weekIdx, dayOfWeek);
            }
          }
        }
      });
      
      // Also initialize for current week view
      getDaysOfWeek.forEach((day) => {
        if (!day.isRest) {
          if (routineTypes.includes("lifting")) {
            initializeSampleExercises(reviewWeekIndex, day.dayIndex);
          }
          if (routineTypes.includes("throwing")) {
            initializeThrowingExercises(reviewWeekIndex, day.dayIndex);
          }
          if (routineTypes.includes("movement")) {
            initializeMovementExercises(reviewWeekIndex, day.dayIndex);
          }
        }
      });
      
      // Set up auto-save interval (every 2 minutes)
      const interval = setInterval(() => {
        setSaveStatus("saving");
        handleSaveAsDraft();
        setTimeout(() => setSaveStatus("saved"), 1000);
      }, 120000); // 2 minutes
      
      setAutoSaveInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [currentStep, reviewWeekIndex, getDaysOfWeek, getWeeksInBlock, routineTypes, calculatedDaysOff]);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Get template name for current block
  const getCurrentTemplateName = () => {
    const templateId = blockTemplates.get(reviewBlockIndex);
    if (!templateId) return "No Template Selected";
    const template = programTemplates.find(t => t.id === templateId);
    return template?.name || "Unknown Template";
  };

  // Block View Helper Functions
  // Generate color for exercise (consistent across weeks)
  const exerciseColors = useMemo(() => {
    const colors = [
      "bg-blue-500/20 border-blue-500/50",
      "bg-green-500/20 border-green-500/50",
      "bg-purple-500/20 border-purple-500/50",
      "bg-orange-500/20 border-orange-500/50",
      "bg-pink-500/20 border-pink-500/50",
      "bg-cyan-500/20 border-cyan-500/50",
      "bg-yellow-500/20 border-yellow-500/50",
      "bg-indigo-500/20 border-indigo-500/50",
      "bg-red-500/20 border-red-500/50",
      "bg-teal-500/20 border-teal-500/50",
    ];
    const colorMap = new Map<string, string>();
    let colorIndex = 0;
    
    // Assign colors to exercises across all weeks
    getWeeksInBlock.forEach((week, weekIdx) => {
      const weekMonday = startOfWeek(week.startDate, { weekStartsOn: 1 });
      for (let i = 0; i < 7; i++) {
        const date = addDays(weekMonday, i);
        const dayOfWeek = getDay(date); // 0=Sunday, 1=Monday, etc.
        const dayData = getLiftingDayData(weekIdx, dayOfWeek);
        dayData.exercises.forEach((ex) => {
          if (!colorMap.has(ex.name)) {
            colorMap.set(ex.name, colors[colorIndex % colors.length]);
            colorIndex++;
          }
        });
      }
    });
    
    return colorMap;
  }, [getWeeksInBlock, liftingData]);

  // Get exercise bands for block view
  const getExerciseBands = useMemo(() => {
    const bands: Array<{
      exercise: Exercise;
      weekIndex: number;
      dayIndex: number;
      weekNumber: number;
      dayName: string;
      date: Date;
    }> = [];
    
    getWeeksInBlock.forEach((week, weekIdx) => {
      const weekMonday = startOfWeek(week.startDate, { weekStartsOn: 1 });
      const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      
      for (let i = 0; i < 7; i++) {
        const date = addDays(weekMonday, i);
        const dayOfWeek = getDay(date);
        const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const dayName = dayNames[dayIndex];
        
        if (!calculatedDaysOff.has(dayOfWeek) && dayOfWeek !== 4) { // Skip Thursday (always rest in Step 3)
          const dayData = getLiftingDayData(weekIdx, dayOfWeek);
          dayData.exercises.forEach((exercise) => {
            bands.push({
              exercise,
              weekIndex: weekIdx,
              dayIndex: dayOfWeek,
              weekNumber: week.weekNumber,
              dayName,
              date,
            });
          });
        }
      }
    });
    
    return bands;
  }, [getWeeksInBlock, calculatedDaysOff, liftingData]);

  // Group exercises by target body group and create spanning bands
  const exerciseRows = useMemo(() => {
    const grouped = new Map<string, typeof getExerciseBands>();
    
    getExerciseBands.forEach((band) => {
      const key = band.exercise.targetBodyGroup || "Other";
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(band);
    });
    
    // Create spanning bands for exercises that appear in consecutive weeks/days
    const createSpans = (bands: typeof getExerciseBands) => {
      const spans: Array<{
        exercise: Exercise;
        startWeek: number;
        endWeek: number;
        startDay: number;
        endDay: number;
        weeks: number[];
        days: number[];
      }> = [];
      
      // Group by exercise name
      const byExercise = new Map<string, typeof bands>();
      bands.forEach(band => {
        if (!byExercise.has(band.exercise.name)) {
          byExercise.set(band.exercise.name, []);
        }
        byExercise.get(band.exercise.name)!.push(band);
      });
      
      byExercise.forEach((exerciseBands, exerciseName) => {
        // Sort by week and day
        const sorted = exerciseBands.sort((a, b) => {
          if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber;
          return a.dayIndex - b.dayIndex;
        });
        
        if (sorted.length > 0) {
          const exercise = sorted[0].exercise;
          const weeks = [...new Set(sorted.map(b => b.weekNumber))].sort((a, b) => a - b);
          const days = [...new Set(sorted.map(b => b.dayIndex))].sort((a, b) => a - b);
          
          spans.push({
            exercise,
            startWeek: weeks[0],
            endWeek: weeks[weeks.length - 1],
            startDay: days[0],
            endDay: days[days.length - 1],
            weeks,
            days,
          });
        }
      });
      
      return spans;
    };
    
    return Array.from(grouped.entries()).map(([targetBodyGroup, bands]) => ({
      targetBodyGroup,
      bands: bands.sort((a, b) => {
        if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber;
        return a.dayIndex - b.dayIndex;
      }),
      spans: createSpans(bands),
    }));
  }, [getExerciseBands, exerciseColors]);

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Fixed Header Component */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b bg-surface-base">
        <div className="flex h-16 items-center px-5">
          {/* Left Section (30%) */}
          <div className="flex items-center w-[30%]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-8 px-2 hover:bg-muted/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Center Section (40%) */}
          <div className="flex flex-col items-center justify-center flex-1 w-[40%]">
            {/* Progress Indicator */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((step) => {
                const isActive = currentStep === step;
                const isCompleted = completedSteps.has(step);
                const canNavigate = isActive || isCompleted;
                const stepNames = ["Scope", "Blocks", "Review"];
                
                return (
                  <div key={step} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => canNavigate && handleStepNavigation(step)}
                      disabled={!canNavigate}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors",
                        isActive && "bg-muted text-foreground",
                        isCompleted && !isActive && "text-foreground hover:bg-muted/50 cursor-pointer",
                        !isActive && !isCompleted && "text-muted-foreground cursor-not-allowed opacity-50"
                      )}
                    >
                      {isCompleted && !isActive && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                      <span>{step}: {stepNames[step - 1]}</span>
                    </button>
                    {step < 3 && <span className="text-muted-foreground">→</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Section (30%) */}
          <div className="flex items-center justify-end gap-2 w-[30%]">
            {/* Cancel Button */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDiscardModal(true)}
              className="text-xs"
            >
              Cancel
            </Button>

            {/* Save as Draft Button */}
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveAsDraft}
              className="text-xs"
            >
              Save as Draft
            </Button>

            {/* Next Button */}
            <div className="flex items-center gap-2">
              {/* Errors Badge */}
              {(issues?.blocking || []).length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setErrorsModalOpen(true)}
                        className="relative flex items-center gap-1.5 px-2.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-full transition-colors"
                      >
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-xs font-semibold text-red-500">
                          {issues.blocking.length}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {issues.blocking.length} blocking error{issues.blocking.length !== 1 ? 's' : ''} - Click to view
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Warnings Badge */}
              {(issues?.warnings || []).length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setWarningsModalOpen(true)}
                        className="relative flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 rounded-full transition-colors"
                      >
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className="text-xs font-semibold text-yellow-500">
                          {issues.warnings.length}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {issues.warnings.length} warning{issues.warnings.length !== 1 ? 's' : ''} - Click to view
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
            <Button
              type="button"
              onClick={handleNext}
              className="text-xs relative"
            >
              {getNextButtonText()}
            </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Discard Confirmation Modal */}
      <AlertDialog open={showDiscardModal} onOpenChange={setShowDiscardModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDiscardModal(false)}>
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDiscardModal(false);
                setLocation("/programs");
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                      <FormLabel className="text-xs">Athlete</FormLabel>
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
                          <Badge variant="destructive" icon={<AlertTriangle className="h-3 w-3" />}>
                            Not Cleared
                          </Badge>
                        ) : (
                          <Badge variant="destructive" icon={<AlertTriangle className="h-3 w-3" />}>
                            Injured
                          </Badge>
                        )}
                      </div>
                    )}

                    {selectedAthlete.status === "injured" && (
                      <div className="pt-2 border-t border-[#292928]">
                        <span className="text-xs text-[#979795] font-['Montserrat'] mb-2 block">Injuries:</span>
                        <ul className="list-disc list-inside space-y-1 text-xs text-[#f7f6f2] font-['Montserrat']">
                          <li>Right shoulder strain</li>
                          <li>Lower back tightness</li>
                        </ul>
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
                      <FormLabel className="text-xs">Build Type</FormLabel>
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
                      <FormLabel className="text-xs">Routine type</FormLabel>
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
                      <FormLabel className="text-xs">Start date</FormLabel>
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
                                
                                return false;
                              }}
                              modifiers={{
                                today: new Date(),
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
                          <FormLabel className="text-xs">Duration (weeks)</FormLabel>
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
                          <FormLabel className="text-xs">End date</FormLabel>
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
                              overlapsWithNew ? "border-yellow-500 bg-yellow-500/10" : "border-[#292928] bg-[#171716]"
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
                  // Removed - this notice is now only shown in the issues modal
                  return null;
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
                        {issues.blocking.length > 0 
                          ? "Cannot Continue - Issues Found" 
                          : "Review Issues - Warnings Found"}
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-['Montserrat']">
                        {issues.blocking.length > 0
                          ? `Please resolve the following ${issues.blocking.length} blocking issue${issues.blocking.length > 1 ? 's' : ''} before proceeding.`
                          : `Please review the following ${issues.warnings.length} warning${issues.warnings.length > 1 ? 's' : ''}.`}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="space-y-4 mt-4">
                      {/* Blocking Issues */}
                      {issues.blocking.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Blocking Issues ({issues.blocking.length})
                          </h4>
                          <div className="space-y-3">
                            {issues.blocking.map((issue, idx) => (
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
                          {issues.blocking.length} Blocking Issue{issues.blocking.length !== 1 ? 's' : ''}, {issues.warnings.length} Warning{issues.warnings.length !== 1 ? 's' : ''}
                        </div>
                        <div className="flex gap-2">
                          <AlertDialogCancel onClick={() => setIssueModalOpen(false)}>
                            Close
                          </AlertDialogCancel>
                          {issues.blocking.length === 0 && (
                            <AlertDialogAction onClick={() => {
                              setIssueModalOpen(false);
                              // Mark current step as complete
                              setCompletedSteps(prev => new Set(prev).add(currentStep));
                              // Auto-save before advancing
                              handleSaveAsDraft();
                              // Advance to next step
                              if (currentStep < 3) {
                                setCurrentStep(currentStep + 1);
                              } else if (currentStep === 3) {
                                // If on Step 3, submit the form
                                form.handleSubmit(handleSubmit)();
                              }
                            }}>
                              Continue Anyway
                            </AlertDialogAction>
                          )}
                        </div>
                      </div>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Warnings Modal */}
                <AlertDialog open={warningsModalOpen} onOpenChange={setWarningsModalOpen}>
                  <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-['Montserrat']">
                        Warnings Found
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-['Montserrat']">
                        Please review the following {issues.warnings.length} warning{issues.warnings.length !== 1 ? 's' : ''}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="space-y-4 mt-4">
                      {/* Warnings */}
                      {issues.warnings.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Warnings ({issues.warnings.length})
                          </h4>
                          <div className="space-y-3">
                            {issues.warnings.map((warning, idx) => (
                              <div key={idx} className="border border-yellow-500/30 rounded-lg p-3 bg-yellow-500/10">
                                <div className="flex items-start gap-3">
                                  <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
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
                          {issues.warnings.length} Warning{issues.warnings.length !== 1 ? 's' : ''}
                        </div>
                        <div className="flex gap-2">
                          <AlertDialogCancel onClick={() => setWarningsModalOpen(false)}>
                            Close
                          </AlertDialogCancel>
                        </div>
                      </div>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Errors Modal */}
                <AlertDialog open={errorsModalOpen} onOpenChange={setErrorsModalOpen}>
                  <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-['Montserrat']">
                        Cannot Continue - Errors Found
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-['Montserrat']">
                        Please resolve the following {issues.blocking.length} blocking error{issues.blocking.length !== 1 ? 's' : ''} before proceeding.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="space-y-4 mt-4">
                      {/* Blocking Issues */}
                      {issues.blocking.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Blocking Errors ({issues.blocking.length})
                          </h4>
                          <div className="space-y-3">
                            {issues.blocking.map((issue, idx) => (
                              <div key={idx} className="border border-red-500/30 rounded-lg p-3 bg-red-500/10">
                                <div className="flex items-start gap-3">
                                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
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
                    </div>

                    <AlertDialogFooter className="mt-6">
                      <div className="flex items-center justify-between w-full">
                        <div className="text-xs text-muted-foreground">
                          {issues.blocking.length} Blocking Error{issues.blocking.length !== 1 ? 's' : ''}
                        </div>
                        <div className="flex gap-2">
                          <AlertDialogCancel onClick={() => setErrorsModalOpen(false)}>
                            Close
                          </AlertDialogCancel>
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
                          <TableHead className="text-xs">Block</TableHead>
                          <TableHead className="text-xs">Start Date</TableHead>
                          <TableHead className="text-xs">End Date</TableHead>
                          <TableHead className="text-xs">Season</TableHead>
                          <TableHead className="text-xs">Sub-Season</TableHead>
                          <TableHead className="text-xs">Duration (weeks)</TableHead>
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
                          
                          // Ensure season and sub-season values are initialized
                          const currentSeason = blockSeasons.get(index) || "off-season";
                          const currentSubSeason = blockSubSeasons.get(index) || "general-off-season";
                          
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
                                      "flex h-8 w-full items-center justify-start gap-2 rounded-lg border border-[#292928] bg-[#292928] px-3 py-2 text-xs font-['Montserrat'] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors text-[#f7f6f2]"
                                    )}
                                  >
                                    <span>{format(blockEndDate, "EEE, MM/dd/yy")}</span>
                                    {isMidWeek && !isInvalid && (
                                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                    )}
                                    {isInvalid && (
                                      <AlertCircle className="h-4 w-4 text-red-500" />
                                    )}
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
                                        
                                        // Cascade: Update next block's start date to the day after this block ends
                                        if (index < blocks.length - 1) {
                                          const nextBlockStart = addDays(date, 1);
                                          
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
                            <TableCell>
                              <div className="text-xs text-muted-foreground">
                                Off-Season
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs text-muted-foreground">
                                General Off-Season (GOS)
                              </div>
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
                      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
                        <div key={d} className="text-center py-1">{d}</div>
                      ))}
                    </div>

                    {/* Month grid with large cells */}
                    <div className="grid grid-cols-7 gap-1">
                      {(() => {
                        const start = startOfWeek(startOfMonth(calendarMonth), { weekStartsOn: 1 });
                        const end = endOfWeek(endOfMonth(calendarMonth), { weekStartsOn: 1 });
                        const days: Date[] = [];
                        let cursor = new Date(start);
                        while (cursor <= end) {
                          days.push(new Date(cursor));
                          cursor = addDays(cursor, 1);
                        }

                        // Generate different shades of blue for each block
                        const blockColors = [
                          "bg-blue-500",
                          "bg-blue-600",
                          "bg-blue-400",
                          "bg-blue-700",
                          "bg-blue-300",
                          "bg-blue-800",
                        ];
                        
                        const getBlockColor = (blockIndex: number) => {
                          return blockColors[blockIndex % blockColors.length];
                        };

                        const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
                        
                        // Calculate week numbers for each day
                        const getWeekNumber = (day: Date) => {
                          if (!startDate) return null;
                          const weekStart = startOfWeek(day, { weekStartsOn: 1 });
                          const programStart = startOfWeek(startDate, { weekStartsOn: 1 });
                          const diffInMs = weekStart.getTime() - programStart.getTime();
                          const diffInWeeks = Math.floor(diffInMs / (7 * 24 * 60 * 60 * 1000));
                          return diffInWeeks >= 0 ? diffInWeeks + 1 : null;
                        };
                        
                        // Track which week we're in to show week label only once per week
                        let currentWeekNumber: number | null = null;
                        
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
                        
                        return days.map((day, dayIndex) => {
                          const inMonth = day.getMonth() === calendarMonth.getMonth();
                          const dayOfWeek = day.getDay();
                          
                          // Check if this is the start of a new week (Monday)
                          const isWeekStart = dayOfWeek === 1;
                          const weekNumber = getWeekNumber(day);
                          const showWeekLabel = isWeekStart && weekNumber !== null && weekNumber !== currentWeekNumber;
                          if (showWeekLabel) {
                            currentWeekNumber = weekNumber;
                          }
                          
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
                              {/* Week Number Label */}
                              {showWeekLabel && (
                                <div className="absolute top-0 left-0 bg-muted/80 text-xs font-medium px-1.5 py-0.5 rounded-br-md z-20">
                                  Week {weekNumber}
                                </div>
                              )}
                              
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
                                  const blockIndex = blocks.findIndex(block => block.name === b.name);
                                  const blockColor = getBlockColor(blockIndex);
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

                    {/* Comprehensive Legend */}
                    {(blocks.length > 0 || selectedAthleteId || activePrograms.length > 0) && (
                      <div className="mt-3 border-t pt-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setLegendExpanded(!legendExpanded);
                          }}
                          className="flex items-center justify-between w-full text-left hover:bg-muted/50 rounded-md px-1 py-1 transition-colors"
                        >
                          <h4 className="text-xs font-semibold">Legend</h4>
                          <ChevronDown className={cn("h-4 w-4 transition-transform", legendExpanded && "rotate-180")} />
                        </button>
                        
                        {legendExpanded && (
                          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3">
                            {/* Column 1: Program Blocks */}
                            <div className="space-y-2">
                              {blocks.length > 0 && (
                                <div className="space-y-1.5">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Program Blocks:</p>
                                  <div className="space-y-1">
                                    {blocks.map((block, index) => {
                                      const blockColors = [
                                        "bg-blue-500",
                                        "bg-blue-600",
                                        "bg-blue-400",
                                        "bg-blue-700",
                                        "bg-blue-300",
                                        "bg-blue-800",
                                      ];
                                      const blockColor = blockColors[index % blockColors.length];
                                      return (
                                        <div key={index} className="flex items-center gap-2">
                                          <span className={cn("h-3 w-3 rounded-sm inline-block", blockColor)} />
                                          <span className="text-xs text-muted-foreground">{block.name}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              
                              {/* Program Duration */}
                              {startDate && endDate && (
                                <div className="flex items-center gap-2">
                                  <div className="h-3 w-3 rounded-sm bg-blue-500/20 border border-blue-500" />
                                  <span className="text-xs text-muted-foreground">Program Duration</span>
                                </div>
                              )}
                              
                              {/* Existing Programming */}
                              {activePrograms.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="h-3 w-3 rounded-sm"
                                    style={{
                                      backgroundImage: 'repeating-linear-gradient(45deg, #808080, #808080 10px, transparent 10px, transparent 20px)'
                                    }}
                                  />
                                  <span className="text-xs text-muted-foreground">Existing Programming</span>
                                </div>
                              )}
                              
                              {/* Phase Boundary */}
                              {selectedAthlete?.phaseEndDate && (
                                <div className="flex items-center gap-2">
                                  <div className="h-3 w-3 rounded-sm bg-orange-500/20 border border-orange-500 border-dashed" />
                                  <span className="text-xs text-muted-foreground">Phase Boundary</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Column 2: Key Dates */}
                            <div className="space-y-2">
                              {selectedAthleteId && (
                                <div className="space-y-1.5">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Key Dates:</p>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Star className="h-3 w-3 text-blue-400 fill-blue-400" />
                                      <span className="text-xs text-muted-foreground">Game</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                      <span className="text-xs text-muted-foreground">Assessment</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Star className="h-3 w-3 text-green-400 fill-green-400" />
                                      <span className="text-xs text-muted-foreground">Training</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
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
                                </div>
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
                                <p className={cn("text-xs text-foreground", isDayOff && "opacity-50")}>
                                  {column.dateRange}
                                </p>
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
                      <div className="flex flex-col items-center shrink-0 sticky left-0 z-20 bg-background overflow-hidden">
                        <div className="flex items-center justify-center w-10 border-r bg-muted/10 relative" style={{ height: '40px' }}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="-rotate-90 whitespace-nowrap transform origin-center">
                              <span className="text-xs font-medium text-foreground">Schedule</span>
                            </div>
                          </div>
                        </div>
                        <div className="w-10 border-r bg-muted/10 flex-1" />
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
                        
                        return (
                          <div key={`schedule-${columnIndex}`} className="flex flex-col shrink-0 w-[236px] border-l mx-1">
                            {/* Season Display (Read-only) */}
                            <div className={cn(
                              "h-10 flex items-center border-b relative",
                              isDayOff ? "bg-muted/30" : "bg-muted/10"
                            )}>
                              {!isDayOff && (
                                <div className="px-3 text-xs text-muted-foreground">
                                  Off-Season
                                </div>
                              )}
                            </div>

                            {/* Sub-Season Display (Read-only) */}
                            <div className={cn(
                              "h-10 flex items-center relative",
                              isDayOff ? "bg-muted/30" : "bg-muted/10"
                            )}>
                              {!isDayOff && (
                                <div className="px-3 text-xs text-muted-foreground">
                                  General Off-Season (GOS)
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* xRole Section */}
                    <div className="flex min-w-max px-0 my-2 relative">
                      {/* Category Label (Rotated) */}
                      <div className="flex flex-col items-center shrink-0 sticky left-0 z-20 bg-background overflow-hidden">
                        <div className="flex items-center justify-center w-10 border-r bg-cyan-500/10 relative" style={{ height: '40px' }}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="-rotate-90 whitespace-nowrap transform origin-center">
                              <span className="text-xs font-medium text-cyan-700">xRole</span>
                            </div>
                          </div>
                        </div>
                        <div className="w-10 border-r bg-cyan-500/10 flex-1" />
                      </div>

                      {/* Row Headers */}
                      <div className="flex flex-col shrink-0 w-32 sticky left-10 z-20 bg-background border-r">
                        <div className="h-10 flex items-center px-3">
                          <p className="text-xs font-medium text-muted-foreground">xRole (Pitcher)</p>
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
                              "h-10 flex items-center relative",
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
                          </div>
                        );
                      })}
                    </div>

                    {/* Throwing Section */}
                    {routineTypes.includes("throwing") && (
                    <div className="flex min-w-max px-0 relative">
                      {/* Category Label (Rotated) */}
                      <div className="flex flex-col items-center shrink-0 sticky left-0 z-20 bg-background overflow-hidden">
                        <div className="flex items-center justify-center w-10 border-r bg-blue-500/10 relative" style={{ height: '40px' }}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="-rotate-90 whitespace-nowrap transform origin-center">
                              <p className="text-xs font-medium text-blue-700">Throwing</p>
                            </div>
                          </div>
                        </div>
                        <div className="w-10 border-r bg-blue-500/10 flex-1" />
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
                      <div className="flex flex-col items-center shrink-0 sticky left-0 z-20 bg-background overflow-hidden">
                        <div className="flex items-center justify-center w-10 border-r bg-violet-500/10 relative" style={{ height: '40px' }}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="-rotate-90 whitespace-nowrap transform origin-center">
                              <p className="text-xs font-medium text-foreground">Movement</p>
                            </div>
                          </div>
                        </div>
                        <div className="w-10 border-r bg-violet-500/10 flex-1" />
                      </div>

                      {/* Row Headers */}
                      <div className="flex flex-col shrink-0 w-32 sticky left-10 z-20 bg-background border-r">
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
                      <div className="flex flex-col items-center shrink-0 sticky left-0 z-20 bg-background overflow-hidden">
                        <div className="flex items-center justify-center w-10 border-r bg-orange-500/10 relative" style={{ height: '40px' }}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="-rotate-90 whitespace-nowrap transform origin-center">
                              <p className="text-xs font-medium text-orange-700">Lifting</p>
                            </div>
                          </div>
                        </div>
                        <div className="w-10 border-r bg-orange-500/10 flex-1" />
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
                      <div className="flex flex-col items-center shrink-0 sticky left-0 z-20 bg-background overflow-hidden">
                        <div className="flex items-center justify-center w-10 border-r bg-teal-500/10 relative" style={{ height: '40px' }}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="-rotate-90 whitespace-nowrap transform origin-center">
                              <span className="text-xs font-medium text-teal-700">Conditioning</span>
                            </div>
                          </div>
                        </div>
                        <div className="w-10 border-r bg-teal-500/10 flex-1" />
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

            {/* Step 3: Review Program */}
            {currentStep === 3 && (
              <div className="w-full flex flex-col h-[calc(100vh-4rem)]">
                {/* Top Bar */}
                <div className="border-b bg-background px-5 py-3">
                  <div className="flex items-center justify-between">
                    {/* Left Section - Block Selection and Week Navigation */}
                    <div className="flex items-center gap-4">
                      <Select value={reviewBlockIndex.toString()} onValueChange={(val) => {
                        setReviewBlockIndex(parseInt(val));
                        setReviewWeekIndex(0);
                      }}>
                        <SelectTrigger className="w-[180px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {blocks.map((block, idx) => (
                            <SelectItem key={idx} value={idx.toString()}>
                              Block {idx + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {getCurrentTemplateName() !== "No Template Selected" && (
                        <span className="text-xs text-muted-foreground">
                          Template: {getCurrentTemplateName()}
                        </span>
                      )}
                      {reviewViewMode === "week" && (
                        <>
                      <button
                        type="button"
                        onClick={() => setReviewWeekIndex(Math.max(0, reviewWeekIndex - 1))}
                        disabled={reviewWeekIndex === 0}
                            className="p-1.5 hover:bg-muted rounded disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                          <span className="text-xs font-medium">
                            Week {reviewWeekIndex + 1} of {getWeeksInBlock.length}
                      </span>
                      <button
                        type="button"
                            onClick={() => setReviewWeekIndex(Math.min(getWeeksInBlock.length - 1, reviewWeekIndex + 1))}
                            disabled={reviewWeekIndex >= getWeeksInBlock.length - 1}
                            className="p-1.5 hover:bg-muted rounded disabled:opacity-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                          {currentWeek && (
                            <span className="text-xs text-muted-foreground">
                              {format(currentWeek.startDate, "MMM d")} - {format(currentWeek.endDate, "MMM d, yyyy")}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Center Section - Segmented Control */}
                    <div className="flex items-center gap-2">
                      <ToggleGroup
                        type="single"
                        value={reviewViewMode}
                        onValueChange={(val) => val && setReviewViewMode(val as "week" | "block")}
                        variant="segmented"
                        className="h-10"
                      >
                        <ToggleGroupItem value="week" size="sm" className="text-xs h-10">Week View</ToggleGroupItem>
                        <ToggleGroupItem value="block" size="sm" className="text-xs h-10">Block View</ToggleGroupItem>
                      </ToggleGroup>
                  </div>
                    
                    {/* Right Section */}
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8">
                              <Undo2 className="h-4 w-4 mr-1.5" />
                              Undo
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Undo</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setShowRepSchemes(!showRepSchemes)}>
                            {showRepSchemes ? "Hide" : "Show"} Rep Schemes
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                {/* Week Grid View */}
                  {reviewViewMode === "week" && (
                    <div className="flex-1 overflow-auto">
                      {/* Week Grid - Table Layout */}
                      <div className="w-full overflow-x-auto">
                        {/* Column Headers */}
                        <div className="min-w-full border-b flex bg-muted/30">
                          {/* Empty space for routine column */}
                          <div className="w-10 shrink-0 border-r h-12" />
                          {/* Section header - empty */}
                          <div className="w-[120px] shrink-0 border-r h-12" />
                          {/* Day headers */}
                          {getDaysOfWeek.map((day, idx) => (
                            <div key={idx} className="w-[200px] shrink-0 text-center border-r h-12 px-3 flex flex-col justify-center">
                              <div className="text-xs font-semibold">{day.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {format(day.date, "MMM d")}
                              </div>
                            </div>
                          ))}
                </div>

                {/* Lifting Routine Table */}
                        {routineTypes.includes("lifting") && (
                          <div className="flex min-w-full border-b">
                            {/* Routine Label Column (Vertical) */}
                            <div className="flex flex-col shrink-0 sticky left-0 z-20 bg-background overflow-hidden">
                              <div className="flex items-center justify-center w-10 border-r bg-orange-500/10 relative h-12">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="-rotate-90 whitespace-nowrap transform origin-center">
                                    <span className="text-xs font-medium text-orange-700">Lifting</span>
                                  </div>
                                </div>
                              </div>
                              <div className="w-10 border-r bg-orange-500/10" style={{ height: 'calc(3 * 2.5rem + 5rem)' }} />
                            </div>
                            
                            {/* Table Content */}
                            <div className="flex min-w-full">
                              {/* Section Column */}
                              <div className="w-[120px] shrink-0 border-r bg-muted/5">
                                <div className="font-medium px-3 py-2.5 text-xs border-b h-10 flex items-center">Intensity</div>
                                <div className="font-medium px-3 py-2.5 text-xs border-b h-10 flex items-center">Focus</div>
                                <div className="font-medium px-3 py-2.5 text-xs border-b h-10 flex items-center">Emphasis</div>
                                <div className="font-medium px-3 py-2.5 text-xs border-b min-h-[80px] flex items-start pt-2.5">Exercises</div>
                                  </div>
                              {/* Day Columns */}
                              {getDaysOfWeek.map((day, dayIdx) => {
                                const dayData = getLiftingDayData(reviewWeekIndex, day.dayIndex);
                            
                            return (
                                  <div key={dayIdx} className={cn("w-[200px] shrink-0 border-r", day.isRest && "bg-muted/10")}>
                                    {/* Intensity */}
                                    <div className="px-3 py-2.5 text-center border-b h-10 flex items-center justify-center">
                                      {day.isRest ? (
                                        <Bed className="h-4 w-4 mx-auto text-muted-foreground" />
                                      ) : (
                                        <Select
                                          value={dayData.intensity || "light"}
                                          onValueChange={(value) => updateLiftingDayData(reviewWeekIndex, day.dayIndex, { intensity: value })}
                                        >
                                          <SelectTrigger className="h-8 text-xs border-0 shadow-none focus:ring-0 w-full">
                                            <SelectValue />
                                          </SelectTrigger>
                                    <SelectContent>
                                            <SelectItem value="light">Light</SelectItem>
                                            <SelectItem value="moderate">Moderate</SelectItem>
                                            <SelectItem value="heavy">Heavy</SelectItem>
                                            <SelectItem value="maximal">Maximal</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                                    </div>
                                    {/* Focus */}
                                    <div className="px-3 py-2.5 border-b h-10 flex items-center">
                                      {day.isRest ? (
                                        <Bed className="h-4 w-4 mx-auto text-muted-foreground" />
                                      ) : (
                                  <Select
                                    value={dayData.focus || get4x2Focus(day.dayIndex)}
                                          onValueChange={(value) => updateLiftingDayData(reviewWeekIndex, day.dayIndex, { focus: value })}
                                  >
                                          <SelectTrigger className="h-8 text-xs border-0 shadow-none focus:ring-0 w-full">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                            <SelectItem value="Lower Body #1">Lower Body #1</SelectItem>
                                            <SelectItem value="Upper Body #1">Upper Body #1</SelectItem>
                                            <SelectItem value="Conditioning #1">Conditioning #1</SelectItem>
                                            <SelectItem value="Lower Body #2">Lower Body #2</SelectItem>
                                            <SelectItem value="Upper Body #2">Upper Body #2</SelectItem>
                                            <SelectItem value="Conditioning #2">Conditioning #2</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                                    </div>
                                    {/* Emphasis */}
                                    <div className="px-3 py-2.5 border-b h-10 flex items-center">
                                      {day.isRest ? (
                                        <Bed className="h-4 w-4 mx-auto text-muted-foreground" />
                                      ) : (
                                  <Select
                                    value={dayData.emphasis || "Restorative"}
                                          onValueChange={(value) => updateLiftingDayData(reviewWeekIndex, day.dayIndex, { emphasis: value })}
                                  >
                                          <SelectTrigger className="h-8 text-xs border-0 shadow-none focus:ring-0 w-full">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Restorative">Restorative</SelectItem>
                                            <SelectItem value="Strength">Strength</SelectItem>
                                            <SelectItem value="Speed">Speed</SelectItem>
                                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                                    </div>
                                    {/* Exercises */}
                                    <div className="px-3 py-2 border-b min-h-[80px]">
                                      {day.isRest ? (
                                        <div className="flex items-center justify-center min-h-[80px]">
                                          <Bed className="h-5 w-5 mx-auto text-muted-foreground" />
                                        </div>
                                      ) : (
                                        <div className="space-y-1.5">
                                          {dayData.exercises.length === 0 ? (
                                            <button
                                              type="button"
                                              onClick={() => addExercises(reviewWeekIndex, day.dayIndex)}
                                              className="w-full h-14 border-2 border-dashed rounded-md flex items-center justify-center hover:bg-muted transition-colors"
                                            >
                                              <Plus className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                          ) : (
                                            dayData.exercises.map((exercise, exIdx) => (
                                              <div
                                                key={exercise.id || exIdx}
                                                className="bg-card border border-border rounded-md p-1.5 relative group"
                                              >
                                                <div className="flex items-start justify-between gap-1">
                                                  <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-semibold truncate">{exercise.name}</div>
                                                    {showRepSchemes && (
                                                      <div className="text-xs text-muted-foreground mt-0.5">
                                                        {exercise.sets} x {exercise.reps}
                                                      </div>
                                                    )}
                                                  </div>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setSelectedExerciseForEdit({
                                                        weekIndex: reviewWeekIndex,
                                                        dayIndex: day.dayIndex,
                                                        section: "exercises",
                                                        exerciseIndex: exIdx,
                                                        routineType: "lifting",
                                                        exercise: exercise,
                                                      });
                                                      setExerciseEditModalOpen(true);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-muted rounded"
                                                  >
                                                    <Edit className="h-3 w-3" />
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => shuffleExercise(reviewWeekIndex, day.dayIndex, exIdx)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-muted rounded"
                                                    title="Replace with alternate exercise"
                                                  >
                                                    <Shuffle className="h-3 w-3" />
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => removeExercise(reviewWeekIndex, day.dayIndex, exIdx)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-destructive/10 hover:text-destructive rounded"
                                                  >
                                                    <Trash2 className="h-3 w-3" />
                                                  </button>
                                                </div>
                                              </div>
                                            ))
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                            );
                          })}
                            </div>
                          </div>
                        )}

                        {/* Throwing Routine Table */}
                        {routineTypes.includes("throwing") && (
                          <div className="flex min-w-full border-b">
                            {/* Routine Label Column (Vertical) */}
                            <div className="flex flex-col shrink-0 sticky left-0 z-20 bg-background overflow-hidden">
                              <div className="flex items-center justify-center w-10 border-r bg-blue-500/10 relative h-12">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="-rotate-90 whitespace-nowrap transform origin-center">
                                    <span className="text-xs font-medium text-blue-700">Throwing</span>
                                  </div>
                                </div>
                              </div>
                              <div className="w-10 border-r bg-blue-500/10" style={{ height: 'calc(1 * 2.5rem + 5rem)' }} />
                            </div>
                            
                            {/* Table Content */}
                            <div className="flex min-w-full">
                              {/* Section Column */}
                              <div className="w-[120px] shrink-0 border-r bg-muted/5">
                                <div className="font-medium px-3 py-2.5 text-xs border-b h-10 flex items-center">Intensity</div>
                                <div className="font-medium px-3 py-2.5 text-xs border-b min-h-[80px] flex items-start pt-2.5">Exercises</div>
                              </div>
                              {/* Day Columns */}
                              {getDaysOfWeek.map((day, dayIdx) => (
                                <div key={dayIdx} className={cn("w-[200px] shrink-0 border-r", day.isRest && "bg-muted/10")}>
                                  {/* Intensity */}
                                  <div className="px-3 py-2.5 border-b h-10 flex items-center">
                                    {day.isRest ? (
                                      <Bed className="h-4 w-4 mx-auto text-muted-foreground" />
                                    ) : (
                                      <span className="text-xs">{getThrowingDayData(reviewWeekIndex, day.dayIndex).intensity || "moderate"}</span>
                                    )}
                                  </div>
                                  {/* Exercises */}
                                  <div className="px-3 py-2 border-b min-h-[80px]">
                                    {day.isRest ? (
                                      <div className="flex items-center justify-center min-h-[80px]">
                                        <Bed className="h-5 w-5 mx-auto text-muted-foreground" />
                                      </div>
                                    ) : (
                                      <div className="space-y-1.5">
                                        {getThrowingDayData(reviewWeekIndex, day.dayIndex).exercises.length === 0 ? (
                                                <button
                                                  type="button"
                                            onClick={() => addThrowingExercise(reviewWeekIndex, day.dayIndex)}
                                            className="w-full h-14 border-2 border-dashed rounded-md flex items-center justify-center hover:bg-muted transition-colors"
                                                >
                                            <Plus className="h-4 w-4 text-muted-foreground" />
                                                </button>
                                        ) : (
                                          getThrowingDayData(reviewWeekIndex, day.dayIndex).exercises.map((exercise, exIdx) => (
                                            <div
                                              key={exercise.id || exIdx}
                                              className="bg-card border border-border rounded-md p-1.5 relative group"
                                            >
                                              <div className="flex items-start justify-between gap-1">
                                              <div className="flex-1 min-w-0">
                                                  <div className="text-xs font-semibold truncate">{exercise.name}</div>
                                                  {showRepSchemes && (
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                      {exercise.sets} x {exercise.reps}
                                                </div>
                                                  )}
                                                </div>
                                                      <button
                                                        type="button"
                                                  onClick={() => {
                                                    setSelectedExerciseForEdit({
                                                      weekIndex: reviewWeekIndex,
                                                      dayIndex: day.dayIndex,
                                                      section: "exercises",
                                                      exerciseIndex: exIdx,
                                                      routineType: "throwing",
                                                      exercise: exercise,
                                                    });
                                                    setExerciseEditModalOpen(true);
                                                  }}
                                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-muted rounded"
                                                >
                                                  <Edit className="h-3 w-3" />
                                                      </button>
                                                      <button
                                                        type="button"
                                                        onClick={() => shuffleThrowingExercise(reviewWeekIndex, day.dayIndex, exIdx)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-muted rounded"
                                                        title="Replace with alternate exercise"
                                                      >
                                                        <Shuffle className="h-3 w-3" />
                                                      </button>
                                                      <button
                                                        type="button"
                                                  onClick={() => removeThrowingExercise(reviewWeekIndex, day.dayIndex, exIdx)}
                                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-destructive/10 hover:text-destructive rounded"
                                                      >
                                                        <Trash2 className="h-3 w-3" />
                                                      </button>
                                              </div>
                                            </div>
                                          ))
                                        )}
                                              </div>
                                    )}
                                              </div>
                                              </div>
                              ))}
                            </div>
                                                </div>
                                              )}

                        {/* Movement Routine Table */}
                        {routineTypes.includes("movement") && (
                          <div className="flex min-w-full border-b">
                            {/* Routine Label Column (Vertical) */}
                            <div className="flex flex-col shrink-0 sticky left-0 z-20 bg-background overflow-hidden">
                              <div className="flex items-center justify-center w-10 border-r bg-violet-500/10 relative h-12">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="-rotate-90 whitespace-nowrap transform origin-center">
                                    <span className="text-xs font-medium text-violet-700">Movement</span>
                                              </div>
                                            </div>
                                          </div>
                              <div className="w-10 border-r bg-violet-500/10" style={{ height: 'calc(2 * 2.5rem + 5rem)' }} />
                            </div>
                            
                            {/* Table Content */}
                            <div className="flex min-w-full">
                              {/* Section Column */}
                              <div className="w-[120px] shrink-0 border-r bg-muted/5">
                                <div className="font-medium px-3 py-2.5 text-xs border-b h-10 flex items-center">Intensity</div>
                                <div className="font-medium px-3 py-2.5 text-xs border-b h-10 flex items-center">Volume</div>
                                <div className="font-medium px-3 py-2.5 text-xs border-b min-h-[80px] flex items-start pt-2.5">Exercises</div>
                              </div>
                              {/* Day Columns */}
                              {getDaysOfWeek.map((day, dayIdx) => (
                                <div key={dayIdx} className={cn("w-[200px] shrink-0 border-r", day.isRest && "bg-muted/10")}>
                                  {/* Intensity */}
                                  <div className="px-3 py-2.5 border-b h-10 flex items-center">
                                    {day.isRest ? (
                                      <Bed className="h-4 w-4 mx-auto text-muted-foreground" />
                                    ) : (
                                      <span className="text-xs capitalize">{getMovementDayData(reviewWeekIndex, day.dayIndex).intensity || "moderate"}</span>
                                    )}
                                  </div>
                                  {/* Volume */}
                                  <div className="px-3 py-2.5 border-b h-10 flex items-center">
                                    {day.isRest ? (
                                      <Bed className="h-4 w-4 mx-auto text-muted-foreground" />
                                    ) : (
                                      <span className="text-xs capitalize">{getMovementDayData(reviewWeekIndex, day.dayIndex).volume || "standard"}</span>
                                    )}
                                  </div>
                                  {/* Exercises */}
                                  <div className="px-3 py-2 border-b min-h-[80px]">
                                    {day.isRest ? (
                                      <div className="flex items-center justify-center min-h-[80px]">
                                        <Bed className="h-5 w-5 mx-auto text-muted-foreground" />
                                      </div>
                                    ) : (
                                      <div className="space-y-1.5">
                                        {getMovementDayData(reviewWeekIndex, day.dayIndex).exercises.length === 0 ? (
                                        <button
                                          type="button"
                                            onClick={() => addMovementExercise(reviewWeekIndex, day.dayIndex)}
                                            className="w-full h-14 border-2 border-dashed rounded-md flex items-center justify-center hover:bg-muted transition-colors"
                                        >
                                            <Plus className="h-4 w-4 text-muted-foreground" />
                                        </button>
                                        ) : (
                                          getMovementDayData(reviewWeekIndex, day.dayIndex).exercises.map((exercise, exIdx) => (
                                            <div
                                              key={exercise.id || exIdx}
                                              className="bg-card border border-border rounded-md p-1.5 relative group"
                                            >
                                              <div className="flex items-start justify-between gap-1">
                                                <div className="flex-1 min-w-0">
                                                  <div className="text-xs font-semibold truncate">{exercise.name}</div>
                                                  {showRepSchemes && (
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                      {exercise.sets} x {exercise.reps}
                                                    </div>
                                      )}
                                    </div>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setSelectedExerciseForEdit({
                                                      weekIndex: reviewWeekIndex,
                                                      dayIndex: day.dayIndex,
                                                      section: "exercises",
                                                      exerciseIndex: exIdx,
                                                      routineType: "movement",
                                                      exercise: exercise,
                                                    });
                                                    setExerciseEditModalOpen(true);
                                                  }}
                                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-muted rounded"
                                                >
                                                  <Edit className="h-3 w-3" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => shuffleMovementExercise(reviewWeekIndex, day.dayIndex, exIdx)}
                                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-muted rounded"
                                                  title="Replace with alternate exercise"
                                                >
                                                  <Shuffle className="h-3 w-3" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => removeMovementExercise(reviewWeekIndex, day.dayIndex, exIdx)}
                                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-destructive/10 hover:text-destructive rounded"
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </button>
                                              </div>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                  </div>
                )}

                  {/* Block View */}
                  {reviewViewMode === "block" && (
                    <div className="flex-1 overflow-auto">
                      <div className="w-full overflow-x-auto">
                        {/* Week Headers */}
                        <div className="sticky top-0 z-30 bg-background border-b">
                          <div className="flex min-w-max">
                            {/* Empty space for row headers */}
                            <div className="w-[200px] shrink-0 border-r bg-muted/30 h-16" />
                            
                            {/* Week columns */}
                            {getWeeksInBlock.map((week, weekIdx) => {
                              const weekMonday = startOfWeek(week.startDate, { weekStartsOn: 1 });
                              const dayNames = ["M", "T", "W", "T", "F", "S", "S"];
                              
                              return (
                                <div key={weekIdx} className="w-[280px] shrink-0 border-r bg-muted/30">
                                  {/* Week header */}
                                  <div className="h-10 border-b px-3 flex flex-col justify-center">
                                    <div className="text-xs font-semibold">Week {week.weekNumber}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {format(week.startDate, "MMM d")} - {format(week.endDate, "MMM d")}
                  </div>
                                  </div>
                                  
                                  {/* Day indicators */}
                                  <div className="h-6 flex border-b">
                                    {dayNames.map((day, dayIdx) => {
                                      const date = addDays(weekMonday, dayIdx);
                                      const dayOfWeek = getDay(date);
                                      const isRest = calculatedDaysOff.has(dayOfWeek) || dayOfWeek === 4; // Thursday is always rest in Step 3
                                      
                                      return (
                                        <div
                                          key={dayIdx}
                                          className={cn(
                                            "flex-1 flex items-center justify-center text-[10px] border-r last:border-r-0",
                                            isRest ? "bg-muted/20 text-muted-foreground" : "text-foreground"
                                          )}
                                          title={`${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayOfWeek]} ${format(date, "MMM d")}`}
                                        >
                                          {day}
              </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Exercise Rows */}
                        <div className="min-w-max">
                          {exerciseRows.length === 0 ? (
                            <div className="p-10 text-center text-muted-foreground">
                              <p className="mb-2">No exercises assigned yet</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setReviewViewMode("week")}
                              >
                                Start in Week View
                              </Button>
                            </div>
                          ) : (
                            exerciseRows.map((row, rowIdx) => (
                              <div key={rowIdx} className="border-b">
                                <div className="flex min-w-max">
                                  {/* Row header */}
                                  <div className="w-[200px] shrink-0 border-r bg-muted/5 sticky left-0 z-20">
                                    <div className="px-3 py-2">
                                      <div className="text-xs font-semibold">{row.targetBodyGroup}</div>
                                      <div className="text-[10px] text-muted-foreground mt-0.5">
                                        {row.bands.length} exercise{row.bands.length !== 1 ? 's' : ''}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Week columns with exercise bands */}
                                  {getWeeksInBlock.map((week, weekIdx) => {
                                    const weekMonday = startOfWeek(week.startDate, { weekStartsOn: 1 });
                                    const weekBands = row.bands.filter(b => b.weekNumber === week.weekNumber);
                                    const weekSpans = row.spans.filter(s => s.weeks.includes(week.weekNumber));
                                    
                                    // Check if all days in this week are rest days for this body group
                                    const allDaysRest = Array.from({ length: 7 }, (_, i) => {
                                      const date = addDays(weekMonday, i);
                                      const dayOfWeek = getDay(date);
                                      return calculatedDaysOff.has(dayOfWeek) || dayOfWeek === 4; // Thursday is always rest in Step 3
                                    }).every(isRest => isRest);
                                    
                                    return (
                                      <div key={weekIdx} className="w-[280px] shrink-0 border-r relative">
                                        <div className="min-h-[60px] p-1">
                                          {allDaysRest ? (
                                            <div className="h-full flex items-center justify-center bg-muted/20 border border-dashed border-muted/50 rounded">
                                              <div className="flex flex-col items-center gap-1">
                                                <Bed className="h-6 w-6 text-muted-foreground" />
                                                <span className="text-[10px] text-muted-foreground font-medium">Rest</span>
                                              </div>
                                            </div>
                                          ) : weekBands.length === 0 ? (
                                            <div className="h-full flex items-center justify-center">
                                              <div className="text-[10px] text-muted-foreground/50">—</div>
                                            </div>
                                          ) : (
                                            <div className="space-y-1 relative h-full">
                                              {weekSpans.map((span, spanIdx) => {
                                                const colorClass = exerciseColors.get(span.exercise.name) || "bg-muted/20 border-muted/50";
                                                const dayPositions = span.days.map(d => {
                                                  const dayOfWeek = d === 0 ? 6 : d - 1;
                                                  return dayOfWeek / 7;
                                                });
                                                const minDay = Math.min(...dayPositions);
                                                const maxDay = Math.max(...dayPositions);
                                                const width = (maxDay - minDay + (1/7)) * 100;
                                                
                                                return (
                                                  <div
                                                    key={spanIdx}
                                                    className={cn(
                                                      "rounded px-2 py-1 text-xs cursor-pointer transition-all hover:opacity-80 hover:shadow-sm border absolute",
                                                      colorClass
                                                    )}
                                                    style={{
                                                      left: `${minDay * 100}%`,
                                                      width: `${width}%`,
                                                      top: `${spanIdx * 28}px`,
                                                    }}
                                                    onClick={() => {
                                                      setReviewWeekIndex(weekIdx);
                                                      setReviewViewMode("week");
                                                    }}
                                                    title={`${span.exercise.name}\nWeek ${span.startWeek}${span.endWeek !== span.startWeek ? `-${span.endWeek}` : ''}\n${span.exercise.sets} x ${span.exercise.reps}${span.exercise.weight ? ` @ ${span.exercise.weight}` : ''}`}
                                                  >
                                                    <div className="font-semibold truncate text-[10px]">
                                                      {span.exercise.name}
                                                    </div>
                                                    {showRepSchemes && (
                                                      <div className="text-[9px] text-muted-foreground mt-0.5">
                                                        {span.exercise.sets} x {span.exercise.reps}
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Exercise Edit Modal */}
            <Dialog open={exerciseEditModalOpen} onOpenChange={setExerciseEditModalOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Exercise</DialogTitle>
                  <DialogDescription>
                    {selectedExerciseForEdit?.exercise.name}
                  </DialogDescription>
                </DialogHeader>
                {selectedExerciseForEdit && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-sets">Sets</Label>
                        <Input
                          id="edit-sets"
                          type="number"
                          min="1"
                          value={selectedExerciseForEdit.exercise.sets}
                          onChange={(e) => {
                            const newSets = parseInt(e.target.value) || 1;
                            updateExercise(
                              selectedExerciseForEdit.weekIndex,
                              selectedExerciseForEdit.dayIndex,
                              selectedExerciseForEdit.exerciseIndex,
                              selectedExerciseForEdit.routineType,
                              { sets: newSets }
                            );
                            setSelectedExerciseForEdit({
                              ...selectedExerciseForEdit,
                              exercise: { ...selectedExerciseForEdit.exercise, sets: newSets },
                            });
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-reps">Reps</Label>
                        <Input
                          id="edit-reps"
                          type="number"
                          min="1"
                          value={selectedExerciseForEdit.exercise.reps}
                          onChange={(e) => {
                            const newReps = parseInt(e.target.value) || 1;
                            updateExercise(
                              selectedExerciseForEdit.weekIndex,
                              selectedExerciseForEdit.dayIndex,
                              selectedExerciseForEdit.exerciseIndex,
                              selectedExerciseForEdit.routineType,
                              { reps: newReps }
                            );
                            setSelectedExerciseForEdit({
                              ...selectedExerciseForEdit,
                              exercise: { ...selectedExerciseForEdit.exercise, reps: newReps },
                            });
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-restTime">Rest Time</Label>
                        <Input
                          id="edit-restTime"
                          type="text"
                          placeholder="e.g., 2:00 or 90s"
                          value={selectedExerciseForEdit.exercise.restTime}
                          onChange={(e) => {
                            updateExercise(
                              selectedExerciseForEdit.weekIndex,
                              selectedExerciseForEdit.dayIndex,
                              selectedExerciseForEdit.exerciseIndex,
                              selectedExerciseForEdit.routineType,
                              { restTime: e.target.value }
                            );
                            setSelectedExerciseForEdit({
                              ...selectedExerciseForEdit,
                              exercise: { ...selectedExerciseForEdit.exercise, restTime: e.target.value },
                            });
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-weight">Weight</Label>
                        <Input
                          id="edit-weight"
                          type="text"
                          placeholder="e.g., 185 lbs or 85 kg"
                          value={selectedExerciseForEdit.exercise.weight || ""}
                          onChange={(e) => {
                            updateExercise(
                              selectedExerciseForEdit.weekIndex,
                              selectedExerciseForEdit.dayIndex,
                              selectedExerciseForEdit.exerciseIndex,
                              selectedExerciseForEdit.routineType,
                              { weight: e.target.value }
                            );
                            setSelectedExerciseForEdit({
                              ...selectedExerciseForEdit,
                              exercise: { ...selectedExerciseForEdit.exercise, weight: e.target.value },
                            });
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-tempo">Tempo</Label>
                        <Input
                          id="edit-tempo"
                          type="text"
                          placeholder="e.g., 3-0-1-0"
                          value={selectedExerciseForEdit.exercise.tempo}
                          onChange={(e) => {
                            updateExercise(
                              selectedExerciseForEdit.weekIndex,
                              selectedExerciseForEdit.dayIndex,
                              selectedExerciseForEdit.exerciseIndex,
                              selectedExerciseForEdit.routineType,
                              { tempo: e.target.value }
                            );
                            setSelectedExerciseForEdit({
                              ...selectedExerciseForEdit,
                              exercise: { ...selectedExerciseForEdit.exercise, tempo: e.target.value },
                            });
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-rpe">RPE</Label>
                        <Select
                          value={selectedExerciseForEdit.exercise.rpe || ""}
                          onValueChange={(value) => {
                            updateExercise(
                              selectedExerciseForEdit.weekIndex,
                              selectedExerciseForEdit.dayIndex,
                              selectedExerciseForEdit.exerciseIndex,
                              selectedExerciseForEdit.routineType,
                              { rpe: value }
                            );
                            setSelectedExerciseForEdit({
                              ...selectedExerciseForEdit,
                              exercise: { ...selectedExerciseForEdit.exercise, rpe: value },
                            });
                          }}
                        >
                          <SelectTrigger id="edit-rpe">
                            <SelectValue placeholder="Select RPE" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 - Very Light</SelectItem>
                            <SelectItem value="2">2 - Light</SelectItem>
                            <SelectItem value="3">3 - Moderate</SelectItem>
                            <SelectItem value="4">4 - Somewhat Hard</SelectItem>
                            <SelectItem value="5">5 - Hard</SelectItem>
                            <SelectItem value="6">6 - Very Hard</SelectItem>
                            <SelectItem value="7">7 - Extremely Hard</SelectItem>
                            <SelectItem value="8">8 - Max Effort</SelectItem>
                            <SelectItem value="9">9 - Max Effort (with spot)</SelectItem>
                            <SelectItem value="10">10 - Max Effort (no spot)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setExerciseEditModalOpen(false)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Exercise Swap Modal */}
            <Dialog open={exerciseSwapModalOpen} onOpenChange={setExerciseSwapModalOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Swap Exercise</DialogTitle>
                  <DialogDescription>Search and select a new exercise</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Command>
                    <CommandInput placeholder="Search exercises..." />
                    <CommandList>
                      <CommandEmpty>No exercises found.</CommandEmpty>
                      <CommandGroup>
                        {[
                          "Barbell Bench Press",
                          "Dumbbell Bench Press",
                          "Push-ups",
                          "Pull-ups",
                          "Barbell Row",
                          "Back Squat",
                          "Front Squat",
                          "Romanian Deadlift",
                        ].map((exercise) => (
                          <CommandItem
                            key={exercise}
                            onSelect={() => {
                              if (selectedExerciseForSwap) {
                                // Update exercise logic here
                                setExerciseSwapModalOpen(false);
                              }
                            }}
                          >
                            {exercise}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
              </DialogContent>
            </Dialog>
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