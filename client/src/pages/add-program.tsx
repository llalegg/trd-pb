import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { CalendarIcon, X, ChevronDown, ChevronRight, ChevronLeft, EyeOff, Lock, Shuffle, Trash2, Moon } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { format, differenceInWeeks, addWeeks, addDays, startOfWeek, endOfWeek, isWithinInterval, getDay } from "date-fns";
import { Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Athlete } from "@shared/schema";

const mockAthletes: Athlete[] = [
  { id: "1", name: "Sarah Johnson" },
  { id: "2", name: "Michael Chen" },
  { id: "3", name: "Emma Rodriguez" },
  { id: "4", name: "James Williams" },
  { id: "5", name: "Olivia Martinez" },
  { id: "6", name: "Daniel Anderson" },
  { id: "7", name: "Sophia Taylor" },
  { id: "8", name: "Liam Brown" },
  { id: "9", name: "Ava Davis" },
  { id: "10", name: "Noah Wilson" },
];

const routineTypeOptions = [
  { id: "movement", label: "Movement" },
  { id: "throwing", label: "Throwing" },
  { id: "lifting", label: "Lifting" },
  { id: "nutrition", label: "Nutrition" },
];

const blockDurationOptions = [2, 4, 6, 8] as const;

const programFormSchema = z.object({
  athleteId: z.string().min(1, "Please select an athlete"),
  startDate: z.date({
    required_error: "Please select a start date",
  }),
  endDate: z.date({
    required_error: "Please select an end date",
  }),
  blockDuration: z.coerce.number().int().refine(
    (val) => blockDurationOptions.includes(val as typeof blockDurationOptions[number]),
    "Please select a valid block duration"
  ),
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
  const [routineTypesOpen, setRoutineTypesOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [viewMode, setViewMode] = useState<"blocks" | "weeks" | "days">("blocks");
  const [selectedBlockIndex, setSelectedBlockIndex] = useState(0);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [selectedDayWeekIndex, setSelectedDayWeekIndex] = useState(0);
  const [daysOff, setDaysOff] = useState<Set<number>>(new Set([0])); // Sunday (0) hidden by default
  const [programId] = useState(() => generateProgramId());
  
  // Block phases state
  const [blockPhases, setBlockPhases] = useState<Map<number, string>>(new Map());
  
  // Block training splits state
  const [blockTrainingSplits, setBlockTrainingSplits] = useState<Map<number, string>>(new Map());
  
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
      blockDuration: 0,
      startDate: new Date(),
      endDate: undefined,
      routineTypes: ["movement", "throwing", "lifting", "nutrition"],
    },
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
    const athlete = mockAthletes.find((a) => a.id === values.athleteId);
    if (!athlete) return;

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
  const selectedAthlete = mockAthletes.find((a) => a.id === selectedAthleteId);
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const blockDuration = form.watch("blockDuration");
  const routineTypes = form.watch("routineTypes");

  const weeksCount =
    startDate && endDate ? differenceInWeeks(endDate, startDate) : 0;

  // Calculate blocks based on start date, end date, and block duration
  const blocks = useMemo(() => {
    if (!startDate || !endDate || !blockDuration) {
      return [];
    }

    const totalWeeks = differenceInWeeks(endDate, startDate);
    if (totalWeeks <= 0) {
      return [];
    }

    const generatedBlocks: Array<{ name: string; startDate: Date; endDate: Date }> = [];
    let currentStart = startDate;
    let blockNumber = 1;

    while (currentStart < endDate) {
      // Calculate the end date for this block (blockDuration weeks from start)
      const potentialEnd = addDays(addWeeks(currentStart, blockDuration), -1);
      
      // If the potential end is after the program end date, cap it at program end date
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
  }, [startDate, endDate, blockDuration]);

  // Check if step 1 is complete (all required fields filled)
  const isStep1Complete = useMemo(() => {
    return !!(selectedAthleteId && startDate && endDate && blockDuration && routineTypes.length > 0 && blocks.length > 0);
  }, [selectedAthleteId, startDate, endDate, blockDuration, routineTypes, blocks.length]);

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
      case "4-day":
        return [1, 3, 5, 6]; // Mon, Wed, Fri, Sat
      case "3-day":
        return [1, 3, 5]; // Mon, Wed, Fri
      case "2-day":
        return [1, 4]; // Mon, Thu
      default:
        return [1, 3, 5, 6]; // Default to 4-day
    }
  };

  // Calculate which days should be hidden based on block training splits
  const calculatedDaysOff = useMemo(() => {
    const hiddenDays = new Set<number>();
    
    // Sunday is always hidden
    hiddenDays.add(0);
    
    // If we're viewing a specific block in days view, use that block's training split
    if (viewMode === "days" && blocks.length > 0 && blocks[selectedBlockIndex]) {
      const trainingSplit = blockTrainingSplits.get(selectedBlockIndex) || "4-day";
      const activeDays = getTrainingDays(trainingSplit);
      
      // Hide all days except the active training days
      for (let day = 1; day <= 6; day++) {
        if (!activeDays.includes(day)) {
          hiddenDays.add(day);
        }
      }
    }
    
    return hiddenDays;
  }, [viewMode, selectedBlockIndex, blocks, blockTrainingSplits]);

  // Calculate columns to display based on view mode
  const displayColumns = useMemo(() => {
    if (viewMode === "blocks") {
      return blocks.map((block, index) => {
        // Calculate total days in block
        const totalDays = Math.ceil((block.endDate.getTime() - block.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        // Count training days (excluding days off - Sunday by default is in daysOff)
        let trainingDays = 0;
        let currentDate = new Date(block.startDate);
        
        for (let i = 0; i < totalDays; i++) {
          const dayOfWeek = currentDate.getDay();
          // Count day if it's not in daysOff (Sunday = 0 is in daysOff by default)
          if (!daysOff.has(dayOfWeek)) {
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
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-5">
          {/* Left side: Title and Step Tabs */}
            <div className="flex items-center gap-4">
            <h1 className="text-sm font-medium text-foreground" data-testid="text-page-title">
              New program
            </h1>
            <span className="text-sm font-medium text-muted-foreground" data-testid="text-program-id">
              {programId}
            </span>
            
            {/* Step Tabs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium transition-colors",
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
                  "rounded-md px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2",
                  currentStep === 2
                    ? "bg-muted text-foreground"
                    : isStep1Complete
                    ? "text-foreground hover:bg-muted/50"
                    : "text-muted-foreground cursor-not-allowed opacity-50"
                )}
                data-testid="tab-step-2"
              >
                {!isStep1Complete && <Lock className="h-3.5 w-3.5" />}
                2. Builder
              </button>
              <button
                type="button"
                onClick={() => isStep1Complete && setCurrentStep(3)}
                disabled={!isStep1Complete}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2",
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
                onClick={() => setLocation("/")}
              data-testid="button-save-back"
              >
              Save & back
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
                disabled={createProgramMutation.isPending}
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
        <div className="sticky top-16 z-40 border-b bg-background">
          <div className="flex h-16 items-center justify-between px-5">
            {/* Left side: View Mode Tabs */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">View by</span>
              
              <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("blocks")}
                  className={cn(
                    "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                    viewMode === "blocks"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  data-testid="view-blocks"
                >
                  Blocks
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("weeks")}
                  className={cn(
                    "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                    viewMode === "weeks"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  data-testid="view-weeks"
                >
                  Weeks
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("days")}
                  className={cn(
                    "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                    viewMode === "days"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  data-testid="view-days"
                >
                  Days
                </button>
      </div>

              {/* Days View Navigation */}
              {viewMode === "days" && blocks.length > 0 && (
                <div className="flex items-center gap-2">
                  {/* Block Selector */}
                  <Select
                    value={selectedBlockIndex.toString()}
                    onValueChange={(value) => {
                      setSelectedBlockIndex(parseInt(value));
                      setSelectedWeekIndex(0);
                      setSelectedDayWeekIndex(0);
                    }}
                  >
                    <SelectTrigger className="w-[140px] h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {blocks.map((block, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {block.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Days view: Week navigation with arrows */}
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10 w-10 p-0"
                      onClick={() => setSelectedDayWeekIndex(Math.max(0, selectedDayWeekIndex - 1))}
                      disabled={selectedDayWeekIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center justify-center w-[140px] h-10 rounded-md border bg-background px-3 text-sm font-medium">
                      Week {selectedDayWeekIndex + 1}
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10 w-10 p-0"
                      onClick={() => {
                        const maxWeeks = blocks[selectedBlockIndex] 
                          ? Math.ceil(
                              differenceInWeeks(
                                blocks[selectedBlockIndex].endDate,
                                blocks[selectedBlockIndex].startDate
                              ) + 1
                            )
                          : 0;
                        setSelectedDayWeekIndex(Math.min(maxWeeks - 1, selectedDayWeekIndex + 1));
                      }}
                      disabled={
                        blocks[selectedBlockIndex] &&
                        selectedDayWeekIndex >= 
                          Math.ceil(
                            differenceInWeeks(
                              blocks[selectedBlockIndex].endDate,
                              blocks[selectedBlockIndex].startDate
                            )
                          )
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="px-5">
        <Form {...form}>
          <form id="program-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Step 1: General Settings */}
            {currentStep === 1 && (
              <div className="max-w-[560px] space-y-6 py-[20px]">
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
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={athleteComboboxOpen}
                              className="w-full justify-between"
                              data-testid="button-athlete-select"
                            >
                              {selectedAthlete
                                ? selectedAthlete.name
                                : "Select athlete..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
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
                    {selectedAthlete && (
                      <Badge 
                        variant="default" 
                        className="w-fit bg-green-600 hover:bg-green-600 mt-2"
                        data-testid="badge-athlete-cleared"
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Athlete cleared
                      </Badge>
                    )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="routineTypes"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Routine type</FormLabel>
                      <Popover open={routineTypesOpen} onOpenChange={setRoutineTypesOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={routineTypesOpen}
                              className={cn(
                                "w-full justify-between min-h-9 h-auto",
                                field.value.length === 0 && "text-muted-foreground"
                              )}
                              data-testid="button-routine-types-select"
                            >
                              <div className="flex flex-wrap gap-1">
                                {field.value.length > 0 ? (
                                  field.value.map((typeId) => {
                                    const option = routineTypeOptions.find(
                                      (o) => o.id === typeId
                                    );
                                    return (
                                      <Badge
                                        key={typeId}
                                        variant="secondary"
                                        className="mr-1"
                                        data-testid={`badge-selected-${typeId}`}
                                      >
                                        {option?.label}
                                        <button
                                          type="button"
                                          className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            field.onChange(
                                              field.value.filter((val) => val !== typeId)
                                            );
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              field.onChange(
                                                field.value.filter((val) => val !== typeId)
                                              );
                                            }
                                          }}
                                          aria-label={`Remove ${option?.label}`}
                                          data-testid={`button-remove-${typeId}`}
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </Badge>
                                    );
                                  })
                                ) : (
                                  <span>Select routine types...</span>
                                )}
                              </div>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder="Search routine types..."
                              data-testid="input-routine-search"
                            />
                            <CommandList>
                              <CommandEmpty>No routine type found.</CommandEmpty>
                              <CommandGroup>
                                {routineTypeOptions.map((option) => (
                                  <CommandItem
                                    key={option.id}
                                    value={option.label}
                                    onSelect={() => {
                                      const isSelected = field.value.includes(option.id);
                                      field.onChange(
                                        isSelected
                                          ? field.value.filter((val) => val !== option.id)
                                          : [...field.value, option.id]
                                      );
                                    }}
                                    data-testid={`option-routine-${option.id}`}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value.includes(option.id)
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {option.label}
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

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel>Program duration</FormLabel>
                    {weeksCount > 0 && (
                      <span
                        className="text-sm text-muted-foreground"
                        data-testid="text-weeks-count"
                      >
                        {weeksCount} {weeksCount === 1 ? "week" : "weeks"}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="button-start-date"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value
                                  ? format(field.value, "MMM dd, yyyy")
                                  : "Pick start date"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              data-testid="calendar-start-date"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="button-end-date"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value
                                  ? format(field.value, "MMM dd, yyyy")
                                  : "Pick end date"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
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
              </div>

              <FormField
                control={form.control}
                name="blockDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Block duration</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-block-duration">
                          <SelectValue placeholder="Select block duration..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {blockDurationOptions.map((weeks) => (
                          <SelectItem 
                            key={weeks} 
                            value={weeks.toString()} 
                            data-testid={`option-block-duration-${weeks}`}
                          >
                            {weeks} weeks
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {blocks.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Program blocks</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Block</TableHead>
                          <TableHead>Date range</TableHead>
                          <TableHead>Phase</TableHead>
                          <TableHead>Training split</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {blocks.map((block, index) => (
                          <TableRow key={index} data-testid={`block-row-${index + 1}`}>
                            <TableCell className="font-medium" data-testid={`block-name-${index + 1}`}>
                              {block.name}
                            </TableCell>
                            <TableCell data-testid={`block-dates-${index + 1}`}>
                              {format(block.startDate, "MM/dd/yy")} - {format(block.endDate, "MM/dd/yy")}
                            </TableCell>
                            <TableCell data-testid={`block-phase-${index + 1}`}>
                              <Select 
                                value={blockPhases.get(index) || "pre-season"}
                                onValueChange={(value) => {
                                  setBlockPhases(prev => {
                                    const newMap = new Map(prev);
                                    newMap.set(index, value);
                                    return newMap;
                                  });
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs font-normal border-0 shadow-none focus:ring-0 focus:ring-offset-0">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pre-season">Pre-Season</SelectItem>
                                  <SelectItem value="in-season">In-Season</SelectItem>
                                  <SelectItem value="off-season">Off-Season</SelectItem>
                                  <SelectItem value="playoff">Playoff</SelectItem>
                                  <SelectItem value="immediate-post-season">Immediate Post-Season</SelectItem>
                                  <SelectItem value="return-to-training">Return-to-Training</SelectItem>
                                  <SelectItem value="transition-phase">Transition Phase</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell data-testid={`block-training-split-${index + 1}`}>
                              <Select 
                                value={blockTrainingSplits.get(index) || "4-day"}
                                onValueChange={(value) => {
                                  setBlockTrainingSplits(prev => {
                                    const newMap = new Map(prev);
                                    newMap.set(index, value);
                                    return newMap;
                                  });
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs font-normal border-0 shadow-none focus:ring-0 focus:ring-offset-0">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="4-day">4-day split</SelectItem>
                                  <SelectItem value="3-day">3-day split</SelectItem>
                                  <SelectItem value="2-day">2-day split</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
              </div>
                            </div>
                          )}
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
                                <div className="flex items-center gap-2 text-sm font-medium">
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

                    {/* Throwing Section */}
                    {routineTypes.includes("throwing") && (
                    <div className="flex min-w-max px-0 relative">
                      {/* Category Label (Rotated) */}
                      <div className="flex flex-col items-center shrink-0 sticky left-0 z-20 bg-background">
                        <div className="flex items-center justify-center h-30 w-10 border-r bg-blue-500/10">
                          <div className="-rotate-90 whitespace-nowrap">
                            <p className="text-sm font-medium text-foreground">Throwing</p>
                            </div>
                        </div>
                      </div>

                      {/* Row Headers */}
                      <div className="flex flex-col shrink-0 w-32 sticky left-10 z-20 bg-background border-r">
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">xRole</p>
                        </div>
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Throwing Phase</p>
                        </div>
                        <div className="h-10 flex items-center px-3">
                          <p className="text-xs font-medium text-muted-foreground">Throwing Focus</p>
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
                          {/* xRole Dropdown */}
                          <div className={cn(
                            "h-10 flex items-center border-b relative",
                            isDayOff ? "bg-muted/20" : "bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                          )}>
                            {!isDayOff && (
                            <>
                              <Select 
                                value={getCellValue("throwing", "xRole", blockIndex, weekIndex, dayIndex) || "long-reliever"}
                                onValueChange={(value) => handleValueChange("throwing", "xRole", value, blockIndex, weekIndex, dayIndex, level)}
                              >
                                <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="long-reliever">Long Reliever</SelectItem>
                                  <SelectItem value="starter">Starter</SelectItem>
                                  <SelectItem value="closer">Closer</SelectItem>
                                  <SelectItem value="setup">Setup</SelectItem>
                                </SelectContent>
                              </Select>
                              {hasOverrides("throwing", "xRole", blockIndex, level) && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" 
                                     title="Customized at lower level" />
                              )}
                            </>
                            )}
                            </div>

                          {/* Throwing Phase Dropdown */}
                          <div className={cn(
                            "h-10 flex items-center border-b relative",
                            isDayOff ? "bg-muted/20" : "bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                          )}>
                            {!isDayOff && (
                            <>
                              <Select 
                                value={getCellValue("throwing", "throwingPhase", blockIndex, weekIndex, dayIndex) || "long-reliever"}
                                onValueChange={(value) => handleValueChange("throwing", "throwingPhase", value, blockIndex, weekIndex, dayIndex, level)}
                              >
                                <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="long-reliever">Long Reliever</SelectItem>
                                  <SelectItem value="build-up">Build-up</SelectItem>
                                  <SelectItem value="maintenance">Maintenance</SelectItem>
                                </SelectContent>
                              </Select>
                              {hasOverrides("throwing", "throwingPhase", blockIndex, level) && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" 
                                     title="Customized at lower level" />
                              )}
                            </>
                          )}
                        </div>

                          {/* Throwing Focus Dropdown */}
                          <div className={cn(
                            "h-10 flex items-center relative",
                            isDayOff ? "bg-muted/20" : "bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                          )}>
                            {!isDayOff && (
                            <>
                              <Select 
                                value={getCellValue("throwing", "throwingFocus", blockIndex, weekIndex, dayIndex) || "balanced"}
                                onValueChange={(value) => handleValueChange("throwing", "throwingFocus", value, blockIndex, weekIndex, dayIndex, level)}
                              >
                                <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="balanced">Balanced</SelectItem>
                                  <SelectItem value="velocity">Velocity</SelectItem>
                                  <SelectItem value="command">Command</SelectItem>
                                  <SelectItem value="durability">Durability</SelectItem>
                                </SelectContent>
                              </Select>
                              {hasOverrides("throwing", "throwingFocus", blockIndex, level) && (
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
                            <p className="text-sm font-medium text-foreground">Movement</p>
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
                                  <SelectItem value="strength">Strength</SelectItem>
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
                        <div className="flex items-center justify-center h-30 w-10 border-r bg-orange-500/10">
                          <div className="-rotate-90 whitespace-nowrap">
                            <p className="text-sm font-medium text-foreground">Lifting</p>
                          </div>
                        </div>
                      </div>

                      {/* Row Headers */}
                      <div className="flex flex-col shrink-0 w-32 sticky left-10 z-20 bg-background border-r">
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">R-focus</p>
                        </div>
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Focus (Upper)</p>
                        </div>
                        <div className="h-10 flex items-center px-3">
                          <p className="text-xs font-medium text-muted-foreground">Focus (Lower)</p>
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
                          {/* R-focus Dropdown */}
                          <div className={cn(
                            "h-10 flex items-center border-b relative",
                            isDayOff ? "bg-muted/20" : "bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
                          )}>
                            {!isDayOff && (
                            <>
                              <Select 
                                value={getCellValue("lifting", "rFocus", blockIndex, weekIndex, dayIndex) || "r1"}
                                onValueChange={(value) => handleValueChange("lifting", "rFocus", value, blockIndex, weekIndex, dayIndex, level)}
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
                              {hasOverrides("lifting", "rFocus", blockIndex, level) && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500" 
                                     title="Customized at lower level" />
                              )}
                            </>
                            )}
                          </div>

                          {/* Focus (Upper) Dropdown */}
                          <div className={cn(
                            "h-10 flex items-center border-b relative",
                            isDayOff ? "bg-muted/20" : "bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
                          )}>
                            {!isDayOff && (
                            <>
                              <Select 
                                value={getCellValue("lifting", "focusUpper", blockIndex, weekIndex, dayIndex) || "chest-back"}
                                onValueChange={(value) => handleValueChange("lifting", "focusUpper", value, blockIndex, weekIndex, dayIndex, level)}
                              >
                                <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="chest-back">Chest/Back</SelectItem>
                                  <SelectItem value="shoulders-arms">Shoulders/Arms</SelectItem>
                                  <SelectItem value="power-upper">Power Upper</SelectItem>
                                  <SelectItem value="hypertrophy-upper">Hypertrophy Upper</SelectItem>
                                </SelectContent>
                              </Select>
                              {hasOverrides("lifting", "focusUpper", blockIndex, level) && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500" 
                                     title="Customized at lower level" />
                              )}
                            </>
                            )}
                          </div>

                          {/* Focus (Lower) Dropdown */}
                          <div className={cn(
                            "h-10 flex items-center relative",
                            isDayOff ? "bg-muted/20" : "bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
                          )}>
                            {!isDayOff && (
                            <>
                              <Select 
                                value={getCellValue("lifting", "focusLower", blockIndex, weekIndex, dayIndex) || "squat-deadlift"}
                                onValueChange={(value) => handleValueChange("lifting", "focusLower", value, blockIndex, weekIndex, dayIndex, level)}
                              >
                                <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="squat-deadlift">Squat/Deadlift</SelectItem>
                                  <SelectItem value="legs-glutes">Legs/Glutes</SelectItem>
                                  <SelectItem value="power-lower">Power Lower</SelectItem>
                                  <SelectItem value="hypertrophy-lower">Hypertrophy Lower</SelectItem>
                                </SelectContent>
                              </Select>
                              {hasOverrides("lifting", "focusLower", blockIndex, level) && (
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

                    {/* Nutrition Section */}
                    {routineTypes.includes("nutrition") && (
                    <div className="flex min-w-max px-0 my-2 relative">
                      {/* Category Label (Rotated) */}
                      <div className="flex flex-col items-center shrink-0 sticky left-0 z-20 bg-background">
                        <div className="flex items-center justify-center h-40 w-10 border-r bg-green-500/10">
                          <div className="-rotate-90 whitespace-nowrap">
                            <p className="text-sm font-medium text-foreground">Nutrition</p>
                      </div>
                        </div>
                      </div>

                      {/* Row Headers */}
                      <div className="flex flex-col shrink-0 w-32 sticky left-10 z-20 bg-background border-r">
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Focus</p>
                        </div>
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Rate (Weekly)</p>
                        </div>
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Macros (High)</p>
                        </div>
                        <div className="h-10 flex items-center px-3">
                          <p className="text-xs font-medium text-muted-foreground">Macros (Rest)</p>
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
                        <div key={`nutrition-${columnIndex}`} className="flex flex-col shrink-0 w-[236px] border-l mx-1">
                          {/* Focus Dropdown */}
                          <div className={cn(
                            "h-10 flex items-center border-b relative",
                            isDayOff ? "bg-muted/20" : "bg-green-500/10 hover:bg-green-500/20 transition-colors"
                          )}>
                            {!isDayOff && (
                            <>
                              <Select 
                                value={getCellValue("nutrition", "focus", blockIndex, weekIndex, dayIndex) || "performance"}
                                onValueChange={(value) => handleValueChange("nutrition", "focus", value, blockIndex, weekIndex, dayIndex, level)}
                              >
                                <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="performance">Performance</SelectItem>
                                  <SelectItem value="recovery">Recovery</SelectItem>
                                  <SelectItem value="body-comp">Body Composition</SelectItem>
                                  <SelectItem value="health">Health</SelectItem>
                                </SelectContent>
                              </Select>
                              {hasOverrides("nutrition", "focus", blockIndex, level) && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-green-500" 
                                     title="Customized at lower level" />
                              )}
                            </>
                            )}
              </div>

                          {/* Rate (Weekly) Dropdown */}
                          <div className={cn(
                            "h-10 flex items-center border-b relative",
                            isDayOff ? "bg-muted/20" : "bg-green-500/10 hover:bg-green-500/20 transition-colors"
                          )}>
                            {!isDayOff && (
                            <>
                              <Select 
                                value={getCellValue("nutrition", "rate", blockIndex, weekIndex, dayIndex) || "moderate"}
                                onValueChange={(value) => handleValueChange("nutrition", "rate", value, blockIndex, weekIndex, dayIndex, level)}
                              >
                                <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="slow">Slow</SelectItem>
                                  <SelectItem value="moderate">Moderate</SelectItem>
                                  <SelectItem value="fast">Fast</SelectItem>
                                  <SelectItem value="aggressive">Aggressive</SelectItem>
                                </SelectContent>
                              </Select>
                              {hasOverrides("nutrition", "rate", blockIndex, level) && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-green-500" 
                                     title="Customized at lower level" />
                              )}
                            </>
                            )}
            </div>

                          {/* Macros (High) Dropdown */}
                          <div className={cn(
                            "h-10 flex items-center border-b relative",
                            isDayOff ? "bg-muted/20" : "bg-green-500/10 hover:bg-green-500/20 transition-colors"
                          )}>
                            {!isDayOff && (
                            <>
                              <Select 
                                value={getCellValue("nutrition", "macrosHigh", blockIndex, weekIndex, dayIndex) || "high-carb"}
                                onValueChange={(value) => handleValueChange("nutrition", "macrosHigh", value, blockIndex, weekIndex, dayIndex, level)}
                              >
                                <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="high-carb">High Carb</SelectItem>
                                  <SelectItem value="moderate-carb">Moderate Carb</SelectItem>
                                  <SelectItem value="low-carb">Low Carb</SelectItem>
                                  <SelectItem value="high-fat">High Fat</SelectItem>
                                </SelectContent>
                              </Select>
                              {hasOverrides("nutrition", "macrosHigh", blockIndex, level) && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-green-500" 
                                     title="Customized at lower level" />
                              )}
                            </>
                            )}
                          </div>

                          {/* Macros (Rest) Dropdown */}
                          <div className={cn(
                            "h-10 flex items-center relative",
                            isDayOff ? "bg-muted/20" : "bg-green-500/10 hover:bg-green-500/20 transition-colors"
                          )}>
                            {!isDayOff && (
                            <>
                              <Select 
                                value={getCellValue("nutrition", "macrosRest", blockIndex, weekIndex, dayIndex) || "low-carb"}
                                onValueChange={(value) => handleValueChange("nutrition", "macrosRest", value, blockIndex, weekIndex, dayIndex, level)}
                              >
                                <SelectTrigger className="border-0 shadow-none h-9 text-xs font-normal w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low-carb">Low Carb</SelectItem>
                                  <SelectItem value="moderate-carb">Moderate Carb</SelectItem>
                                  <SelectItem value="high-fat">High Fat</SelectItem>
                                  <SelectItem value="balanced">Balanced</SelectItem>
                                </SelectContent>
                              </Select>
                              {hasOverrides("nutrition", "macrosRest", blockIndex, level) && (
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
                    )}
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
                              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
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
                      <span className="text-sm font-medium min-w-[80px] text-center">
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
                                      <SelectItem value="Strength">Strength</SelectItem>
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
                          <TableCell colSpan={8} className="bg-orange-500/5 font-semibold text-sm py-3">
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
                                        <div className="text-xs text-muted-foreground text-center py-4">
                                          Empty
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
