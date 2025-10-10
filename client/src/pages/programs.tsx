import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Program, Athlete } from "@shared/schema";

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

const initialPrograms: Program[] = [
  {
    id: "1",
    athleteId: "1",
    athleteName: "Sarah Johnson",
    startDate: "2025-01-15",
    endDate: "2025-03-15",
  },
  {
    id: "2",
    athleteId: "2",
    athleteName: "Michael Chen",
    startDate: "2025-02-01",
    endDate: "2025-04-30",
  },
  {
    id: "3",
    athleteId: "3",
    athleteName: "Emma Rodriguez",
    startDate: "2025-01-20",
    endDate: "2025-03-20",
  },
  {
    id: "4",
    athleteId: "4",
    athleteName: "James Williams",
    startDate: "2025-02-15",
    endDate: "2025-05-15",
  },
];

const programFormSchema = z.object({
  athleteId: z.string().min(1, "Please select an athlete"),
  startDate: z.date({
    required_error: "Please select a start date",
  }),
  endDate: z.date({
    required_error: "Please select an end date",
  }),
});

type ProgramFormValues = z.infer<typeof programFormSchema>;

export default function Programs() {
  const [programs, setPrograms] = useState<Program[]>(initialPrograms);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [athleteComboboxOpen, setAthleteComboboxOpen] = useState(false);

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programFormSchema),
    defaultValues: {
      athleteId: "",
      startDate: undefined,
      endDate: undefined,
    },
  });

  const handleAddProgram = (values: ProgramFormValues) => {
    const athlete = mockAthletes.find((a) => a.id === values.athleteId);
    if (!athlete) return;

    const newProgram: Program = {
      id: Date.now().toString(),
      athleteId: values.athleteId,
      athleteName: athlete.name,
      startDate: format(values.startDate, "yyyy-MM-dd"),
      endDate: format(values.endDate, "yyyy-MM-dd"),
    };

    setPrograms([...programs, newProgram]);
    form.reset();
    setIsDialogOpen(false);
  };

  const selectedAthleteId = form.watch("athleteId");
  const selectedAthlete = mockAthletes.find((a) => a.id === selectedAthleteId);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
              Program Builder
            </h1>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="gap-2"
              data-testid="button-add-program"
            >
              <Plus className="h-4 w-4" />
              Add Program
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-12">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Athlete Name</TableHead>
                <TableHead className="w-[20%]">Start Date</TableHead>
                <TableHead className="w-[20%]">End Date</TableHead>
                <TableHead className="w-[20%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No programs found. Create your first program to get started.
                  </TableCell>
                </TableRow>
              ) : (
                programs.map((program, index) => (
                  <TableRow
                    key={program.id}
                    className={cn(
                      "group hover-elevate",
                      index % 2 === 1 && "bg-muted/30"
                    )}
                    data-testid={`row-program-${program.id}`}
                  >
                    <TableCell className="font-medium" data-testid={`text-athlete-${program.id}`}>
                      {program.athleteName}
                    </TableCell>
                    <TableCell data-testid={`text-start-date-${program.id}`}>
                      {format(new Date(program.startDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell data-testid={`text-end-date-${program.id}`}>
                      {format(new Date(program.endDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit program"
                          data-testid={`button-edit-${program.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground"
                          aria-label="Delete program"
                          data-testid={`button-delete-${program.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg" data-testid="dialog-add-program">
          <DialogHeader>
            <DialogTitle>Add New Program</DialogTitle>
            <DialogDescription>
              Create a new training program for an athlete. Select the athlete and set the program duration.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddProgram)} className="space-y-6 py-4">
              <FormField
                control={form.control}
                name="athleteId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Athlete</FormLabel>
                    <Popover open={athleteComboboxOpen} onOpenChange={setAthleteComboboxOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={athleteComboboxOpen}
                            className="w-full justify-between"
                            data-testid="button-athlete-select"
                          >
                            {selectedAthlete ? selectedAthlete.name : "Select athlete..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search athletes..." data-testid="input-athlete-search" />
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
                                      selectedAthleteId === athlete.id ? "opacity-100" : "opacity-0"
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

              <div className="space-y-4">
                <FormLabel>Program Duration</FormLabel>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-sm text-muted-foreground">Start Date</FormLabel>
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
                                {field.value ? format(field.value, "MMM dd, yyyy") : "Pick a date"}
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
                        <FormLabel className="text-sm text-muted-foreground">End Date</FormLabel>
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
                                {field.value ? format(field.value, "MMM dd, yyyy") : "Pick a date"}
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

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setIsDialogOpen(false);
                  }}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-submit">
                  Add Program
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
