import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { CalendarIcon, X, Filter, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
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
import { format, differenceInWeeks, addWeeks, addDays } from "date-fns";
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
  const [viewMode, setViewMode] = useState<"blocks" | "weeks" | "day">("blocks");
  const [programId] = useState(() => generateProgramId());
  const { toast } = useToast();

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programFormSchema),
    defaultValues: {
      athleteId: "",
      blockDuration: 0,
      startDate: undefined,
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

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b bg-background">
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
                onClick={() => setCurrentStep(2)}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  currentStep === 2
                    ? "bg-muted text-foreground"
                    : "text-foreground hover:bg-muted/50"
                )}
                data-testid="tab-step-2"
              >
                2. Builder
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  currentStep === 3
                    ? "bg-muted text-foreground"
                    : "text-foreground hover:bg-muted/50"
                )}
                data-testid="tab-step-3"
              >
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
        <div className="border-b bg-background">
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
                  onClick={() => setViewMode("day")}
                  className={cn(
                    "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                    viewMode === "day"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  data-testid="view-day"
                >
                  Day
                </button>
        </div>
      </div>

            {/* Right side: Filters Button */}
            <Button variant="secondary" size="sm" data-testid="button-filters">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      )}

      <main className="px-5 py-8 lg:py-12">
        <Form {...form}>
          <form id="program-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Step 1: General Settings */}
            {currentStep === 1 && (
              <div className="max-w-[480px] space-y-6">
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
                      <FormLabel>Routine Type</FormLabel>
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
                    <FormLabel>Program Duration</FormLabel>
                    {weeksCount > 0 && (
                      <span
                        className="text-sm text-muted-foreground"
                        data-testid="text-weeks-count"
                      >
                        {weeksCount} {weeksCount === 1 ? "week" : "weeks"}
                      </span>
                    )}
                  </div>

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

              <FormField
                control={form.control}
                name="blockDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Block Duration</FormLabel>
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
                  <h3 className="text-sm font-medium">Program Blocks</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Block</TableHead>
                          <TableHead>Date Range</TableHead>
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
                    <h3 className="text-lg font-semibold mb-2">No Blocks Available</h3>
                    <p className="text-muted-foreground">
                      Please complete Step 1 to generate blocks first.
                    </p>
                        </div>
                ) : (
                  <div className="w-full px-0 py-5 bg-muted/20">
                    {/* Block Headers Row */}
                    <div className="flex min-w-max border-b">
                      {/* Empty space for category labels */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className="h-14 w-10 border-r" />
                      </div>

                      {/* Empty space for row headers */}
                      <div className="flex flex-col shrink-0 w-32">
                        <div className="h-14" />
                      </div>

                      {/* Block Column Headers */}
                      {blocks.map((block, blockIndex) => {
                        const blockWeeks = differenceInWeeks(block.endDate, block.startDate);
                        const blockDays = Math.ceil((block.endDate.getTime() - block.startDate.getTime()) / (1000 * 60 * 60 * 24));
                        
                        return (
                          <div key={`header-${blockIndex}`} className="flex flex-col shrink-0 w-[236px] border-l mx-1">
                            <div className="px-3 py-2 h-14 flex flex-col justify-center group hover:bg-muted/50 transition-colors cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                  <span className="text-foreground">{block.name}</span>
                                  <span className="text-muted-foreground">Pre-Season</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="flex items-center justify-between mt-0.5">
                                <p className="text-xs text-foreground">
                                  {format(block.startDate, "MM/dd/yyyy")} - {format(block.endDate, "MM/dd/yyyy")}
                                </p>
                                <div className="text-xs text-muted-foreground">
                                  {blockWeeks}w {blockDays}d
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Throwing Section */}
                    <div className="flex min-w-max px-0">
                      {/* Category Label (Rotated) */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className="flex items-center justify-center h-40 w-10 border-r">
                          <div className="-rotate-90 whitespace-nowrap">
                            <div className="bg-primary/10 px-3 py-2.5 rounded-md">
                              <p className="text-sm font-medium text-foreground">Throwing</p>
                      </div>
                          </div>
                        </div>
                      </div>

                      {/* Row Headers */}
                      <div className="flex flex-col shrink-0 w-32">
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Season</p>
                        </div>
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

                      {/* Block Columns */}
                      {blocks.map((block, blockIndex) => (
                        <div key={blockIndex} className="flex flex-col shrink-0 w-[236px] border-l mx-1">
                          {/* Season Dropdown */}
                          <div className="h-10 flex items-center border-b bg-primary/5 hover:bg-white/5 transition-colors">
                            <Select defaultValue="pre-season">
                              <SelectTrigger className="border-0 shadow-none h-9 text-sm font-medium w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pre-season">Pre-season</SelectItem>
                                <SelectItem value="in-season">In-season</SelectItem>
                                <SelectItem value="post-season">Post-season</SelectItem>
                                <SelectItem value="off-season">Off-season</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* xRole Dropdown */}
                          <div className="h-10 flex items-center border-b bg-primary/5 hover:bg-white/5 transition-colors">
                            <Select defaultValue="long-reliever">
                              <SelectTrigger className="border-0 shadow-none h-9 text-sm font-medium w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="long-reliever">Long Reliever</SelectItem>
                                <SelectItem value="starter">Starter</SelectItem>
                                <SelectItem value="closer">Closer</SelectItem>
                                <SelectItem value="setup">Setup</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Throwing Phase Dropdown */}
                          <div className="h-10 flex items-center border-b bg-primary/5 hover:bg-white/5 transition-colors">
                            <Select defaultValue="long-reliever">
                              <SelectTrigger className="border-0 shadow-none h-9 text-sm font-medium w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="long-reliever">Long Reliever</SelectItem>
                                <SelectItem value="build-up">Build-up</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Throwing Focus Dropdown */}
                          <div className="h-10 flex items-center bg-primary/5 hover:bg-white/5 transition-colors">
                            <Select defaultValue="balanced">
                              <SelectTrigger className="border-0 shadow-none h-9 text-sm font-medium w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="balanced">Balanced</SelectItem>
                                <SelectItem value="velocity">Velocity</SelectItem>
                                <SelectItem value="command">Command</SelectItem>
                                <SelectItem value="durability">Durability</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Movement Section */}
                    <div className="flex min-w-max px-0 my-2">
                      {/* Category Label (Rotated) */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className="flex items-center justify-center h-40 w-10 border-r">
                          <div className="-rotate-90 whitespace-nowrap">
                            <div className="bg-green-500/10 px-3 py-2.5 rounded-md">
                              <p className="text-sm font-medium text-foreground">Movement</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Row Headers */}
                      <div className="flex flex-col shrink-0 w-32">
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Movement Type</p>
                        </div>
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Intensity</p>
                        </div>
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Volume</p>
                        </div>
                        <div className="h-10 flex items-center px-3">
                          <p className="text-xs font-medium text-muted-foreground">Focus</p>
                        </div>
                      </div>

                      {/* Block Columns */}
                      {blocks.map((block, blockIndex) => (
                        <div key={`movement-${blockIndex}`} className="flex flex-col shrink-0 w-[236px] border-l mx-1">
                          {/* Movement Type Dropdown */}
                          <div className="h-10 flex items-center border-b bg-green-500/5 hover:bg-white/5 transition-colors">
                            <Select defaultValue="strength">
                              <SelectTrigger className="border-0 shadow-none h-9 text-sm font-medium w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="strength">Strength</SelectItem>
                                <SelectItem value="power">Power</SelectItem>
                                <SelectItem value="endurance">Endurance</SelectItem>
                                <SelectItem value="mobility">Mobility</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Intensity Dropdown */}
                          <div className="h-10 flex items-center border-b bg-green-500/5 hover:bg-white/5 transition-colors">
                            <Select defaultValue="moderate">
                              <SelectTrigger className="border-0 shadow-none h-9 text-sm font-medium w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="maximal">Maximal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Volume Dropdown */}
                          <div className="h-10 flex items-center border-b bg-green-500/5 hover:bg-white/5 transition-colors">
                            <Select defaultValue="standard">
                              <SelectTrigger className="border-0 shadow-none h-9 text-sm font-medium w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="peak">Peak</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Focus Dropdown */}
                          <div className="h-10 flex items-center bg-green-500/5 hover:bg-white/5 transition-colors">
                            <Select defaultValue="general">
                              <SelectTrigger className="border-0 shadow-none h-9 text-sm font-medium w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="sport-specific">Sport Specific</SelectItem>
                                <SelectItem value="injury-prevention">Injury Prevention</SelectItem>
                                <SelectItem value="performance">Performance</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Lifting Section */}
                    <div className="flex min-w-max px-0 my-2">
                      {/* Category Label (Rotated) */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className="flex items-center justify-center h-40 w-10 border-r">
                          <div className="-rotate-90 whitespace-nowrap">
                            <div className="bg-orange-500/10 px-3 py-2.5 rounded-md">
                              <p className="text-sm font-medium text-foreground">Lifting</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Row Headers */}
                      <div className="flex flex-col shrink-0 w-32">
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Lift Type</p>
                        </div>
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Load</p>
                        </div>
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Sets/Reps</p>
                        </div>
                        <div className="h-10 flex items-center px-3">
                          <p className="text-xs font-medium text-muted-foreground">Progression</p>
                        </div>
                      </div>

                      {/* Block Columns */}
                      {blocks.map((block, blockIndex) => (
                        <div key={`lifting-${blockIndex}`} className="flex flex-col shrink-0 w-[236px] border-l mx-1">
                          {/* Lift Type Dropdown */}
                          <div className="h-10 flex items-center border-b bg-orange-500/5 hover:bg-white/5 transition-colors">
                            <Select defaultValue="compound">
                              <SelectTrigger className="border-0 shadow-none h-9 text-sm font-medium w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="compound">Compound</SelectItem>
                                <SelectItem value="isolation">Isolation</SelectItem>
                                <SelectItem value="olympic">Olympic</SelectItem>
                                <SelectItem value="plyometric">Plyometric</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Load Dropdown */}
                          <div className="h-10 flex items-center border-b bg-orange-500/5 hover:bg-white/5 transition-colors">
                            <Select defaultValue="moderate">
                              <SelectTrigger className="border-0 shadow-none h-9 text-sm font-medium w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="heavy">Heavy</SelectItem>
                                <SelectItem value="maximal">Maximal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Sets/Reps Dropdown */}
                          <div className="h-10 flex items-center border-b bg-orange-500/5 hover:bg-white/5 transition-colors">
                            <Select defaultValue="3x8">
                              <SelectTrigger className="border-0 shadow-none h-9 text-sm font-medium w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="3x5">3x5</SelectItem>
                                <SelectItem value="3x8">3x8</SelectItem>
                                <SelectItem value="4x6">4x6</SelectItem>
                                <SelectItem value="5x5">5x5</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Progression Dropdown */}
                          <div className="h-10 flex items-center bg-orange-500/5 hover:bg-white/5 transition-colors">
                            <Select defaultValue="linear">
                              <SelectTrigger className="border-0 shadow-none h-9 text-sm font-medium w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="linear">Linear</SelectItem>
                                <SelectItem value="undulating">Undulating</SelectItem>
                                <SelectItem value="block">Block</SelectItem>
                                <SelectItem value="conjugate">Conjugate</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Nutrition Section */}
                    <div className="flex min-w-max px-0 my-2">
                      {/* Category Label (Rotated) */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className="flex items-center justify-center h-40 w-10 border-r">
                          <div className="-rotate-90 whitespace-nowrap">
                            <div className="bg-purple-500/10 px-3 py-2.5 rounded-md">
                              <p className="text-sm font-medium text-foreground">Nutrition</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Row Headers */}
                      <div className="flex flex-col shrink-0 w-32">
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Calorie Goal</p>
                        </div>
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Macro Split</p>
                        </div>
                        <div className="h-10 flex items-center px-3 border-b">
                          <p className="text-xs font-medium text-muted-foreground">Timing</p>
                        </div>
                        <div className="h-10 flex items-center px-3">
                          <p className="text-xs font-medium text-muted-foreground">Supplements</p>
                        </div>
                      </div>

                      {/* Block Columns */}
                      {blocks.map((block, blockIndex) => (
                        <div key={`nutrition-${blockIndex}`} className="flex flex-col shrink-0 w-[236px] border-l mx-1">
                          {/* Calorie Goal Dropdown */}
                          <div className="h-10 flex items-center border-b bg-purple-500/5 hover:bg-white/5 transition-colors">
                            <Select defaultValue="maintenance">
                              <SelectTrigger className="border-0 shadow-none h-9 text-sm font-medium w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="deficit">Deficit</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="surplus">Surplus</SelectItem>
                                <SelectItem value="cycling">Cycling</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Macro Split Dropdown */}
                          <div className="h-10 flex items-center border-b bg-purple-500/5 hover:bg-white/5 transition-colors">
                            <Select defaultValue="balanced">
                              <SelectTrigger className="border-0 shadow-none h-9 text-sm font-medium w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low-carb">Low Carb</SelectItem>
                                <SelectItem value="balanced">Balanced</SelectItem>
                                <SelectItem value="high-carb">High Carb</SelectItem>
                                <SelectItem value="keto">Keto</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Timing Dropdown */}
                          <div className="h-10 flex items-center border-b bg-purple-500/5 hover:bg-white/5 transition-colors">
                            <Select defaultValue="standard">
                              <SelectTrigger className="border-0 shadow-none h-9 text-sm font-medium w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="intermittent">Intermittent</SelectItem>
                                <SelectItem value="peri-workout">Peri-workout</SelectItem>
                                <SelectItem value="carb-cycling">Carb Cycling</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Supplements Dropdown */}
                          <div className="h-10 flex items-center bg-purple-500/5 hover:bg-white/5 transition-colors">
                            <Select defaultValue="basic">
                              <SelectTrigger className="border-0 shadow-none h-9 text-sm font-medium w-full focus:ring-0 focus:ring-offset-0 bg-transparent">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="basic">Basic</SelectItem>
                                <SelectItem value="performance">Performance</SelectItem>
                                <SelectItem value="recovery">Recovery</SelectItem>
                                <SelectItem value="comprehensive">Comprehensive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                        </div>
                      </div>
                    )}
              </div>
            )}

            {/* Step 3: Review & Publish */}
            {currentStep === 3 && (
              <div className="mx-auto">
                <div className="rounded-lg border-2 border-dashed border-border p-12 text-center">
                  <h3 className="text-lg font-semibold mb-2">Review & Publish</h3>
                  <p className="text-muted-foreground">
                    Review your program details and publish when ready.
                  </p>
            </div>
              </div>
            )}
          </form>
        </Form>
      </main>
    </div>
  );
}
