import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, CalendarIcon, X } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format, differenceInWeeks } from "date-fns";
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

const programFormSchema = z.object({
  athleteId: z.string().min(1, "Please select an athlete"),
  startDate: z.date({
    required_error: "Please select a start date",
  }),
  endDate: z.date({
    required_error: "Please select an end date",
  }),
  routineTypes: z.array(z.string()).min(1, "Please select at least one routine type"),
});

type ProgramFormValues = z.infer<typeof programFormSchema>;

export default function AddProgram() {
  const [, setLocation] = useLocation();
  const [athleteComboboxOpen, setAthleteComboboxOpen] = useState(false);
  const [routineTypesOpen, setRoutineTypesOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programFormSchema),
    defaultValues: {
      athleteId: "",
      startDate: undefined,
      endDate: undefined,
      routineTypes: ["movement", "throwing", "lifting", "nutrition"],
    },
  });

  const createProgramMutation = useMutation({
    mutationFn: async (data: { 
      athleteId: string;
      athleteName: string;
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
      startDate: format(values.startDate, "yyyy-MM-dd"),
      endDate: format(values.endDate, "yyyy-MM-dd"),
      routineTypes: values.routineTypes,
    });
  };

  const selectedAthleteId = form.watch("athleteId");
  const selectedAthlete = mockAthletes.find((a) => a.id === selectedAthleteId);
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const routineTypes = form.watch("routineTypes");

  const weeksCount =
    startDate && endDate ? differenceInWeeks(endDate, startDate) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/")}
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <h1
                className="text-2xl font-semibold text-foreground"
                data-testid="text-page-title"
              >
                Add New Program
              </h1>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/")}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="program-form"
                disabled={createProgramMutation.isPending}
                data-testid="button-submit"
              >
                {createProgramMutation.isPending ? "Creating..." : "Create Program"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-12">
        <Form {...form}>
          <form id="program-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
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
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Date Range Calendar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Calendar
                      mode="range"
                      selected={
                        startDate && endDate
                          ? { from: startDate, to: endDate }
                          : startDate
                          ? { from: startDate, to: startDate }
                          : undefined
                      }
                      onSelect={(range) => {
                        if (range?.from) {
                          form.setValue("startDate", range.from);
                        }
                        if (range?.to) {
                          form.setValue("endDate", range.to);
                        } else if (range?.from && !range?.to) {
                          form.setValue("endDate", range.from);
                        }
                      }}
                      className="rounded-md border"
                      data-testid="calendar-main"
                    />

                    {(startDate || endDate) && (
                      <div className="space-y-2 rounded-md border p-4">
                        <h3 className="font-medium text-sm">Selected Range</h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {startDate && (
                            <div data-testid="text-selected-start">
                              Start: {format(startDate, "MMM dd, yyyy")}
                            </div>
                          )}
                          {endDate && (
                            <div data-testid="text-selected-end">
                              End: {format(endDate, "MMM dd, yyyy")}
                            </div>
                          )}
                          {startDate && endDate && weeksCount > 0 && (
                            <div
                              className="pt-2 font-medium text-foreground"
                              data-testid="text-selected-weeks"
                            >
                              Duration: {weeksCount}{" "}
                              {weeksCount === 1 ? "week" : "weeks"}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {routineTypes.length > 0 && (
                      <div className="space-y-2 rounded-md border p-4">
                        <h3 className="font-medium text-sm">Routine Types</h3>
                        <div className="flex flex-wrap gap-2">
                          {routineTypes.map((type) => {
                            const option = routineTypeOptions.find(
                              (o) => o.id === type
                            );
                            return (
                              <div
                                key={type}
                                className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium"
                                data-testid={`badge-routine-${type}`}
                              >
                                {option?.label}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
