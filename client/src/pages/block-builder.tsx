import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { CalendarIcon, X, ChevronDown, ChevronRight, ChevronLeft, EyeOff, Lock, Shuffle, Trash2, Moon, Plus, Star, Info, Cloud, Settings, Undo2, Redo2, GripVertical, Edit, Bed, Copy, CheckCircle, AlertCircle, PanelLeftClose, PanelLeftOpen, User, Target, Zap, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ExerciseCard } from "@/components/ExerciseCard";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import type { Athlete, Program, AthleteWithPhase } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";

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
  { id: "standard", label: "Standard", tooltip: "Standard program type - for Cleared Athletes" },
  { id: "intervention", label: "Intervention", tooltip: "Intervention program type - for Injured/Rehabbing Athletes" },
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
  { id: "strength-conditioning", label: "Strength & Conditioning" },
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
interface RoutineSettings {
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
}

type SettingsLevel = "block" | "week" | "day";

interface SettingsOverride {
  blockIndex: number;
  weekIndex?: number;
  dayIndex?: number;
  level: SettingsLevel;
  routine: keyof RoutineSettings;
  field: string;
  value: string;
}

interface Exercise {
  id: string;
  targetBodyGroup: string;
  name: string;
  sets: number;
  reps: number;
  restTime: string;
  weight?: string;
  tempo: string;
  rpe?: string;
  sectionId?: string;
  blockExerciseId?: string;
  source?: "sample" | "suggested" | "manual";
  repScheme?: string;
  progression?: string;
};

interface LiftingCell {
  exercises: Exercise[];
}

interface ThrowingDayData {
  phase: string;
  intensity: string;
  exercises: Exercise[];
}

interface LiftingDayData {
  intensity?: string;
  focus: string;
  emphasis: string;
  exercises: Exercise[];
}

// Generate a unique program ID
const generateProgramId = (): string => {
  const prefix = "P";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

interface ExerciseTemplate {
  sectionId?: string;
  targetBodyGroup: string;
  name: string;
  sets: number;
  reps: number;
  restTime: string;
  tempo?: string;
  weight?: string;
  rpe?: string;
  repScheme?: string;
  progression?: string;
};

const blockExerciseLibrary: Record<string, ExerciseTemplate[]> = {
  preparatory: [
    { sectionId: "preparatory", targetBodyGroup: "Warm-up", name: "Dynamic Warm-Up Series", sets: 1, reps: 12, restTime: "—", tempo: "controlled", repScheme: "Dynamic Circuit", progression: "Volume" },
    { sectionId: "preparatory", targetBodyGroup: "Warm-up", name: "Jump Rope Primer", sets: 1, reps: 120, restTime: "—", tempo: "steady", repScheme: "Interval", progression: "Time" },
  ],
  mobility: [
    { sectionId: "mobility", targetBodyGroup: "Mobility", name: "World's Greatest Stretch", sets: 2, reps: 6, restTime: "30s", tempo: "3-2-1-0", repScheme: "Circuit", progression: "Range of Motion" },
    { sectionId: "mobility", targetBodyGroup: "Mobility", name: "Thoracic Spine Opens", sets: 2, reps: 8, restTime: "30s", tempo: "smooth", repScheme: "Circuit", progression: "Range of Motion" },
  ],
  activation: [
    { sectionId: "activation", targetBodyGroup: "Activation", name: "Mini-Band Lateral Walk", sets: 2, reps: 12, restTime: "30s", tempo: "controlled", repScheme: "Circuit", progression: "Volume" },
    { sectionId: "activation", targetBodyGroup: "Activation", name: "Glute Bridge + March", sets: 2, reps: 10, restTime: "30s", tempo: "1-1-1-0", repScheme: "Straight Sets", progression: "Load" },
  ],
  "core-lift": [
    { sectionId: "core-lift", targetBodyGroup: "Lower Body [Quad]", name: "Back Squat", sets: 4, reps: 6, restTime: "2:00", tempo: "3-0-1-0", weight: "225 lbs", repScheme: "Straight Sets", progression: "Linear Load" },
    { sectionId: "core-lift", targetBodyGroup: "Upper Body [Pressing]", name: "Barbell Bench Press", sets: 4, reps: 8, restTime: "2:00", tempo: "3-0-1-0", weight: "185 lbs", repScheme: "Straight Sets", progression: "Linear Load" },
  ],
  accessory: [
    { sectionId: "accessory", targetBodyGroup: "Upper Body [Pulling]", name: "Chest Supported Row", sets: 3, reps: 10, restTime: "90s", tempo: "2-0-1-0", weight: "60 lbs", repScheme: "Straight Sets", progression: "Volume" },
    { sectionId: "accessory", targetBodyGroup: "Core", name: "Cable Pallof Press", sets: 3, reps: 12, restTime: "45s", tempo: "controlled", repScheme: "Straight Sets", progression: "Isometric Hold" },
  ],
  conditioning: [
    { sectionId: "conditioning", targetBodyGroup: "Conditioning", name: "Assault Bike Intervals", sets: 5, reps: 0, restTime: "1:1 work/rest", tempo: "hard", repScheme: "Interval", progression: "Intensity" },
    { sectionId: "conditioning", targetBodyGroup: "Conditioning", name: "Tempo Runs", sets: 4, reps: 200, restTime: "90s", tempo: "steady", repScheme: "Interval", progression: "Volume" },
  ],
};

const repSchemeOptions = [
  "Straight Sets",
  "Wave Loading",
  "Pyramid",
  "Drop Set",
  "Cluster",
  "Circuit",
  "Interval",
  "Dynamic Circuit",
];

const progressionOptions = [
  "Linear Load",
  "Volume",
  "Intensity",
  "Range of Motion",
  "Time",
  "Isometric Hold",
  "Velocity",
  "Skill Complexity",
];

const weekDayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const getSuggestedExerciseTemplate = (sectionId: string): ExerciseTemplate | null => {
  const templates = blockExerciseLibrary[sectionId] || [];
  if (templates.length === 0) return null;
  return templates[Math.floor(Math.random() * templates.length)];
};

export default function AddProgram({ athleteId: athleteIdProp, headerOffset = 0 }: { athleteId?: string, headerOffset?: number }) {
  const [location, setLocation] = useLocation();
  
  // Get URL params
  const urlParams = useMemo(() => {
    if (typeof window === 'undefined') return { mode: null, blockId: null };
    const params = new URLSearchParams(window.location.search);
    return {
      mode: params.get('mode'),
      blockId: params.get('blockId'),
    };
  }, [location]);
  
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
  // Mock block selection dropdown state
  const [selectedBlock, setSelectedBlock] = useState("block-1");
  const [daysOff, setDaysOff] = useState<Set<number>>(new Set([0])); // Sunday (0) hidden by default
  const [programId] = useState(() => generateProgramId());
  
  // Block phases state
  const [blockPhases, setBlockPhases] = useState<Map<number, string>>(new Map());
  
  // Calendar month state for monthly visualization on Settings step
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());
  const calendarScrollRef = useRef<HTMLDivElement>(null);
  const normalizedToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);
  
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
  
  // Add Block Modal state
  const [addBlockModalOpen, setAddBlockModalOpen] = useState(false);
  const [newBlockStartDate, setNewBlockStartDate] = useState<Date | undefined>(undefined);
  const [newBlockDuration, setNewBlockDuration] = useState<number>(4);
  const [newBlockBuildType, setNewBlockBuildType] = useState<string>("standard");
  
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
  const [liftingData, setLiftingData] = useState<Map<string, LiftingDayData>>(new Map());
  const [throwingData, setThrowingData] = useState<Map<string, ThrowingDayData>>(new Map());
  const [movementData, setMovementData] = useState<Map<string, MovementDayData>>(new Map());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["lifting", "throwing", "movement"]));
  const [showRepSchemes, setShowRepSchemes] = useState(true);
  const [exerciseSwapModalOpen, setExerciseSwapModalOpen] = useState(false);
  const [selectedExerciseForSwap, setSelectedExerciseForSwap] = useState<{weekIndex: number; dayIndex: number; section: string; exerciseIndex: number; routineType: string} | null>(null);
  const [exerciseEditModalOpen, setExerciseEditModalOpen] = useState(false);
  const [selectedExerciseForEdit, setSelectedExerciseForEdit] = useState<{weekIndex: number; dayIndex: number; section: string; exerciseIndex: number; routineType: string; exercise: Exercise} | null>(null);
  const [blockExerciseSelectionContext, setBlockExerciseSelectionContext] = useState<{ sectionId: string; dayIndex: number } | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "error">("saved");
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);
  
  const isWeekViewReadOnly = true;

  // Step completion tracking
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  // Save as draft state
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [legendExpanded, setLegendExpanded] = useState(false);
  const [athleteSidebarOpen, setAthleteSidebarOpen] = useState(true);
  

  const createExerciseInstance = (
    template: ExerciseTemplate,
    sectionId: string,
    blockExerciseId: string,
    weekIndex: number,
    source: Exercise["source"] = "sample"
  ): Exercise => {
    return {
      id: `${blockExerciseId}-w${weekIndex}-${Math.random().toString(36).slice(2, 8)}`,
      targetBodyGroup: template.targetBodyGroup,
      name: template.name,
      sets: template.sets,
      reps: template.reps,
      restTime: template.restTime,
      tempo: template.tempo ?? "",
      weight: template.weight,
      rpe: template.rpe,
      sectionId,
      blockExerciseId,
      source,
      repScheme: template.repScheme ?? "Straight Sets",
      progression: template.progression ?? "Linear Load",
    };
  };

  const duplicateExerciseForWeek = (exercise: Exercise, weekIndex: number): Exercise => ({
    ...exercise,
    id: `${exercise.blockExerciseId ?? exercise.id}-w${weekIndex}-${Math.random().toString(36).slice(2, 8)}`,
    repScheme: exercise.repScheme,
    progression: exercise.progression,
  });

  // Section configurations for Block View
  const sectionConfigs = [
    { id: "preparatory", label: "R1 - Preparatory", description: "Warm-up exercises" },
    { id: "mobility", label: "R2 - Mobility", description: "Mobility and flexibility" },
    { id: "activation", label: "R3 - Activation", description: "Movement preparation" },
    { id: "core-lift", label: "R4 - Core Lift", description: "Primary strength exercises" },
    { id: "accessory", label: "R5 - Accessory", description: "Supporting exercises" },
    { id: "conditioning", label: "R6 - Conditioning/Recovery", description: "Conditioning and recovery" },
  ];

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programFormSchema),
    defaultValues: {
      athleteId: athleteIdProp ?? "",
      buildType: "standard",
      blockDuration: DEFAULT_BLOCK_DURATION,
      programDuration: DEFAULT_PROGRAM_DURATION,
      startDate: new Date(),
      endDate: undefined,
      routineTypes: ["movement", "throwing", "lifting", "strength-conditioning"],
    },
  });

  // If athleteId is provided via props, ensure form is synced
  useEffect(() => {
    if (athleteIdProp) {
      const current = form.getValues("athleteId");
      if (current !== athleteIdProp) {
        form.setValue("athleteId", athleteIdProp);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [athleteIdProp]);

  // Fetch all programs to check for existing programming
  const { data: allPrograms = [] } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
  });
  
  // Fetch athletes data for block editing
  const { data: athletesData } = useQuery<AthleteWithPhase[]>({
    queryKey: ["/api/athletes"],
    enabled: urlParams.mode === "edit" && !!urlParams.blockId,
  });
  
  // Load block data when editing
  useEffect(() => {
    if (urlParams.mode === "edit" && urlParams.blockId && athletesData) {
      // Find the block in athletes data
      for (const athleteData of athletesData) {
        const block = athleteData.blocks.find(b => b.id === urlParams.blockId);
        if (block) {
          // Pre-populate form with block data
          form.setValue("athleteId", athleteData.athlete.id);
          form.setValue("startDate", new Date(block.startDate));
          form.setValue("endDate", new Date(block.endDate));
          // TODO: Load other block-specific data (blocks, settings, etc.)
          break;
        }
      }
    } else if (urlParams.mode === "create") {
      // Ensure we start at step 1 with athlete selector
      setCurrentStep(1);
      // Reset form
      form.reset({
        athleteId: "",
        buildType: "standard",
        blockDuration: DEFAULT_BLOCK_DURATION,
        programDuration: DEFAULT_PROGRAM_DURATION,
        startDate: new Date(),
        endDate: undefined,
        routineTypes: ["movement", "throwing", "lifting", "strength-conditioning"],
      });
    }
  }, [urlParams.mode, urlParams.blockId, athletesData, form]);

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
      setLocation("/programs");
    },
    onError: () => {
      // Error handling - no toast notification
    },
  });

  const handleSubmit = (values: ProgramFormValues) => {
    const athlete = mockAthletes.find((a) => a.id === values.athleteId) as ExtendedAthlete | undefined;
    if (!athlete) return;

    // Block submission if athlete is not cleared
    if (athlete.status === "not cleared") {
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

  // Calculate default start date: first day WITHOUT programming available
  const calculateDefaultStartDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (activePrograms.length === 0) {
      return today;
    }
    
    // Sort programs by start date
    const sortedPrograms = [...activePrograms].sort((a, b) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
    
    // Check if today is available (not in any program)
    const todayInProgram = sortedPrograms.some(program => {
      const programStart = new Date(program.startDate);
      const programEnd = new Date(program.endDate);
      programStart.setHours(0, 0, 0, 0);
      programEnd.setHours(0, 0, 0, 0);
      return today >= programStart && today <= programEnd;
    });
    
    if (!todayInProgram) {
      return today;
    }
    
    // Find gaps between programs or after the last program
    for (let i = 0; i < sortedPrograms.length; i++) {
      const program = sortedPrograms[i];
      const programEnd = new Date(program.endDate);
      programEnd.setHours(0, 0, 0, 0);
      const nextDay = addDays(programEnd, 1);
      
      // Check if there's a next program
      if (i < sortedPrograms.length - 1) {
        const nextProgram = sortedPrograms[i + 1];
        const nextProgramStart = new Date(nextProgram.startDate);
        nextProgramStart.setHours(0, 0, 0, 0);
        
        // If there's a gap between programs, return the first day of the gap
        if (nextDay < nextProgramStart) {
          return nextDay;
        }
      } else {
        // This is the last program, return the day after it ends
        return nextDay;
      }
    }
    
    // Fallback: return day after latest program ends
    const latestEndDate = sortedPrograms.reduce((latest, program) => {
      const programEndDate = new Date(program.endDate);
      return programEndDate > latest ? programEndDate : latest;
    }, new Date(0));
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

  // Update buildType and start date when athlete changes
  useEffect(() => {
    if (selectedAthleteId && selectedAthlete) {
      // Pre-select buildType based on athlete status
      const currentBuildType = form.getValues("buildType");
      const shouldBeIntervention = selectedAthlete.status === "injured" || selectedAthlete.status === "not cleared";
      const shouldBeStandard = selectedAthlete.status === "cleared";
      
      // Only update if buildType hasn't been manually changed or matches the old default
      if (shouldBeIntervention && currentBuildType !== "intervention") {
        form.setValue("buildType", "intervention");
      } else if (shouldBeStandard && currentBuildType !== "standard") {
        form.setValue("buildType", "standard");
      }
      
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
  }, [selectedAthleteId, selectedAthlete, calculateDefaultStartDate]);

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

  // Static 4 blocks - no dependency on dates
  const blocks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return [
      {
        name: "Block 1",
        startDate: today,
        endDate: addDays(addWeeks(today, 4), -1),
      },
      {
        name: "Block 2",
        startDate: addWeeks(today, 4),
        endDate: addDays(addWeeks(today, 8), -1),
      },
      {
        name: "Block 3",
        startDate: addWeeks(today, 8),
        endDate: addDays(addWeeks(today, 12), -1),
      },
      {
        name: "Block 4",
        startDate: addWeeks(today, 12),
        endDate: addDays(addWeeks(today, 16), -1),
      },
    ];
  }, []);

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

  // Ensure reviewBlockIndex is valid when blocks change
  useEffect(() => {
    if (blocks.length > 0 && reviewBlockIndex >= blocks.length) {
      setReviewBlockIndex(0);
      setReviewWeekIndex(0);
    }
  }, [blocks.length, reviewBlockIndex]);

  // Scroll calendar to show startDate by default
  useEffect(() => {
    if (calendarScrollRef.current && startDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      // Calculate how many days from today to startDate
      const daysFromToday = Math.floor((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Scroll to position startDate (each day is ~120px wide + 4px gap)
      const scrollPosition = Math.max(0, daysFromToday * 124);
      
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        if (calendarScrollRef.current) {
          calendarScrollRef.current.scrollLeft = scrollPosition;
        }
      }, 100);
    }
  }, [startDate]);

  // Step completion check removed - no dependencies between steps
  const isStep1Complete = useMemo(() => {
    return true; // Always allow navigation
  }, []);

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
      // (Block duration warnings removed - duration is automatic based on season/sub-seasons)
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

  // Helper function to handle step navigation - no dependencies, free navigation
  const handleStepNavigation = (targetStep: number) => {
    // Allow free navigation between all steps
    setCurrentStep(targetStep);
  };

  // Helper function to handle Next button click - no validation, free navigation
  const handleNext = (): void => {
    // If on Step 3, submit the form
    if (currentStep === 3) {
      form.handleSubmit(handleSubmit)();
      return;
    }

    // Advance to next step without validation
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Helper function to save as draft
  const handleSaveAsDraft = (): void => {
    // In a real implementation, this would save to backend
    // For now, just update the timestamp
    setLastSaved(new Date());
  };

  // Helper function to get next button text
  const getNextButtonText = (): string => {
    switch (currentStep) {
      case 1:
        return "Next";
      case 2:
        return "Next";
      case 3:
        return "Next";
      default:
        return "Next";
    }
  };

  // Helper function to format last saved time
  const getLastSavedText = (): string | null => {
    if (!lastSaved) return null;
    const minutesAgo = Math.floor((new Date().getTime() - lastSaved.getTime()) / 60000);
    if (minutesAgo < 1) return "Just now";
    if (minutesAgo === 1) return "1 min ago";
    return `${minutesAgo} min ago`;
  };

  // Helper function to check if there are unsaved changes
  const hasUnsavedChanges = (): boolean => {
    return selectedAthleteId || startDate || endDate || routineTypes.length > 0;
  };

  // Helper function to handle back button
  const handleBack = (): void => {
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
    if (isWeekViewReadOnly) return;
    const key = getThrowingDayKey(weekIndex, dayIndex);
    const existing = getThrowingDayData(weekIndex, dayIndex);
    setThrowingData(prev => {
      const newMap = new Map(prev);
      newMap.set(key, { ...existing, ...data });
      return newMap;
    });
  };
  
  const updateMovementDayData = (weekIndex: number, dayIndex: number, data: Partial<MovementDayData>) => {
    if (isWeekViewReadOnly) return;
    const key = getMovementDayKey(weekIndex, dayIndex);
    const existing = getMovementDayData(weekIndex, dayIndex);
    setMovementData(prev => {
      const newMap = new Map(prev);
      newMap.set(key, { ...existing, ...data });
      return newMap;
    });
  };
  
  const addThrowingExercise = (weekIndex: number, dayIndex: number) => {
    if (isWeekViewReadOnly) return;
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
      sectionId: "throwing",
      repScheme: "Interval",
      progression: "Distance",
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
    if (isWeekViewReadOnly) return;
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
      sectionId: "movement",
      repScheme: "Circuit",
      progression: "Volume",
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
    if (isWeekViewReadOnly) return;
    const key = getLiftingDayKey(weekIndex, dayIndex);
    const existing = getLiftingDayData(weekIndex, dayIndex);
    setLiftingData(prev => {
      const newMap = new Map(prev);
      newMap.set(key, { ...existing, ...data });
      return newMap;
    });
  };
  
  const shuffleExercise = (weekIndex: number, dayIndex: number, exerciseIndex: number) => {
    if (isWeekViewReadOnly) return;
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
    if (isWeekViewReadOnly) return;
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
    if (isWeekViewReadOnly) return;
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
    if (isWeekViewReadOnly) return;
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

  const removeMovementExercise = (weekIndex: number, dayIndex: number, exerciseIndex: number) => {
    if (isWeekViewReadOnly) return;
    const key = getMovementDayKey(weekIndex, dayIndex);
    const dayData = getMovementDayData(weekIndex, dayIndex);
    const updatedExercises = dayData.exercises.filter((_, idx) => idx !== exerciseIndex);
    
    setMovementData(prev => {
      const newMap = new Map(prev);
      newMap.set(key, {
        ...dayData,
        exercises: updatedExercises,
      });
      return newMap;
    });
  };

  const removeExercise = (weekIndex: number, dayIndex: number, exerciseIndex: number) => {
    if (isWeekViewReadOnly) return;
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
    if (isWeekViewReadOnly) return;
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
    if (isWeekViewReadOnly) return;
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
        repScheme: "Straight Sets",
        progression: "Linear Load",
        sectionId: "core-lift",
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
        repScheme: "Straight Sets",
        progression: "Linear Load",
        sectionId: "accessory",
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
    if (isWeekViewReadOnly) return;
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
    
    setLiftingData(prev => {
      if (prev.has(key)) {
        return prev;
      }

      const newMap = new Map(prev);
      let exercises: Exercise[] = [];

      if (weekIndex > 0) {
        const baseKey = getLiftingDayKey(0, dayIndex);
        const baseData = prev.get(baseKey);
        if (baseData) {
          exercises = baseData.exercises.map(ex => ({
            ...duplicateExerciseForWeek(ex, weekIndex),
            blockExerciseId: ex.blockExerciseId ?? ex.id,
            sectionId: ex.sectionId,
            source: ex.source ?? "sample",
          }));
        }
      }

      if (exercises.length === 0) {
        exercises = sectionConfigs.flatMap((section, index) => {
          const templates = blockExerciseLibrary[section.id] || [];
          const template =
            templates[(dayIndex + index) % (templates.length || 1)] ||
            {
              sectionId: section.id,
              targetBodyGroup: section.label,
              name: `${section.label} Default`,
              sets: 3,
              reps: 10,
              restTime: "60s",
              tempo: "",
            };
          const blockExerciseId = `sample-${section.id}-${dayIndex}`;
          return [
            createExerciseInstance(template, section.id, blockExerciseId, weekIndex, "sample"),
          ];
        });
      }

      newMap.set(key, {
        intensity: "light",
        focus: get4x2Focus(dayIndex),
        emphasis: "Restorative",
        exercises,
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
        sectionId: "throwing",
        repScheme: "Interval",
        progression: "Distance",
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
        sectionId: "movement",
        repScheme: "Circuit",
        progression: "Volume",
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

  const applyExerciseUpdateToBlock = (
    dayIndex: number,
    updater: (existing: Exercise[], weekIndex: number) => Exercise[]
  ) => {
    if (!routineTypes.includes("lifting") || getWeeksInBlock.length === 0) return;
    setLiftingData(prev => {
      const newMap = new Map(prev);
      getWeeksInBlock.forEach((_, weekIdx) => {
        const key = getLiftingDayKey(weekIdx, dayIndex);
        const prevData = prev.get(key) || {
          intensity: "light",
          focus: get4x2Focus(dayIndex),
          emphasis: "Restorative",
          exercises: [],
        };
        const updatedExercises = updater(prevData.exercises ?? [], weekIdx);
        newMap.set(key, {
          intensity: prevData.intensity ?? "light",
          focus: prevData.focus ?? get4x2Focus(dayIndex),
          emphasis: prevData.emphasis ?? "Restorative",
          exercises: updatedExercises,
        });
      });
      return newMap;
    });
  };

  const addExerciseToBlock = (
    sectionId: string,
    dayIndex: number,
    template: ExerciseTemplate,
    source: Exercise["source"]
  ) => {
    const blockExerciseId = `block-${sectionId}-${dayIndex}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    applyExerciseUpdateToBlock(dayIndex, (existing, weekIdx) => [
      ...existing,
      createExerciseInstance(
        { ...template, sectionId: template.sectionId ?? sectionId },
        sectionId,
        blockExerciseId,
        weekIdx,
        source
      ),
    ]);
  };

  const removeExerciseFromBlock = (dayIndex: number, blockExerciseId: string) => {
    applyExerciseUpdateToBlock(dayIndex, (existing) =>
      existing.filter(ex => ex.blockExerciseId !== blockExerciseId)
    );
  };

  const applyMovementUpdateToBlock = (
    dayIndex: number,
    updater: (existing: Exercise[], weekIndex: number) => Exercise[]
  ) => {
    if (!routineTypes.includes("movement") || getWeeksInBlock.length === 0) return;
    setMovementData(prev => {
      const newMap = new Map(prev);
      getWeeksInBlock.forEach((_, weekIdx) => {
        const key = getMovementDayKey(weekIdx, dayIndex);
        const prevData = prev.get(key) || {
          intensity: "moderate",
          volume: "standard",
          exercises: [],
        };
        const updatedExercises = updater(prevData.exercises ?? [], weekIdx);
        newMap.set(key, {
          intensity: prevData.intensity ?? "moderate",
          volume: prevData.volume ?? "standard",
          exercises: updatedExercises,
        });
      });
      return newMap;
    });
  };

  const applyThrowingUpdateToBlock = (
    dayIndex: number,
    updater: (existing: Exercise[], weekIndex: number) => Exercise[]
  ) => {
    if (!routineTypes.includes("throwing") || getWeeksInBlock.length === 0) return;
    setThrowingData(prev => {
      const newMap = new Map(prev);
      getWeeksInBlock.forEach((_, weekIdx) => {
        const key = getThrowingDayKey(weekIdx, dayIndex);
        const prevData = prev.get(key) || {
          phase: "pitch-design",
          intensity: "moderate",
          exercises: [],
        };
        const updatedExercises = updater(prevData.exercises ?? [], weekIdx);
        newMap.set(key, {
          phase: prevData.phase ?? "pitch-design",
          intensity: prevData.intensity ?? "moderate",
          exercises: updatedExercises,
        });
      });
      return newMap;
    });
  };

  const addMovementExerciseToBlock = (dayIndex: number) => {
    const blockExerciseId = `block-movement-${dayIndex}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    applyMovementUpdateToBlock(dayIndex, (existing, weekIdx) => [
      ...existing,
      {
        id: `${blockExerciseId}-w${weekIdx}-${Math.random().toString(36).slice(2, 8)}`,
        targetBodyGroup: "Movement",
        name: "Hip Mobility Circuit",
        sets: 2,
        reps: 10,
        restTime: "60s",
        tempo: "",
        sectionId: "movement",
        blockExerciseId,
        source: "manual" as const,
        repScheme: "Circuit",
        progression: "Volume",
      },
    ]);
  };

  const addThrowingExerciseToBlock = (dayIndex: number) => {
    const blockExerciseId = `block-throwing-${dayIndex}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    applyThrowingUpdateToBlock(dayIndex, (existing, weekIdx) => [
      ...existing,
      {
        id: `${blockExerciseId}-w${weekIdx}-${Math.random().toString(36).slice(2, 8)}`,
        targetBodyGroup: "Throwing",
        name: "Flatground Throwing",
        sets: 1,
        reps: 20,
        restTime: "2:00",
        tempo: "",
        sectionId: "throwing",
        blockExerciseId,
        source: "manual" as const,
        repScheme: "Interval",
        progression: "Distance",
      },
    ]);
  };

  const removeMovementExerciseFromBlock = (dayIndex: number, blockExerciseId: string) => {
    applyMovementUpdateToBlock(dayIndex, (existing) =>
      existing.filter(ex => ex.blockExerciseId !== blockExerciseId)
    );
  };

  const removeThrowingExerciseFromBlock = (dayIndex: number, blockExerciseId: string) => {
    applyThrowingUpdateToBlock(dayIndex, (existing) =>
      existing.filter(ex => ex.blockExerciseId !== blockExerciseId)
    );
  };

  const shuffleMovementExerciseInBlock = (dayIndex: number, blockExerciseId: string) => {
    const mockExercises = [
      { name: "Hip Mobility Circuit", repScheme: "Circuit", progression: "Volume" },
      { name: "Shoulder Activation", repScheme: "Circuit", progression: "Volume" },
      { name: "Dynamic Warm-up", repScheme: "Dynamic Circuit", progression: "Volume" },
      { name: "Foam Rolling", repScheme: "Circuit", progression: "Time" },
    ];
    const randomExercise = mockExercises[Math.floor(Math.random() * mockExercises.length)];
    applyMovementUpdateToBlock(dayIndex, (existing, weekIdx) =>
      existing.map(ex => {
        if (ex.blockExerciseId !== blockExerciseId) return ex;
        return {
          ...ex,
          name: randomExercise.name,
          repScheme: randomExercise.repScheme,
          progression: randomExercise.progression,
        };
      })
    );
  };

  const shuffleThrowingExerciseInBlock = (dayIndex: number, blockExerciseId: string) => {
    const mockExercises = [
      { name: "Long Toss", repScheme: "Interval", progression: "Distance" },
      { name: "Bullpen Session", repScheme: "Straight Sets", progression: "Intensity" },
      { name: "Flat Ground", repScheme: "Interval", progression: "Distance" },
      { name: "Plyo Ball", repScheme: "Circuit", progression: "Volume" },
    ];
    const randomExercise = mockExercises[Math.floor(Math.random() * mockExercises.length)];
    applyThrowingUpdateToBlock(dayIndex, (existing, weekIdx) =>
      existing.map(ex => {
        if (ex.blockExerciseId !== blockExerciseId) return ex;
        return {
          ...ex,
          name: randomExercise.name,
          repScheme: randomExercise.repScheme,
          progression: randomExercise.progression,
        };
      })
    );
  };

  const shuffleExerciseInBlock = (sectionId: string, dayIndex: number, blockExerciseId: string) => {
    const template = getSuggestedExerciseTemplate(sectionId);
    if (!template) return;
    applyExerciseUpdateToBlock(dayIndex, (existing, weekIdx) =>
      existing.map(ex => {
        if (ex.blockExerciseId !== blockExerciseId) return ex;
        return createExerciseInstance(
          { ...template, sectionId: template.sectionId ?? sectionId },
          sectionId,
          blockExerciseId,
          weekIdx,
          "suggested"
        );
      })
    );
  };

  const renderMovementBlockSection = () => {
    if (!routineTypes.includes("movement")) return null;

    return (
      <div className="border-b bg-background">
        <div className="flex min-w-max">
          <div className="w-[150px] shrink-0 border-r bg-surface-base sticky left-0 z-20">
            <div className="px-3 py-4 min-h-[100px] flex flex-col justify-center gap-1.5">
              <div className="text-xs font-semibold">Movement</div>
              <div className="text-[10px] text-muted-foreground">
                Movement prep, mobility, and patterning
              </div>
            </div>
          </div>

          {weekDayLabels.map((dayName, dayIdx) => {
            const dayOfWeek = dayIdx + 1;
            const adjustedDayOfWeek = dayOfWeek === 7 ? 0 : dayOfWeek;
            const isRest = calculatedDaysOff.has(adjustedDayOfWeek) || adjustedDayOfWeek === 4;
            const canonicalWeekIndex = Math.min(
              reviewWeekIndex,
              Math.max(0, getWeeksInBlock.length - 1)
            );
            const dayData = getMovementDayData(canonicalWeekIndex, adjustedDayOfWeek);

            return (
              <div
                key={`movement-${dayName}`}
                className={cn(
                  "w-[240px] min-w-[240px] shrink-0 border-r min-h-[120px] p-1 transition-colors",
                  isRest ? "bg-transparent" : "bg-surface-base hover:bg-muted/10"
                )}
              >
                {!isRest && (
                  <div className="flex flex-col gap-2">
                    <div className="text-[11px] font-medium text-muted-foreground/80">
                      Intensity: {dayData.intensity || "moderate"} • Volume: {dayData.volume || "standard"}
                    </div>
                    <div className="space-y-2 relative min-h-[120px]">
                      {dayData.exercises.length === 0 ? (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => addMovementExerciseToBlock(adjustedDayOfWeek)}
                          className="absolute bottom-0 left-0 h-7 w-7 p-0"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <>
                          {dayData.exercises.map((exercise, idx) => {
                            const exerciseKey = exercise.blockExerciseId ?? exercise.id;
                            return (
                              <ExerciseCard
                                key={exerciseKey}
                                exercise={exercise}
                                showRepSchemes={true}
                                onClick={() => {
                                  const weekIdx = Math.min(reviewWeekIndex, Math.max(0, getWeeksInBlock.length - 1));
                                  const weekData = getMovementDayData(weekIdx, adjustedDayOfWeek);
                                  const exerciseIndex = weekData.exercises.findIndex(ex => (ex.blockExerciseId ?? ex.id) === exerciseKey);
                                  if (exerciseIndex !== -1) {
                                    setSelectedExerciseForEdit({
                                      weekIndex: weekIdx,
                                      dayIndex: adjustedDayOfWeek,
                                      section: "exercises",
                                      exerciseIndex,
                                      routineType: "movement",
                                      exercise: weekData.exercises[exerciseIndex],
                                    });
                                    setExerciseEditModalOpen(true);
                                  }
                                }}
                                onEdit={() => {
                                  const weekIdx = Math.min(reviewWeekIndex, Math.max(0, getWeeksInBlock.length - 1));
                                  const weekData = getMovementDayData(weekIdx, adjustedDayOfWeek);
                                  const exerciseIndex = weekData.exercises.findIndex(ex => (ex.blockExerciseId ?? ex.id) === exerciseKey);
                                  if (exerciseIndex !== -1) {
                                    setSelectedExerciseForEdit({
                                      weekIndex: weekIdx,
                                      dayIndex: adjustedDayOfWeek,
                                      section: "exercises",
                                      exerciseIndex,
                                      routineType: "movement",
                                      exercise: weekData.exercises[exerciseIndex],
                                    });
                                    setExerciseEditModalOpen(true);
                                  }
                                }}
                                onShuffle={() => shuffleMovementExerciseInBlock(adjustedDayOfWeek, exercise.blockExerciseId ?? exercise.id)}
                                onRemove={() => removeMovementExerciseFromBlock(adjustedDayOfWeek, exercise.blockExerciseId ?? exercise.id)}
                              />
                            );
                          })}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full border-dashed text-xs font-medium"
                              >
                                <Plus className="h-3.5 w-3.5 mr-1.5" />
                                Add exercise
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                              <DropdownMenuItem onClick={() => addMovementExerciseToBlock(adjustedDayOfWeek)}>
                                <span className="text-xs">Add exercise</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderThrowingBlockSection = () => {
    if (!routineTypes.includes("throwing")) return null;

    return (
      <div className="border-b bg-background">
        <div className="flex min-w-max">
          <div className="w-[150px] shrink-0 border-r bg-muted/20 sticky left-0 z-20">
            <div className="px-3 py-4 min-h-[100px] flex flex-col justify-center gap-1.5">
              <div className="text-xs font-semibold">Throwing</div>
              <div className="text-[10px] text-muted-foreground">
                Throwing phases, intensity, and daily prescriptions
              </div>
            </div>
          </div>

          {weekDayLabels.map((dayName, dayIdx) => {
            const dayOfWeek = dayIdx + 1;
            const adjustedDayOfWeek = dayOfWeek === 7 ? 0 : dayOfWeek;
            const isRest = calculatedDaysOff.has(adjustedDayOfWeek) || adjustedDayOfWeek === 4;
            const canonicalWeekIndex = Math.min(
              reviewWeekIndex,
              Math.max(0, getWeeksInBlock.length - 1)
            );
            const dayData = getThrowingDayData(canonicalWeekIndex, adjustedDayOfWeek);

            return (
              <div
                key={`throwing-${dayName}`}
                className={cn(
                  "w-[240px] min-w-[240px] shrink-0 border-r min-h-[120px] p-1 transition-colors",
                  isRest ? "bg-transparent" : "bg-surface-base hover:bg-muted/10"
                )}
              >
                {!isRest && (
                  <div className="flex flex-col gap-2">
                    <div className="text-[11px] font-medium text-muted-foreground/80">
                      Phase: {dayData.phase || "pitch-design"} • Intensity: {dayData.intensity || "moderate"}
                    </div>
                    <div className="space-y-2">
                      {dayData.exercises.length === 0 ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full border-dashed text-xs font-medium"
                            >
                              <Plus className="h-3.5 w-3.5 mr-1.5" />
                              Add exercise
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuItem onClick={() => addThrowingExerciseToBlock(adjustedDayOfWeek)}>
                              <span className="text-xs">Add exercise</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <>
                          {dayData.exercises.map((exercise, idx) => {
                            const exerciseKey = exercise.blockExerciseId ?? exercise.id;
                            return (
                              <div
                                key={exerciseKey}
                                className="relative rounded-lg border border-border bg-surface-overlay px-1 py-1 shadow-sm transition hover:border-muted-foreground/40 group cursor-pointer"
                                onClick={() => {
                                  const weekIdx = Math.min(reviewWeekIndex, Math.max(0, getWeeksInBlock.length - 1));
                                  const weekData = getThrowingDayData(weekIdx, adjustedDayOfWeek);
                                  const exerciseIndex = weekData.exercises.findIndex(ex => (ex.blockExerciseId ?? ex.id) === exerciseKey);
                                  if (exerciseIndex !== -1) {
                                    setSelectedExerciseForEdit({
                                      weekIndex: weekIdx,
                                      dayIndex: adjustedDayOfWeek,
                                      section: "exercises",
                                      exerciseIndex,
                                      routineType: "throwing",
                                      exercise: weekData.exercises[exerciseIndex],
                                    });
                                    setExerciseEditModalOpen(true);
                                  }
                                }}
                              >
                                <div className="flex justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-semibold truncate">{exercise.name}</div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                                      {exercise.sets} x {exercise.reps || "—"}
                                      {exercise.restTime ? ` • Rest ${exercise.restTime}` : ""}
                                    </div>
                                    {(exercise.repScheme || exercise.progression) && (
                                      <div className="text-[10px] text-muted-foreground/80 mt-1 flex flex-col gap-0.5">
                                        {exercise.repScheme && <span>Scheme: {exercise.repScheme}</span>}
                                        {exercise.progression && <span>Progression: {exercise.progression}</span>}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="absolute top-1 right-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                                  <TooltipProvider delayDuration={200}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => {
                                            const weekIdx = Math.min(reviewWeekIndex, Math.max(0, getWeeksInBlock.length - 1));
                                            const key = getThrowingDayKey(weekIdx, adjustedDayOfWeek);
                                            const weekData = getThrowingDayData(weekIdx, adjustedDayOfWeek);
                                            const exerciseIndex = weekData.exercises.findIndex(ex => (ex.blockExerciseId ?? ex.id) === exerciseKey);
                                            if (exerciseIndex !== -1) {
                                              setSelectedExerciseForEdit({
                                                weekIndex: weekIdx,
                                                dayIndex: adjustedDayOfWeek,
                                                section: "exercises",
                                                exerciseIndex,
                                                routineType: "throwing",
                                                exercise: weekData.exercises[exerciseIndex],
                                              });
                                              setExerciseEditModalOpen(true);
                                            }
                                          }}
                                        >
                                          <Edit className="h-3.5 w-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Edit exercise</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider delayDuration={200}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => shuffleThrowingExerciseInBlock(adjustedDayOfWeek, exercise.blockExerciseId ?? exercise.id)}
                                        >
                                          <Shuffle className="h-3.5 w-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Shuffle suggestion</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider delayDuration={200}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => removeThrowingExerciseFromBlock(adjustedDayOfWeek, exercise.blockExerciseId ?? exercise.id)}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Remove exercise</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            );
                          })}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full border-dashed text-xs font-medium"
                              >
                                <Plus className="h-3.5 w-3.5 mr-1.5" />
                                Add exercise
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                              <DropdownMenuItem onClick={() => addThrowingExerciseToBlock(adjustedDayOfWeek)}>
                                <span className="text-xs">Add exercise</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
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

  const canonicalBlockWeekIndex = useMemo(() => {
    if (getWeeksInBlock.length === 0) return 0;
    return Math.min(reviewWeekIndex, getWeeksInBlock.length - 1);
  }, [getWeeksInBlock, reviewWeekIndex]);

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
      "bg-orange-500/20 border-orange-500/50",
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
    <div className="flex flex-col h-screen bg-surface-base overflow-hidden">
      {/* Fixed Header Component */}
      <div className="fixed left-0 right-0 z-40 border-b bg-surface-base w-full" style={{ top: headerOffset }}>
        <div className="flex h-16 items-center px-5 w-full">
          {/* Left Section (30%) */}
          <div className="flex items-center w-[30%]">
            {/* Block Selection Dropdown */}
            <Select value={selectedBlock} onValueChange={setSelectedBlock}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select block" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="block-1">Block 1</SelectItem>
                <SelectItem value="block-2">Block 2</SelectItem>
                <SelectItem value="block-3">Block 3</SelectItem>
                <SelectItem value="block-4">Block 4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Center Section (40%) */}
          <div className="flex flex-col items-center justify-center flex-1 w-[40%]">
            {/* Progress Indicator */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((step) => {
                const isActive = currentStep === step;
                const stepNames = ["Scope", "Template", "Review"];
                
                return (
                  <div key={step} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStepNavigation(step)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors",
                        isActive && "bg-muted text-foreground",
                        !isActive && "text-foreground hover:bg-muted/50 cursor-pointer"
                      )}
                    >
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
            {/* Save Button */}
            <Button
              type="button"
              variant="default"
              onClick={handleSaveAsDraft}
              className="text-xs"
            >
              Save
            </Button>

            {/* Error and Warning Badges - Show on all steps */}
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
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed header removed */}

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

      {/* Removed Step-specific sub-headers to keep primary bar consistent */}

      <main className="px-0 flex">
        {/* Athlete Info Sidebar */}
        {(currentStep === 2 || currentStep === 3) && selectedAthlete && (
          <div
            className={cn(
              "fixed left-0 bottom-0 z-30 bg-surface-base border-r border-border transition-transform duration-300 overflow-y-auto",
              "top-32",
              athleteSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
            style={{ width: "320px" }}
          >
            <div className="p-5 space-y-6">
              {/* Athlete Header */}
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">{selectedAthlete.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{selectedAthlete.position}</p>
                </div>
              </div>

              {/* Athlete Info */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Basic Information</p>
                  <div className="space-y-2">
                    {selectedAthlete.age && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Age</span>
                        <span className="text-foreground">{selectedAthlete.age}</span>
                      </div>
                    )}
                    {selectedAthlete.height && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Height</span>
                        <span className="text-foreground">{selectedAthlete.height}</span>
                      </div>
                    )}
                    {selectedAthlete.weight && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Weight</span>
                        <span className="text-foreground">{selectedAthlete.weight}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Playing Information</p>
                  <div className="space-y-2">
                    {selectedAthlete.levelOfPlay && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Level</span>
                        <span className="text-foreground">{selectedAthlete.levelOfPlay}</span>
                      </div>
                    )}
                    {selectedAthlete.team && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Team</span>
                        <span className="text-foreground">{selectedAthlete.team}</span>
                      </div>
                    )}
                    {selectedAthlete.league && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">League</span>
                        <span className="text-foreground">{selectedAthlete.league}</span>
                      </div>
                    )}
                    {selectedAthlete.xRole && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">xRole</span>
                        <span className="text-foreground">{selectedAthlete.xRole}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="space-y-2">
                    {selectedAthlete.status && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">Status:</span>
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
                    {selectedAthlete.location && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Location</span>
                        <span className="text-foreground">{selectedAthlete.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div
            className="flex-1 min-h-0 transition-all duration-300 overflow-y-auto"
            style={{ height: 'calc(100vh - 4rem)' }}
        >
        <Form {...form}>
          <form id="program-form" onSubmit={form.handleSubmit(handleSubmit)} className={currentStep === 1 ? "flex flex-col" : "space-y-8"}>
            {/* Step 1: Scope */}
            {currentStep === 1 && (
              <div className="flex flex-col">
                {/* Step 1 is empty */}
              </div>
            )}

            {/* Step 2: Template */}
            {currentStep === 2 && (
              <>
                <div className="w-full bg-surface-base overflow-x-auto">
                  {/* Block Headers Row */}
                  <div className="flex min-w-max border-b bg-surface-base">
                    {/* Empty space for category labels */}
                    <div className="flex flex-col items-center shrink-0 sticky left-0 z-30 bg-surface-base">
                      <div className="h-14 w-10 border-r" />
                    </div>

                    {/* Empty space for row headers */}
                    <div className="flex flex-col shrink-0 w-32 sticky left-10 z-30 bg-surface-base">
                      <div className="h-14 border-r" />
                    </div>

                    {/* Column Headers (4 Static Blocks) */}
                    {blocks.map((block, columnIndex) => {
                      return (
                        <div key={`header-${columnIndex}`} className="flex flex-col shrink-0 w-[236px] border-l mx-1">
                          <div className="px-3 py-2 h-14 flex flex-col justify-center">
                            <div className="flex items-center gap-2 text-xs font-medium">
                              <span className="text-foreground">{block.name}</span>
                            </div>
                            <div className="flex items-center justify-between mt-0.5">
                              <p className="text-xs text-foreground">
                                {format(block.startDate, "MM/dd/yy")} - {format(block.endDate, "MM/dd/yy")}
                              </p>
                              <div className="text-xs text-muted-foreground">
                                {differenceInWeeks(block.endDate, block.startDate)}w
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Blocks - Old content removed */}
            {false && (
              <>
                  {/* Column 1: Form + Blocks table */}
                  <div className="flex-1 flex flex-col space-y-6 bg-surface-base lg:border-r border-[#292928] px-6 py-6 min-w-0 lg:min-w-[400px] lg:flex-shrink-0">
                {!athleteIdProp && (
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
                )}
                {athleteIdProp && selectedAthlete && (
                  <div className="flex items-center justify-between rounded-lg border border-[#292928] bg-[#171716] px-3 py-2">
                    <div className="text-xs text-[#979795]">Athlete</div>
                    <div className="text-xs text-[#f7f6f2]">{selectedAthlete.name}</div>
                  </div>
                )}

                {/* Athlete Profile Card */}
                {selectedAthlete && (
                  <Collapsible defaultOpen={true} className="rounded-lg bg-surface-overlay">
                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-[#1C1C1B] transition-colors rounded-lg">
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
                      <ChevronDown className="h-4 w-4 text-[#979795] transition-transform duration-200 data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4 space-y-4">

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
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Phase End Date Warning */}
                {selectedAthlete?.phaseEndDate && endDate && (() => {
                  const phaseEnd = new Date(selectedAthlete.phaseEndDate);
                  const programEnd = endDate;
                  if (programEnd > phaseEnd) {
                    return (
                      <Alert className="bg-yellow-500/10">
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
                      <FormLabel className="text-xs">Build type</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-3">
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


                {/* Start Date */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <div className="flex items-center gap-1">
                      <FormLabel className="text-xs">Start date</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-[#979795] cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-['Montserrat'] text-xs max-w-xs">
                                Automatically selected as the first available date without existing programming. If the athlete has existing programs, it defaults to the day after the latest program ends.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
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
                                hasProgramming: "bg-[#292928] opacity-60",
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
                          ? "Cannot Continue. Issues Found" 
                          : "Review Issues - Warnings Found"}
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-['Montserrat']">
                        {issues.blocking.length > 0
                          ? `Please resolve the following ${issues.blocking.length} blocking issue${issues.blocking.length > 1 ? 's' : ''} before proceeding.`
                          : `Please review the following ${issues.warnings.length} warning${issues.warnings.length > 1 ? 's' : ''}.`}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    {/* Issue Counters */}
                    <div className="flex items-center gap-2 mt-4 mb-4">
                      {issues.blocking.length > 0 && (
                        <div className="px-2.5 py-1 rounded-md bg-red-500/20 text-red-400 text-xs font-semibold font-['Montserrat']">
                          {issues.blocking.length} Blocking Issue{issues.blocking.length !== 1 ? 's' : ''}
                        </div>
                      )}
                      {issues.warnings.length > 0 && (
                        <div className="px-2.5 py-1 rounded-md bg-yellow-500/20 text-yellow-400 text-xs font-semibold font-['Montserrat']">
                          {issues.warnings.length} Warning{issues.warnings.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {/* Blocking Issues */}
                      {issues.blocking.length > 0 && (
                        <div>
                          <div className="space-y-3">
                            {issues.blocking.map((issue, idx) => (
                              <div key={idx} className="rounded-lg p-3 bg-red-500/10">
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
                          <div className="space-y-3">
                            {issues.warnings.map((warning, idx) => (
                              <div key={idx} className="rounded-lg p-3 bg-yellow-500/10">
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
                      <div className="flex items-center justify-end w-full">
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
                    
                    {/* Issue Counters */}
                    <div className="flex items-center gap-2 mt-4 mb-4">
                      {issues.warnings.length > 0 && (
                        <div className="px-2.5 py-1 rounded-md bg-yellow-500/20 text-yellow-400 text-xs font-semibold font-['Montserrat']">
                          {issues.warnings.length} Warning{issues.warnings.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {/* Warnings */}
                      {issues.warnings.length > 0 && (
                        <div>
                          <div className="space-y-3">
                            {issues.warnings.map((warning, idx) => (
                              <div key={idx} className="rounded-lg p-3 bg-yellow-500/10">
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
                      <div className="flex items-center justify-end w-full">
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
                        Cannot Continue. Errors Found
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-['Montserrat']">
                        Please resolve the following {issues.blocking.length} blocking error{issues.blocking.length !== 1 ? 's' : ''} before proceeding.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    {/* Issue Counters */}
                    <div className="flex items-center gap-2 mt-4 mb-4">
                      {issues.blocking.length > 0 && (
                        <div className="px-2.5 py-1 rounded-md bg-red-500/20 text-red-400 text-xs font-semibold font-['Montserrat']">
                          {issues.blocking.length} Blocking Error{issues.blocking.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {/* Blocking Issues */}
                      {issues.blocking.length > 0 && (
                        <div>
                          <div className="space-y-3">
                            {issues.blocking.map((issue, idx) => (
                              <div key={idx} className="rounded-lg p-3 bg-red-500/10">
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

              <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xs font-medium">Program blocks</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAddBlockModalOpen(true)}
                      className="h-7 px-3 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Add Block
                    </Button>
                  </div>
              {blocks.length > 0 && (
                  <div className="space-y-3">
                    {blocks.map((block, index) => {
                      const blockEndDate = blockEndDates.get(index) || block.endDate;
                      const blockStartDate = blockStartDates.get(index) || block.startDate;
                      const duration = differenceInWeeks(blockEndDate, blockStartDate);
                      const isInvalid = duration < 1 || blockEndDate < blockStartDate;
                      const currentSeason = blockSeasons.get(index) || "off-season";
                      const currentSubSeason = blockSubSeasons.get(index) || "general-off-season";
                      const normalizedStart = new Date(blockStartDate);
                      normalizedStart.setHours(0, 0, 0, 0);
                      const normalizedEnd = new Date(blockEndDate);
                      normalizedEnd.setHours(0, 0, 0, 0);
                      const isActiveBlock = isWithinInterval(normalizedToday, {
                        start: normalizedStart,
                        end: normalizedEnd,
                      });

                      return (
                        <div
                          key={index}
                          className={cn(
                            "rounded-lg border border-[#292928] bg-[#131312] p-4 space-y-3 transition-colors",
                            isInvalid && "border-red-500/40 bg-red-500/5"
                          )}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{block.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {format(blockStartDate, "EEE, MMM d, yyyy")} - {format(blockEndDate, "EEE, MMM d, yyyy")}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[11px] px-2 py-0.5">
                                {duration} week{duration !== 1 ? "s" : ""}
                              </Badge>
                              {isActiveBlock && (
                                <Badge className="text-[11px] bg-green-500/10 text-green-400 border-green-500/30">
                                  Active
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="uppercase tracking-wide">Season:</span>
                            <span className="text-foreground capitalize">{currentSeason.replace("-", " ")}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="uppercase tracking-wide">Sub-season:</span>
                            <span className="text-foreground capitalize">
                              {currentSubSeason.replace(/-/g, " ")}
                            </span>
                          </div>

                          {!isActiveBlock && (
                            <div className="flex items-center gap-3">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-3 text-xs text-destructive hover:text-destructive"
                                disabled
                              >
                                Remove block
                              </Button>
                              <span className="text-[11px] text-muted-foreground">
                                Removal controls coming soon
                              </span>
                            </div>
                          )}

                          {isInvalid && (
                            <p className="text-[11px] text-red-400">
                              Adjust block dates to ensure the end date is after the start date.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
              )}
              </div>
              </div>
                  
                  {/* Column 2: Key Dates and Other Info */}
                  <div className="flex-1 flex flex-col px-4 py-6 lg:min-w-[300px] lg:flex-shrink-0 bg-surface-base">

                  {/* Programming History - Moved to right panel above Key Dates */}
                  {selectedAthleteId && (
                    <div className="mt-4 rounded-md">
                      <h4 className="text-xs font-semibold text-[#f7f6f2] font-['Montserrat'] mb-3">Programming History</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {(() => {
                          // Mock programs - more programs for some athletes
                          const today = new Date();
                          const routineIcons = {
                            throwing: Target,
                            movement: Zap,
                            lifting: Dumbbell,
                          };

                          // Athletes with more programs: "1", "2", "4", "8", "10"
                          const athletesWithMorePrograms = ["1", "2", "4", "8", "10"];
                          const hasMorePrograms = selectedAthleteId && athletesWithMorePrograms.includes(selectedAthleteId);

                          const mockPrograms = hasMorePrograms ? [
                            {
                              startDate: new Date(2025, 9, 12), // Oct 12, 2025
                              endDate: new Date(2026, 2, 12), // Mar 12, 2026
                              routines: ["movement", "throwing", "lifting"] as const,
                            },
                            {
                              startDate: new Date(2025, 5, 1), // Jun 1, 2025
                              endDate: new Date(2025, 9, 11), // Oct 11, 2025
                              routines: ["movement", "lifting"] as const,
                            },
                            {
                              startDate: new Date(2025, 0, 15), // Jan 15, 2025
                              endDate: new Date(2025, 4, 30), // May 30, 2025
                              routines: ["movement", "throwing"] as const,
                            },
                            {
                              startDate: new Date(2024, 8, 1), // Sep 1, 2024
                              endDate: new Date(2025, 0, 14), // Jan 14, 2025
                              routines: ["lifting"] as const,
                            },
                          ] : [
                            {
                              startDate: new Date(2025, 9, 12), // Oct 12, 2025
                              endDate: new Date(2026, 2, 12), // Mar 12, 2026
                              routines: ["movement", "throwing", "lifting"] as const,
                            },
                            {
                              startDate: new Date(2025, 2, 1), // Mar 1, 2025
                              endDate: new Date(2025, 9, 11), // Oct 11, 2025
                              routines: ["movement", "lifting"] as const,
                            },
                          ];

                          return null;
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Key Dates Panel - Only show when athlete is selected */}
                  {selectedAthleteId && (
                    <Collapsible defaultOpen={true} className="mt-4 rounded-md">
                      <CollapsibleTrigger className="flex items-center justify-between w-full text-left hover:bg-muted/50 rounded-md px-1 py-1 transition-colors">
                        <h3 className="text-xs font-medium">Key Dates</h3>
                        <ChevronDown className="h-4 w-4 text-[#979795] transition-transform duration-200 data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="space-y-2 mt-3">
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
                                className="flex items-center gap-2 p-2 rounded-md bg-surface-raised hover:bg-muted/50 transition-colors"
                              >
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
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {/* Last Assessment/Re-assessment Section */}
                  {selectedAthleteId && (
                    <Collapsible defaultOpen={true} className="mt-4 rounded-md">
                      <CollapsibleTrigger className="flex items-center justify-between w-full text-left hover:bg-muted/50 rounded-md px-1 py-1 transition-colors">
                        <h3 className="text-xs font-medium">Last assessment/re-assessment</h3>
                        <ChevronDown className="h-4 w-4 text-[#979795] transition-transform duration-200 data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="space-y-2 mt-3">
                          {(() => {
                            // Mock assessment data - varies by athlete
                            const getMockAssessments = (athleteId: string | undefined) => {
                              if (!athleteId) return [];
                              
                              // Different assessments for different athletes
                              const assessmentsByAthlete: Record<string, Array<{ date: Date; type: string; details: string }>> = {
                                "1": [
                                  { date: new Date(2024, 10, 20), type: "Performance Assessment", details: "Full body movement screen and strength testing" },
                                  { date: new Date(2024, 8, 5), type: "Re-assessment", details: "Follow-up evaluation post-season" },
                                ],
                                "2": [
                                  { date: new Date(2024, 11, 1), type: "Performance Assessment", details: "Comprehensive fitness assessment" },
                                ],
                                "3": [
                                  { date: new Date(2024, 9, 15), type: "Re-assessment", details: "Medical clearance evaluation" },
                                ],
                                "4": [
                                  { date: new Date(2024, 10, 10), type: "Performance Assessment", details: "Pre-season movement analysis" },
                                  { date: new Date(2024, 7, 20), type: "Re-assessment", details: "Mid-season progress check" },
                                ],
                                "5": [
                                  { date: new Date(2024, 11, 5), type: "Performance Assessment", details: "Baseline assessment" },
                                ],
                                "6": [
                                  { date: new Date(2024, 10, 25), type: "Re-assessment", details: "Post-injury re-evaluation" },
                                ],
                                "7": [
                                  { date: new Date(2024, 9, 1), type: "Performance Assessment", details: "Injury assessment and evaluation" },
                                  { date: new Date(2024, 8, 10), type: "Re-assessment", details: "Initial injury screening" },
                                ],
                                "8": [
                                  { date: new Date(2024, 11, 8), type: "Performance Assessment", details: "Full body movement screen" },
                                  { date: new Date(2024, 9, 20), type: "Re-assessment", details: "Follow-up evaluation" },
                                ],
                                "9": [
                                  { date: new Date(2024, 10, 15), type: "Performance Assessment", details: "Comprehensive assessment" },
                                ],
                                "10": [
                                  { date: new Date(2024, 11, 12), type: "Performance Assessment", details: "Pre-season performance testing" },
                                  { date: new Date(2024, 8, 25), type: "Re-assessment", details: "Post-season evaluation" },
                                ],
                              };

                              return assessmentsByAthlete[athleteId] || [
                                { date: new Date(2024, 10, 15), type: "Performance Assessment", details: "Full body movement screen" },
                              ];
                            };

                            const mockAssessments = getMockAssessments(selectedAthleteId);

                            // Filter assessments within date range if available
                            const filteredAssessments = startDate && endDate
                              ? mockAssessments.filter(assessment => {
                                  const assessmentDate = new Date(assessment.date);
                                  assessmentDate.setHours(0, 0, 0, 0);
                                  const start = new Date(startDate);
                                  start.setHours(0, 0, 0, 0);
                                  const end = new Date(endDate);
                                  end.setHours(0, 0, 0, 0);
                                  return assessmentDate >= start && assessmentDate <= end;
                                })
                              : mockAssessments;

                            // Sort by date (most recent first)
                            const sortedAssessments = filteredAssessments.sort((a, b) => b.date.getTime() - a.date.getTime());

                            if (sortedAssessments.length === 0) {
                              return (
                                <p className="text-xs text-muted-foreground text-center py-4">
                                  No assessments in the selected date range
                                </p>
                              );
                            }

                            return sortedAssessments.map((assessment, index) => (
                              <div
                                key={`assessment-${assessment.date.getTime()}-${index}`}
                                className="flex items-center gap-2 p-2 rounded-md bg-surface-raised hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-medium text-foreground">
                                      {format(assessment.date, "MMM d, yyyy")}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 border-amber-500/30"
                                    >
                                      {assessment.type}
                                    </Badge>
                      </div>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {assessment.details}
                                  </p>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {/* New Injuries/Treatment Sessions Section */}
                  {selectedAthleteId && (
                    <Collapsible defaultOpen={true} className="mt-4 rounded-md">
                      <CollapsibleTrigger className="flex items-center justify-between w-full text-left hover:bg-muted/50 rounded-md px-1 py-1 transition-colors">
                        <h3 className="text-xs font-medium">New injuries/treatment sessions</h3>
                        <ChevronDown className="h-4 w-4 text-[#979795] transition-transform duration-200 data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="space-y-2 mt-3">
                          {(() => {
                            // Mock injury/treatment data - in real app, this would come from API
                            const mockInjuries = [
                              {
                                date: new Date(2024, 11, 5), // December 5, 2024
                                type: "Injury",
                                details: "Shoulder impingement - Right shoulder",
                                treatment: "Physical therapy session",
                              },
                              {
                                date: new Date(2024, 11, 12), // December 12, 2024
                                type: "Treatment",
                                details: "Follow-up treatment",
                                treatment: "Manual therapy",
                              },
                            ];

                            // Filter injuries/treatments within date range if available
                            const filteredInjuries = startDate && endDate
                              ? mockInjuries.filter(injury => {
                                  const injuryDate = new Date(injury.date);
                                  injuryDate.setHours(0, 0, 0, 0);
                                  const start = new Date(startDate);
                                  start.setHours(0, 0, 0, 0);
                                  const end = new Date(endDate);
                                  end.setHours(0, 0, 0, 0);
                                  return injuryDate >= start && injuryDate <= end;
                                })
                              : mockInjuries;

                            // Sort by date (most recent first)
                            const sortedInjuries = filteredInjuries.sort((a, b) => b.date.getTime() - a.date.getTime());

                            if (sortedInjuries.length === 0) {
                    return (
                                <p className="text-xs text-muted-foreground text-center py-4">
                                  No injuries or treatment sessions in the selected date range
                                </p>
                              );
                            }

                            return sortedInjuries.map((injury, index) => {
                              const typeColors: Record<string, string> = {
                                Injury: "bg-red-500/20 text-red-400 border-red-500/30",
                                Treatment: "bg-purple-500/20 text-purple-400 border-purple-500/30",
                              };

                              return (
                                <div
                                  key={`injury-${injury.date.getTime()}-${index}`}
                                  className="flex items-center gap-2 p-2 rounded-md bg-surface-raised hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-medium text-foreground">
                                        {format(injury.date, "MMM d, yyyy")}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          "text-xs px-2 py-0.5",
                                          typeColors[injury.type] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                        )}
                                      >
                                        {injury.type}
                                      </Badge>
                          </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {injury.details}
                                    </p>
                                    {injury.treatment && (
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        {injury.treatment}
                                      </p>
                                    )}
                          </div>
                      </div>
                    );
                            });
                  })()}
                </div>
                      </CollapsibleContent>
                    </Collapsible>
              )}
              </div>
              </>
            )}

            {/* Step 2: Blocks */}
            {currentStep === 2 && (
              <>
                {blocks.length === 0 ? (
                  <div className="w-full">
                    <div className="rounded-lg border-2 border-dashed border-border p-12 text-center">
                      <h3 className="text-lg font-semibold mb-2">No blocks available</h3>
                      <p className="text-muted-foreground">
                        Please complete Step 1 to generate blocks first.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full bg-surface-base overflow-x-auto">
                    {/* Block Headers Row */}
                    <div className="flex min-w-max border-b bg-surface-base">
                      {/* Empty space for category labels */}
                      <div className="flex flex-col items-center shrink-0 sticky left-0 z-30 bg-surface-base">
                        <div className="h-14 w-10 border-r" />
                      </div>

                      {/* Empty space for row headers */}
                      <div className="flex flex-col shrink-0 w-32 sticky left-10 z-30 bg-surface-base">
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
                    <div className="flex min-w-max px-0 my-2 relative border-t border-b border-border">
                      {/* Category Label (Rotated) */}
                      <div className="flex flex-col items-center shrink-0 sticky left-0 z-20 bg-surface-base overflow-hidden">
                        <div className="w-10 border-r bg-muted/10 flex-1 flex items-center justify-center">
                            <div className="-rotate-90 whitespace-nowrap transform origin-center">
                              <span className="text-xs font-medium text-foreground">Schedule</span>
                            </div>
                          </div>
                      </div>

                      {/* Row Headers */}
                      <div className="flex flex-col shrink-0 w-32 sticky left-10 z-20 bg-surface-base border-r">
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
                    <div className="flex min-w-max px-0 my-2 relative border-t border-b border-border">
                      {/* Category Label (Rotated) */}
                      <div className="flex flex-col items-center shrink-0 sticky left-0 z-20 bg-surface-base overflow-hidden">
                        <div className="w-10 border-r bg-cyan-500/10 flex-1 flex items-center justify-center">
                            <div className="-rotate-90 whitespace-nowrap transform origin-center">
                            <span className="text-xs font-medium text-cyan-700">xRole</span>
                            </div>
                          </div>
                      </div>

                      {/* Row Headers */}
                      <div className="flex flex-col shrink-0 w-32 sticky left-10 z-20 bg-surface-base border-r">
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
                                    <AlertCircle className="absolute right-6 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cyan-500" 
                                         title="Customized at lower level" />
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Movement Section */}
                    {routineTypes.includes("movement") && (
                    <div className="flex min-w-max px-0 my-2 relative border-t border-b border-border">
                      {/* Category Label (Rotated) */}
                      <div className="flex flex-col items-center shrink-0 sticky left-0 z-20 bg-surface-base overflow-hidden">
                        <div className="w-10 border-r bg-violet-500/10 flex-1 flex items-center justify-center">
                            <div className="-rotate-90 whitespace-nowrap transform origin-center">
                            <p className="text-xs font-medium text-violet-700">Movement</p>
                            </div>
                          </div>
                      </div>

                      {/* Row Headers */}
                      <div className="flex flex-col shrink-0 w-32 sticky left-10 z-20 bg-surface-base border-r">
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
                                <AlertCircle className="absolute right-6 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-violet-500" 
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
                                <AlertCircle className="absolute right-6 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-violet-500" 
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
                    {(routineTypes.includes("lifting") || routineTypes.includes("strength-conditioning")) && (
                    <div className="flex min-w-max px-0 my-2 relative border-t border-b border-border">
                      {/* Category Label (Rotated) */}
                      <div className="flex flex-col items-center shrink-0 sticky left-0 z-20 bg-surface-base overflow-hidden">
                        <div className="w-10 border-r bg-orange-500/10 flex-1 flex items-center justify-center">
                            <div className="-rotate-90 whitespace-nowrap transform origin-center">
                              <p className="text-xs font-medium text-orange-700">Lifting</p>
                            </div>
                          </div>
                      </div>

                      {/* Row Headers */}
                      <div className="flex flex-col shrink-0 w-32 sticky left-10 z-20 bg-surface-base border-r">
                        <div className="h-10 flex items-center px-3 border-b">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-xs font-medium text-muted-foreground cursor-help">Training Split</p>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>4 = number of lifting days, 2 = conditioning days</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
                                <AlertCircle className="absolute right-6 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-orange-500" 
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
                                <AlertCircle className="absolute right-6 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-orange-500" 
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
                                <AlertCircle className="absolute right-6 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-orange-500" 
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
                                <AlertCircle className="absolute right-6 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-orange-500" 
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
                                <AlertCircle className="absolute right-6 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-orange-500" 
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
                    <div className="flex min-w-max px-0 my-2 relative border-t border-b border-border">
                      {/* Category Label (Rotated) */}
                      <div className="flex flex-col items-center shrink-0 sticky left-0 z-20 bg-surface-base overflow-hidden">
                        <div className="w-10 border-r bg-orange-500/10 flex-1 flex items-center justify-center">
                            <div className="-rotate-90 whitespace-nowrap transform origin-center">
                              <span className="text-xs font-medium text-orange-700">Conditioning</span>
                            </div>
                          </div>
                      </div>

                      {/* Row Headers */}
                      <div className="flex flex-col shrink-0 w-32 sticky left-10 z-20 bg-surface-base border-r">
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
                              isDayOff ? "bg-muted/30" : "bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
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
                                    <AlertCircle className="absolute right-6 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-orange-500" 
                                         title="Customized at lower level" />
                                  )}
                                </>
                              )}
                            </div>

                            {/* Adaptation Dropdown */}
                            <div className={cn(
                              "h-10 flex items-center border-b relative",
                              isDayOff ? "bg-muted/30" : "bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
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
                                    <AlertCircle className="absolute right-6 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-orange-500" 
                                         title="Customized at lower level" />
                                  )}
                                </>
                              )}
                            </div>

                            {/* Method Dropdown */}
                            <div className={cn(
                              "h-10 flex items-center relative",
                              isDayOff ? "bg-muted/30" : "bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
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
                                    <AlertCircle className="absolute right-6 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-orange-500" 
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
                    <div className="flex min-w-max px-0 my-2 relative border-t border-b border-border">
                      {/* Category Label (Rotated) */}
                      <div className="flex flex-col items-center shrink-0 sticky left-0 z-20 bg-surface-base overflow-hidden">
                        <div className="w-10 border-r bg-blue-500/10 flex-1 flex items-center justify-center">
                          <div className="-rotate-90 whitespace-nowrap transform origin-center">
                            <p className="text-xs font-medium text-blue-700">Throwing</p>
                  </div>
                        </div>
                      </div>

                      {/* Row Headers */}
                      <div className="flex flex-col shrink-0 w-32 sticky left-10 z-20 bg-surface-base border-r">
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
                                <AlertCircle className="absolute right-6 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-500" 
                                     title="Customized at lower level" />
                )}
              </>
            )}
                        </div>

                          {/* Exclusions Dropdown */}
                          <div className={cn(
                            "h-10 flex items-center relative",
                            isDayOff ? "bg-muted/20" : "bg-surface-base hover:bg-muted/10 transition-colors"
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
                                <AlertCircle className="absolute right-6 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-500" 
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
                  </div>
                )}
              </>
            )}

            {/* Step 3: Review Program */}
            {currentStep === 3 && (
              <>
                <div className="w-full bg-surface-base overflow-x-auto pt-8">
                  {/* Day Headers */}
                  <div className="sticky top-8 z-30 bg-surface-base border-b">
                    <div className="flex min-w-max">
                      {/* Empty space for section labels */}
                      <div className="w-[150px] shrink-0 border-r bg-surface-base h-12 flex items-center justify-center">
                        <span className="text-xs font-medium text-muted-foreground">Sections</span>
                      </div>
                      
                      {/* Day columns */}
                      {(() => {
                        const today = new Date();
                        const weekMonday = startOfWeek(today, { weekStartsOn: 1 });
                        return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((dayName, dayIdx) => {
                          const dayDate = addDays(weekMonday, dayIdx);
                          const isRest = dayIdx === 3; // Thursday is rest
                          return (
                            <div
                              key={dayIdx}
                              className={cn(
                                "w-[240px] min-w-[240px] shrink-0 text-center border-r h-12 px-3 flex flex-col justify-center bg-muted/15"
                              )}
                            >
                              <div className="text-xs font-semibold">{dayName}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {format(dayDate, "MMM d")}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Section Rows */}
                  <div className="min-w-max space-y-0.5 relative bg-surface-base">
                    {/* Mock data for Review table */}
                    {(() => {
                      const reviewSections = [
                        { id: "movement", label: "Movement", description: "Movement prep, mobility, and patterning" },
                        { id: "preparatory", label: "R1 - Preparatory", description: "Warm-up exercises" },
                        { id: "mobility", label: "R2 - Mobility", description: "Mobility and flexibility" },
                        { id: "activation", label: "R3 - Activation", description: "Movement preparation" },
                        { id: "core-lift", label: "R4 - Core Lift", description: "Primary strength exercises" },
                        { id: "accessory", label: "R5 - Accessory", description: "Supporting exercises" },
                        { id: "conditioning", label: "R6 - Conditioning/Recovery", description: "Conditioning and recovery" },
                        { id: "throwing", label: "Throwing", description: "Throwing phases, intensity, and daily prescriptions" },
                      ];

                      // Mock exercise data
                      const mockExercises: Record<string, Record<number, Array<{name: string; sets: number; reps: string; restTime?: string; repScheme?: string; progression?: string}>>> = {
                        movement: {
                          0: [{ name: "Hip Mobility Circuit", sets: 1, reps: "10 min", restTime: "0:00" }], // Monday
                          1: [{ name: "Hip Mobility Circuit", sets: 1, reps: "10 min", restTime: "0:00" }], // Tuesday
                          2: [{ name: "Hip Mobility Circuit", sets: 1, reps: "10 min", restTime: "0:00" }], // Wednesday
                          3: [], // Thursday - rest
                          4: [{ name: "Hip Mobility Circuit", sets: 1, reps: "10 min", restTime: "0:00" }], // Friday
                        },
                        preparatory: {
                          0: [{ name: "Jump Rope Primer", sets: 3, reps: "2 min", restTime: "1:00" }], // Monday
                          1: [{ name: "Dynamic Warm-Up Series", sets: 1, reps: "15 min", restTime: "0:00" }], // Tuesday
                          2: [{ name: "Jump Rope Primer", sets: 3, reps: "2 min", restTime: "1:00" }], // Wednesday
                          3: [], // Thursday - rest
                          4: [{ name: "Jump Rope Primer", sets: 3, reps: "2 min", restTime: "1:00" }], // Friday
                        },
                        mobility: {
                          0: [{ name: "World's Greatest Stretch", sets: 3, reps: "10", restTime: "0:30" }], // Monday
                          1: [{ name: "Thoracic Spine Opens", sets: 2, reps: "8", restTime: "0:45" }], // Tuesday
                          2: [{ name: "World's Greatest Stretch", sets: 3, reps: "10", restTime: "0:30" }], // Wednesday
                          3: [], // Thursday - rest
                          4: [{ name: "World's Greatest Stretch", sets: 3, reps: "10", restTime: "0:30" }], // Friday
                        },
                        activation: {
                          0: [{ name: "Glute Bridge + March", sets: 3, reps: "12", restTime: "0:45" }], // Monday
                          1: [{ name: "Mini-Band Lateral Walk", sets: 2, reps: "15", restTime: "0:30" }], // Tuesday
                          2: [{ name: "Glute Bridge + March", sets: 3, reps: "12", restTime: "0:45" }], // Wednesday
                          3: [], // Thursday - rest
                          4: [{ name: "Glute Bridge + March", sets: 3, reps: "12", restTime: "0:45" }], // Friday
                        },
                        "core-lift": {
                          0: [{ name: "Back Squat", sets: 4, reps: "5", restTime: "3:00", repScheme: "5x5", progression: "Linear" }], // Monday
                          1: [{ name: "Barbell Bench Press", sets: 4, reps: "5", restTime: "3:00", repScheme: "5x5", progression: "Linear" }], // Tuesday
                          2: [{ name: "Back Squat", sets: 4, reps: "5", restTime: "3:00", repScheme: "5x5", progression: "Linear" }], // Wednesday
                          3: [], // Thursday - rest
                          4: [{ name: "Back Squat", sets: 4, reps: "5", restTime: "3:00", repScheme: "5x5", progression: "Linear" }], // Friday
                        },
                        accessory: {
                          0: [{ name: "Dumbbell Rows", sets: 3, reps: "10", restTime: "1:30" }], // Monday
                          1: [{ name: "Tricep Extensions", sets: 3, reps: "12", restTime: "1:00" }], // Tuesday
                          2: [{ name: "Face Pulls", sets: 3, reps: "15", restTime: "1:00" }], // Wednesday
                          3: [], // Thursday - rest
                          4: [{ name: "Bicep Curls", sets: 3, reps: "12", restTime: "1:00" }], // Friday
                        },
                        conditioning: {
                          0: [{ name: "Bike Intervals", sets: 4, reps: "5 min", restTime: "2:00" }], // Monday
                          1: [{ name: "Foam Rolling", sets: 1, reps: "15 min", restTime: "0:00" }], // Tuesday
                          2: [{ name: "Sled Push", sets: 4, reps: "40m", restTime: "2:00" }], // Wednesday
                          3: [], // Thursday - rest
                          4: [{ name: "Recovery Walk", sets: 1, reps: "20 min", restTime: "0:00" }], // Friday
                        },
                        throwing: {
                          0: [{ name: "Long Toss", sets: 1, reps: "120 ft", restTime: "0:00" }], // Monday
                          1: [{ name: "Bullpen Session", sets: 1, reps: "30 pitches", restTime: "0:00" }], // Tuesday
                          2: [{ name: "Flat Ground", sets: 1, reps: "40 pitches", restTime: "0:00" }], // Wednesday
                          3: [], // Thursday - rest
                          4: [{ name: "Long Toss", sets: 1, reps: "120 ft", restTime: "0:00" }], // Friday
                        },
                      };

                      return reviewSections.map((section) => (
                        <div key={section.id} className="flex min-w-max border-b bg-background">
                          {/* Section Label Column */}
                          <div className="w-[150px] shrink-0 border-r bg-surface-base sticky left-0 z-20">
                            <div className="px-3 py-4 min-h-[100px] flex flex-col justify-center gap-1.5">
                              <div className="text-xs font-semibold">{section.label}</div>
                              <div className="text-[10px] text-muted-foreground">
                                {section.description}
                              </div>
                            </div>
                          </div>

                          {/* Day Columns */}
                          {[0, 1, 2, 3, 4].map((dayIdx) => {
                            const isRest = dayIdx === 3; // Thursday
                            const exercises = mockExercises[section.id]?.[dayIdx] || [];

                            return (
                              <div
                                key={dayIdx}
                                className={cn(
                                  "w-[240px] min-w-[240px] shrink-0 border-r min-h-[100px] p-2",
                                  isRest ? "bg-transparent" : "bg-surface-base"
                                )}
                              >
                                {isRest ? (
                                  <div className="h-full flex items-center justify-center">
                                    <Bed className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {exercises.length === 0 ? (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-full w-full text-muted-foreground hover:text-foreground border-dashed"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    ) : (
                                      <>
                                        {exercises.map((exercise, idx) => (
                                          <ExerciseCard
                                            key={idx}
                                            exercise={exercise}
                                            showRepSchemes={true}
                                            className="cursor-pointer"
                                            onEdit={() => {
                                              console.log("Edit exercise:", exercise.name);
                                            }}
                                            onShuffle={() => {
                                              console.log("Shuffle exercise:", exercise.name);
                                            }}
                                            onRemove={() => {
                                              console.log("Remove exercise:", exercise.name);
                                            }}
                                          />
                                        ))}
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          className="w-full border-dashed text-xs font-medium mt-1"
                                        >
                                          <Plus className="h-3.5 w-3.5 mr-1.5" />
                                          Add exercise
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Old Step 3 content removed - keeping structure for reference */}
                {false && (
                  <>
                    <div className="w-full flex flex-col absolute top-32 left-0 right-0 bottom-0" style={{ top: '8rem' }}>
                      {/* Empty State - Show when no weeks available */}
                      {getWeeksInBlock.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                            <p className="text-sm font-medium text-muted-foreground">No weeks available</p>
                            <p className="text-xs text-muted-foreground">Please ensure blocks are configured with valid dates.</p>
                          </div>
                        </div>
                      ) : (
                        <>
                      {/* Block View */}
                      <div className="flex-1 overflow-auto w-full bg-surface-base">
                        <div className="w-full">
                      {/* Day Headers */}
                      <div className="sticky top-0 z-30 bg-surface-base border-b">
                        <div className="flex min-w-max">
                          {/* Empty space for section labels */}
                          <div className="w-[150px] shrink-0 border-r bg-surface-base h-12 flex items-center justify-center">
                            <span className="text-xs font-medium text-muted-foreground">Sections</span>
                          </div>
                            
                            {/* Day columns */}
                            {(() => {
                              // Get dates for the current week in block view
                              const weekMonday = currentWeek ? startOfWeek(currentWeek.startDate, { weekStartsOn: 1 }) : null;
                              return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((dayName, dayIdx) => {
                                const dayOfWeek = dayIdx + 1; // Monday = 1, Sunday = 0 (adjust for getDay format)
                                const adjustedDayOfWeek = dayOfWeek === 7 ? 0 : dayOfWeek; // Convert Sunday to 0
                                const isRest = calculatedDaysOff.has(adjustedDayOfWeek) || adjustedDayOfWeek === 4; // Thursday is rest
                                const dayDate = weekMonday ? addDays(weekMonday, dayIdx) : null;

                                return (
                                  <div
                                    key={dayIdx}
                                    className={cn(
                                      "w-[240px] min-w-[240px] shrink-0 text-center border-r h-12 px-3 flex flex-col justify-center bg-muted/15"
                                    )}
                                  >
                                    <div className="text-xs font-semibold">{dayName}</div>
                                    {dayDate && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                        {format(dayDate, "MMM d")}
                              </div>
                                    )}
                            </div>
                                );
                              });
                            })()}
                        </div>

                                  </div>

                        {/* Section Rows */}
                        <div className="min-w-max space-y-0.5 relative bg-surface-base">
                          {/* Rest Day Overlays - Merged cells spanning all sections */}
                          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((dayName, dayIdx) => {
                            const dayOfWeek = dayIdx + 1;
                            const adjustedDayOfWeek = dayOfWeek === 7 ? 0 : dayOfWeek;
                            const isRest = calculatedDaysOff.has(adjustedDayOfWeek) || adjustedDayOfWeek === 4;
                            
                            if (!isRest) return null;
                            
                            // Calculate left position for this day column
                            const leftOffset = 150 + (dayIdx * 240); // 150px for section column + day width * index
                            
                            return (
                              <div
                                key={`rest-overlay-${dayIdx}`}
                                className="absolute top-0 bottom-0 border-r pointer-events-none z-10"
                                style={{
                                  left: `${leftOffset}px`,
                                  width: "240px",
                                }}
                              >
                                <div className="h-full flex items-center justify-center bg-surface-base/50 border-r">
                                  <Bed className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </div>
                            );
                          })}
                          
                          {/* Lifting Section */}
                          {(routineTypes.includes("lifting") || routineTypes.includes("strength-conditioning")) && (
                            <div className="flex min-w-max">
                              {/* Section Label Column */}
                              <div className="w-[150px] shrink-0 sticky left-0 z-20 bg-surface-base border-r">
                                <div className="px-3 py-2.5 text-xs font-semibold text-orange-700 border-b h-12 flex items-center bg-surface-base">
                                  Lifting
                              </div>
                                {sectionConfigs.map((section) => (
                                  <div
                                    key={section.id}
                                    className={cn(
                                      "px-3 py-2.5 text-xs border-b min-h-[80px] flex items-start pt-2.5 bg-surface-base",
                                      !expandedSections.has(section.id) && "h-10"
                                    )}
                                  >
                                    {section.label}
                                  </div>
                                ))}
                              </div>
                              
                              {/* Day Columns */}
                              {(() => {
                                const weekMonday = currentWeek ? startOfWeek(currentWeek.startDate, { weekStartsOn: 1 }) : null;
                                return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((dayName, dayIdx) => {
                                  const dayOfWeek = dayIdx + 1;
                                  const adjustedDayOfWeek = dayOfWeek === 7 ? 0 : dayOfWeek;
                                  const isRest = calculatedDaysOff.has(adjustedDayOfWeek) || adjustedDayOfWeek === 4;
                                  const canonicalWeekIndex = Math.min(
                                    reviewWeekIndex,
                                    Math.max(0, getWeeksInBlock.length - 1)
                                  );
                            
                            return (
                                <div
                                  key={dayIdx}
                                  className={cn(
                                    "w-[240px] min-w-[240px] shrink-0 border-r",
                                        isRest && "bg-surface-base"
                                      )}
                                    >
                                      {/* Day Header in Section Column */}
                                      <div className="h-12 border-b bg-surface-base" />
                                      
                                      {/* Section Cells */}
                                      {sectionConfigs.map((section) => {
                                        const blockDayData = getLiftingDayData(canonicalWeekIndex, adjustedDayOfWeek);
                                        const sectionExercises = (blockDayData.exercises || []).filter(
                                          (ex) => ex.sectionId === section.id
                                        );
                                        const exercise = sectionExercises.length > 0 ? sectionExercises[0] : null;
                                        
                                        return (
                                          <div
                                            key={section.id}
                                            className={cn(
                                              "border-b min-h-[80px] bg-surface-base",
                                              !expandedSections.has(section.id) && "h-10"
                                            )}
                                          >
                                            {isRest ? (
                                              <div className="h-full flex items-center justify-center">
                                                <Bed className="h-5 w-5 text-muted-foreground" />
                                              </div>
                                            ) : exercise ? (
                                              <ExerciseCard
                                                exercise={exercise}
                                                showRepSchemes={showRepSchemes}
                                                onClick={() => {
                                                  const exerciseIndex = blockDayData.exercises.findIndex(ex => ex.id === exercise.id);
                                                  setSelectedExerciseForEdit({
                                                    weekIndex: canonicalWeekIndex,
                                                    dayIndex: adjustedDayOfWeek,
                                                    section: "exercises",
                                                    exerciseIndex: exerciseIndex,
                                                    routineType: "lifting",
                                                    exercise: exercise,
                                                  });
                                                  setExerciseEditModalOpen(true);
                                                }}
                                                onEdit={() => {
                                                  const exerciseIndex = blockDayData.exercises.findIndex(ex => ex.id === exercise.id);
                                                  setSelectedExerciseForEdit({
                                                    weekIndex: canonicalWeekIndex,
                                                    dayIndex: adjustedDayOfWeek,
                                                    section: "exercises",
                                                    exerciseIndex: exerciseIndex,
                                                    routineType: "lifting",
                                                    exercise: exercise,
                                                  });
                                                  setExerciseEditModalOpen(true);
                                                }}
                                                onShuffle={() => {
                                                  const exerciseIndex = blockDayData.exercises.findIndex(ex => ex.id === exercise.id);
                                                  shuffleExercise(canonicalWeekIndex, adjustedDayOfWeek, exerciseIndex);
                                                }}
                                                onRemove={() => {
                                                  const exerciseIndex = blockDayData.exercises.findIndex(ex => ex.id === exercise.id);
                                                  removeExercise(canonicalWeekIndex, adjustedDayOfWeek, exerciseIndex);
                                                }}
                                              />
                                            ) : (
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                  addExercises(canonicalWeekIndex, adjustedDayOfWeek);
                                                }}
                                                className="h-full w-full text-muted-foreground hover:text-foreground"
                                              >
                                                <Plus className="h-4 w-4" />
                                              </Button>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          )}
                          
                          {renderThrowingBlockSection()}
                        </div>
                      </div>
                    </div>
                        </>
                      )}
                    </div>
                  </>
                  )}
              </>
            )}

          </form>
        </Form>
        </div>
      </main>
      
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
                    value={selectedExerciseForEdit.exercise.sets || ""}
                    onChange={(e) => {
                      const newSets = parseInt(e.target.value) || 0;
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
                    value={selectedExerciseForEdit.exercise.reps || ""}
                    onChange={(e) => {
                      const newReps = parseInt(e.target.value) || 0;
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
                  <Label htmlFor="edit-weight">Weight</Label>
                  <Input
                    id="edit-weight"
                    type="text"
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
                <div>
                  <Label htmlFor="edit-rest">Rest Time</Label>
                  <Input
                    id="edit-rest"
                    type="text"
                    value={selectedExerciseForEdit.exercise.restTime || ""}
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
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedExerciseForEdit(null);
                    setExerciseEditModalOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (selectedExerciseForEdit) {
                      setSelectedExerciseForEdit(null);
                      setExerciseEditModalOpen(false);
                    }
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Block View Exercise Library */}
      <Dialog
        open={!!blockExerciseSelectionContext}
        onOpenChange={(open) => !open && setBlockExerciseSelectionContext(null)}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Exercise</DialogTitle>
            <DialogDescription>
              Choose an exercise to add to {blockExerciseSelectionContext?.sectionId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Exercise library content */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
