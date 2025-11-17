import React, { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { AthleteWithPhase, Block } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, parseISO, differenceInCalendarDays } from "date-fns";
import { getExercisesForDay, type Routine } from "@/lib/sessionData";
import { Progress } from "@/components/ui/progress";
import {
  CalendarDays,
  ClipboardCheck,
  TrendingUp,
  Activity,
  Target,
  AlertTriangle,
} from "lucide-react";

interface ReviewModeProps {
  athleteId?: string;
}

function StatusBadge({ status }: { status: "active" | "complete" | "pending-signoff" | "draft" }) {
  const label =
    status === "active" ? "Active" :
    status === "complete" ? "Complete" :
    status === "pending-signoff" ? "Pending" : "Draft";
  const color =
    status === "active" ? "bg-green-500/20 text-green-400" :
    status === "complete" ? "bg-[#979795]/5 text-[#979795]" :
    status === "pending-signoff" ? "bg-amber-500/20 text-amber-400" :
    "bg-[#171716] text-[#979795]";
  return <span className={cn("text-xs px-2 py-0.5 rounded-full", color)}>{label}</span>;
}

type RoutineCategory = "movement" | "throwing" | "lifting";

interface TimelineBlock {
  block: Block;
  blockNumber: number;
  completion: number | null;
  summary: string;
}

interface ScheduleEvent {
  id: string;
  date: Date;
  label: string;
  type: "block" | "deadline" | "assessment" | "rest" | "event" | "transition";
  blockName?: string;
}

interface EntryContext {
  source: string;
  dateLabel?: string;
  routineLabel?: string;
}

const routineLabels: Record<RoutineCategory, string> = {
  movement: "Movement",
  throwing: "Throwing",
  lifting: "Lifting",
};

const rpeOptions = Array.from({ length: 10 }, (_, idx) => (idx + 1).toString());

function getRoutineCategory(routine: Routine): RoutineCategory {
  if (routine.type === "throwing") return "throwing";
  if (routine.type === "movement") return "movement";
  return "lifting";
}

function describePerformance(block: Block, completion: number | null) {
  if (completion === null) {
    return "Awaiting submission data";
  }
  if (completion >= 95) return "Block trending ahead of targets";
  if (completion >= 80) return "On track with minor adjustments";
  if (completion >= 60) return "Needs follow-up to improve compliance";
  return "Critical follow-up required";
}

function getHeatColor(value: number) {
  if (value >= 90) return "bg-emerald-500/30 text-emerald-100";
  if (value >= 75) return "bg-amber-500/30 text-amber-100";
  return "bg-red-500/30 text-red-100";
}

export default function ReviewMode({ athleteId }: ReviewModeProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: athletesData = [] } = useQuery<AthleteWithPhase[]>({
    queryKey: ["/api/athletes"],
  });
  const athlete = useMemo(
    () => athletesData.find(a => a.athlete.id === athleteId),
    [athletesData, athleteId]
  );
  const blocks = athlete?.blocks ?? [];
  const [logFilter, setLogFilter] = useState<"all" | RoutineCategory>("all");
  const [signedOffBlocks, setSignedOffBlocks] = useState<Record<string, boolean>>({});
  const createEmptyEntryForm = () => ({
    setsCompleted: "",
    repsCompleted: "",
    weightUsed: "",
    rpe: "",
    notes: "",
  });
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryContext, setEntryContext] = useState<EntryContext | null>(null);
  const [entryForm, setEntryForm] = useState(createEmptyEntryForm());

  const timelineBlocks: TimelineBlock[] = useMemo(
    () =>
      blocks.map((block, index) => {
        const completion =
          block.daysAvailable && block.daysAvailable > 0 && block.daysComplete !== undefined
            ? Math.min(100, Math.round((block.daysComplete / block.daysAvailable) * 100))
            : null;
        return {
          block,
          blockNumber: index + 1,
          completion,
          summary: describePerformance(block, completion),
        };
      }),
    [blocks]
  );

  const progressTrendData = useMemo(
    () =>
      timelineBlocks.map(({ blockNumber, completion }) => ({
        label: `B${blockNumber}`,
        completion: completion ?? 70,
        compliance: Math.min(100, (completion ?? 70) + (blockNumber % 3) * 5),
      })),
    [timelineBlocks]
  );

  const volumeIntensityData = useMemo(() => {
    const weeks = Math.max(6, timelineBlocks.length * 2);
    return Array.from({ length: weeks }, (_, idx) => ({
      label: `W${idx + 1}`,
      volume: 8000 + idx * 450,
      intensity: 68 + (idx % 4) * 5,
    }));
  }, [timelineBlocks.length]);

  const velocityRpeData = useMemo(() => {
    const weeks = Math.max(8, timelineBlocks.length * 3);
    return Array.from({ length: weeks }, (_, idx) => ({
      week: `W${idx + 1}`,
      velocity: 88 + idx * 0.4,
      rpe: Math.min(9.5, 6 + (Math.sin(idx / 2) + 1.2)),
    }));
  }, [timelineBlocks.length]);

  const complianceHeatmap = useMemo(() => {
    const weekLabels = Array.from({ length: 6 }, (_, idx) => `W${idx + 1}`);
    const rows = (Object.keys(routineLabels) as RoutineCategory[]).map((key, rowIdx) => ({
      label: routineLabels[key],
      values: weekLabels.map((_, weekIdx) => {
        const base = 70 + rowIdx * 5;
        return Math.min(100, base + weekIdx * 4 - (weekIdx % 2 === 0 ? 3 : 0));
      }),
    }));
    return { weekLabels, rows };
  }, []);

  const scheduleEvents: ScheduleEvent[] = useMemo(() => {
    const events: ScheduleEvent[] = [];
    blocks.forEach((block, idx) => {
      const start = parseISO(block.startDate);
      const end = parseISO(block.endDate);
      events.push(
        {
          id: `${block.id}-start`,
          date: start,
          label: `${block.name} begins`,
          type: "block",
          blockName: block.name,
        },
        {
          id: `${block.id}-end`,
          date: end,
          label: `${block.name} wraps`,
          type: "block",
          blockName: block.name,
        },
        {
          id: `${block.id}-signoff`,
          date: addDays(end, 2),
          label: `Sign-off due (${block.name})`,
          type: "deadline",
          blockName: block.name,
        }
      );

      if (differenceInCalendarDays(end, start) > 6) {
        events.push({
          id: `${block.id}-assessment`,
          date: addDays(start, Math.floor(differenceInCalendarDays(end, start) / 2)),
          label: "Mid-block assessment",
          type: "assessment",
          blockName: block.name,
        });
      }

      if (idx > 0 && blocks[idx - 1].season !== block.season) {
        events.push({
          id: `${block.id}-transition`,
          date: start,
          label: `${blocks[idx - 1].season} → ${block.season}`,
          type: "transition",
          blockName: block.name,
        });
      }

      if (block.status === "complete") {
        events.push({
          id: `${block.id}-rest`,
          date: addDays(end, 1),
          label: "Recovery window",
          type: "rest",
          blockName: block.name,
        });
      }
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [blocks]);

  const calendarModifiers = useMemo(() => {
    const blockRanges = blocks.map(block => ({
      from: parseISO(block.startDate),
      to: parseISO(block.endDate),
    }));
    const byType = (type: ScheduleEvent["type"]) =>
      scheduleEvents.filter(event => event.type === type).map(event => event.date);

    return {
      blockRange: blockRanges,
      assessment: byType("assessment"),
      deadline: byType("deadline"),
      rest: byType("rest"),
      transition: byType("transition"),
    };
  }, [blocks, scheduleEvents]);

  const recentWorkoutLogs = useMemo(() => {
    const days = Array.from({ length: 8 }, (_, idx) => 22 - idx);
    const logs = days.flatMap(day => {
      const routines = getExercisesForDay(day);
      return routines.map(routine => {
        const routineCategory = getRoutineCategory(routine);
        const totalSets = routine.exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);
        const completedSets = routine.exercises.reduce((sum, ex) => sum + (ex.completedSets || 0), 0);
        const completion = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
        return {
          id: `${day}-${routine.type}-${routine.name}`,
          date: new Date(2024, 6, day),
          routineLabel: routineLabels[routineCategory],
          routineCategory,
          routineName: routine.name,
          missingData: completion < 100,
          completion,
        };
      });
    });
    return logs.slice(0, 10);
  }, []);

  const filteredLogs = useMemo(() => {
    if (logFilter === "all") return recentWorkoutLogs;
    return recentWorkoutLogs.filter(log => log.routineCategory === logFilter);
  }, [logFilter, recentWorkoutLogs]);

  const benchmarkItems = useMemo(
    () => [
      { label: "Week-over-week volume", value: "+6%", detail: "vs last week", icon: TrendingUp },
      { label: "Block progression", value: "+14%", detail: "vs prior block", icon: Target },
      { label: "Personal records", value: "3 PRs", detail: "in last 30 days", icon: Activity },
      { label: "Baseline delta", value: "+9%", detail: "strength vs baseline", icon: ClipboardCheck },
    ],
    []
  );

  const openEntryModal = (context: EntryContext) => {
    setEntryContext(context);
    setIsEntryModalOpen(true);
  };

  const closeEntryModal = () => {
    setIsEntryModalOpen(false);
    setEntryContext(null);
    setEntryForm(createEmptyEntryForm());
  };

  const handleEntrySubmit = () => {
    toast({
      title: "Workout results saved",
      description: `${entryContext?.source ?? "Manual entry"} recorded for ${entryContext?.dateLabel ?? "the selected session"}.`,
    });
    closeEntryModal();
  };

  const handleSignOff = (blockId: string) => {
    setSignedOffBlocks(prev => ({ ...prev, [blockId]: true }));
    toast({
      title: "Block signed off",
      description: "Sign-off recorded for staff review.",
    });
  };
  
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#979795] uppercase tracking-wide">Review tab</p>
          <h2 className="text-2xl font-semibold text-[#f7f6f2] mt-2">Performance oversight</h2>
        </div>
        {athlete?.athlete?.name ? (
          <div className="text-right">
            <p className="text-sm text-[#979795]">Active athlete</p>
            <p className="text-lg font-medium text-[#f7f6f2]">{athlete.athlete.name}</p>
          </div>
        ) : null}
      </div>

      <section>
      <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-[#f7f6f2]">Block timeline</h3>
            <p className="text-sm text-[#979795] mt-2">
              Monitor every block with status, readiness, and quick actions
            </p>
          </div>
          <span className="text-xs text-[#979795]">{blocks.length} blocks scheduled</span>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-4">
            {timelineBlocks.length === 0 ? (
              <div className="w-full rounded-lg border border-dashed border-[#2a2a28] bg-[#10100f] p-8 text-center text-sm text-[#979795]">
                No blocks scheduled yet. Add a block to unlock timeline analytics.
              </div>
            ) : (
              timelineBlocks.map(({ block, blockNumber, completion, summary }) => (
              <Card
                key={block.id}
                className="min-w-[320px] border border-[#292928] bg-[#10100f] hover:bg-[#171716] transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#979795]">Block {blockNumber}</p>
                      <CardTitle className="text-base mt-1 text-[#f7f6f2]">{block.name}</CardTitle>
                      <CardDescription className="text-xs text-[#c3c2bf] mt-2">
                        {format(parseISO(block.startDate), "MMM d")} — {format(parseISO(block.endDate), "MMM d")}
                      </CardDescription>
                    </div>
                    <div className="space-y-1 text-right">
                      <StatusBadge status={block.status as any} />
                      <p className="text-[11px] text-[#979795]">{[block.season, block.subSeason].filter(Boolean).join(" • ")}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {completion !== null ? (
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#979795] mb-2">
                        <span>Completion</span>
                        <span>{completion}%</span>
                      </div>
                      <Progress value={completion} className="h-2 bg-[#1f1f1e]" />
                    </div>
                  ) : (
                    <p className="text-xs text-[#979795]">Completion data pending</p>
                  )}
                  <p className="text-sm text-[#eae9e4]">{summary}</p>

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setLocation(`/program-page?blockId=${block.id}`)}>
                      View details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        openEntryModal({
                          source: `Block ${blockNumber} • ${block.name}`,
                          dateLabel: `${format(parseISO(block.startDate), "MMM d")} - ${format(parseISO(block.endDate), "MMM d")}`,
                          routineLabel: block.season,
                        })
                      }
                    >
                      Enter results
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={signedOffBlocks[block.id]}
                      onClick={() => handleSignOff(block.id)}
                    >
                      {signedOffBlocks[block.id] ? "Signed off" : "Sign off"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h3 className="text-base font-semibold text-[#f7f6f2]">Analytics</h3>
          <p className="text-sm text-[#979795] mt-2">
            Progress trends, benchmarks, and visualized performance signals
          </p>
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2 border border-[#292928] bg-[#10100f]">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base text-[#f7f6f2]">Progress trends</CardTitle>
                <CardDescription className="text-sm text-[#979795]">Completion vs compliance per block</CardDescription>
              </div>
              <div className="flex gap-6 text-sm text-[#c3c2bf]">
                <div>
                  <p className="text-xs uppercase text-[#979795]">Avg completion</p>
                  <p className="text-lg font-semibold text-[#f7f6f2]">
                    {progressTrendData.length
                      ? `${Math.round(progressTrendData.reduce((sum, item) => sum + item.completion, 0) / progressTrendData.length)}%`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-[#979795]">Compliance</p>
                  <p className="text-lg font-semibold text-[#f7f6f2]">
                    {progressTrendData.length
                      ? `${Math.round(progressTrendData.reduce((sum, item) => sum + item.compliance, 0) / progressTrendData.length)}%`
                      : "—"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                className="h-64"
                config={{
                  completion: { label: "Completion", color: "hsl(142, 70%, 45%)" },
                  compliance: { label: "Compliance", color: "hsl(45, 90%, 55%)" },
                }}
              >
                <LineChart data={progressTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1e" />
                  <XAxis dataKey="label" stroke="#72716c" />
                  <YAxis tickFormatter={value => `${value}%`} stroke="#72716c" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="completion" stroke="var(--color-completion)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="compliance" stroke="var(--color-compliance)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border border-[#292928] bg-[#10100f]">
            <CardHeader>
              <CardTitle className="text-base text-[#f7f6f2]">Performance benchmarks</CardTitle>
              <CardDescription className="text-sm text-[#979795]">
                Tracking baseline deltas, PRs, and block shifts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {benchmarkItems.map(item => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-[#1c1c1b] p-3">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-[#1f1f1e] p-2 text-emerald-300">
                      <item.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm text-[#f7f6f2]">{item.label}</p>
                      <p className="text-xs text-[#979795] mt-2">{item.detail}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-[#f7f6f2]">{item.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border border-[#292928] bg-[#10100f]">
            <CardHeader>
              <CardTitle className="text-base text-[#f7f6f2]">Volume vs intensity</CardTitle>
              <CardDescription className="text-sm text-[#979795]">
                Week-over-week workload distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                className="h-64"
                config={{
                  volume: { label: "Volume (lbs)", color: "hsl(217, 90%, 60%)" },
                  intensity: { label: "Intensity idx", color: "hsl(25, 85%, 60%)" },
                }}
              >
                <ComposedChart data={volumeIntensityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1e" />
                  <XAxis dataKey="label" stroke="#72716c" />
                  <YAxis yAxisId="left" stroke="#72716c" />
                  <YAxis yAxisId="right" orientation="right" stroke="#72716c" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="volume" fill="var(--color-volume)" radius={[4, 4, 0, 0]} yAxisId="left" />
                  <Line type="monotone" dataKey="intensity" stroke="var(--color-intensity)" strokeWidth={2} yAxisId="right" dot={false} />
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border border-[#292928] bg-[#10100f]">
            <CardHeader>
              <CardTitle className="text-base text-[#f7f6f2]">Throwing velocity & RPE</CardTitle>
              <CardDescription className="text-sm text-[#979795]">
                Overlay of weekly RPE trends vs velocity gains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                className="h-64"
                config={{
                  velocity: { label: "Velocity (mph)", color: "hsl(140, 65%, 55%)" },
                  rpe: { label: "RPE", color: "hsl(12, 80%, 60%)" },
                }}
              >
                <AreaChart data={velocityRpeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1e" />
                  <XAxis dataKey="week" stroke="#72716c" />
                  <YAxis stroke="#72716c" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="velocity" stroke="var(--color-velocity)" fill="var(--color-velocity)" fillOpacity={0.15} />
                  <Line type="monotone" dataKey="rpe" stroke="var(--color-rpe)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
              </div>

        <Card className="border border-[#292928] bg-[#10100f]">
          <CardHeader>
            <CardTitle className="text-base text-[#f7f6f2]">Compliance heatmap</CardTitle>
            <CardDescription className="text-sm text-[#979795]">
              Heatmap of workout completion by routine type
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[auto_repeat(6,minmax(0,1fr))] gap-2 text-xs">
              <span />
              {complianceHeatmap.weekLabels.map(week => (
                <span key={week} className="text-center text-[#979795]">
                  {week}
                </span>
              ))}
              {complianceHeatmap.rows.map(row => (
                <React.Fragment key={row.label}>
                  <span className="text-sm font-medium text-[#f7f6f2]">{row.label}</span>
                  {row.values.map((value, idx) => (
                    <div
                      key={`${row.label}-${idx}`}
                      className={cn(
                        "h-10 rounded-md text-[11px] flex items-center justify-center font-semibold",
                        getHeatColor(value)
                      )}
                    >
                      {value}%
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
            <p className="text-xs text-[#979795]">Line charts + heatmaps connect compliance rates with block performance.</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border border-[#292928] bg-[#10100f]">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base text-[#f7f6f2]">Schedule</CardTitle>
              <CardDescription className="text-sm text-[#979795] mt-2">
                Blocks, assessments, deadlines, and rest windows
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#979795]">
              <CalendarDays className="h-4 w-4" />
              {blocks.length ? `${format(parseISO(blocks[0].startDate), "MMM d")} - ${format(parseISO(blocks[blocks.length - 1].endDate), "MMM d")}` : "No schedule"}
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-[#292928] bg-[#0b0b0a]">
              <Calendar
                mode="single"
                selected={new Date()}
                defaultMonth={blocks[0] ? parseISO(blocks[0].startDate) : new Date()}
                numberOfMonths={1}
                modifiers={calendarModifiers}
                modifiersClassNames={{
                  blockRange: "bg-emerald-500/10 text-emerald-100 rounded-md",
                  assessment: "bg-sky-500/20 text-sky-100 rounded-full",
                  deadline: "bg-amber-500/30 text-amber-100 rounded-full",
                  rest: "bg-orange-500/20 text-orange-100 rounded-full",
                  transition: "bg-purple-500/20 text-purple-100 rounded-full",
                }}
              />
            </div>
            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
              {scheduleEvents.map(event => (
                <div key={event.id} className="flex justify-between gap-3 rounded-lg border border-[#1c1c1b] p-3">
                  <div>
                    <p className="text-sm font-medium text-[#f7f6f2]">{event.label}</p>
                    <p className="text-xs text-[#979795] mt-2">
                      {format(event.date, "EEE, MMM d")} {event.blockName ? `• ${event.blockName}` : ""}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("text-xs capitalize", {
                      "border-emerald-500/40 text-emerald-200": event.type === "block",
                      "border-amber-500/40 text-amber-200": event.type === "deadline",
                      "border-sky-500/40 text-sky-200": event.type === "assessment",
                      "border-orange-500/40 text-orange-200": event.type === "rest",
                      "border-purple-500/40 text-purple-200": event.type === "transition",
                    })}
                  >
                    {event.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#292928] bg-[#10100f]">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base text-[#f7f6f2]">Recent workout logs</CardTitle>
              <CardDescription className="text-sm text-[#979795] mt-2">
                Last 10 submissions with missing data flags
              </CardDescription>
            </div>
            <ToggleGroup
              type="single"
              value={logFilter}
              onValueChange={(value) => setLogFilter((value as typeof logFilter) || "all")}
              className="flex gap-2"
            >
              <ToggleGroupItem value="all" className="text-xs px-3">All</ToggleGroupItem>
              <ToggleGroupItem value="movement" className="text-xs px-3">Movement</ToggleGroupItem>
              <ToggleGroupItem value="throwing" className="text-xs px-3">Throwing</ToggleGroupItem>
              <ToggleGroupItem value="lifting" className="text-xs px-3">Lifting</ToggleGroupItem>
            </ToggleGroup>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredLogs.map(log => (
              <div key={log.id} className="rounded-lg border border-[#1c1c1b] bg-[#0f0f0e] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#f7f6f2]">{log.routineName}</p>
                    <p className="text-xs text-[#979795] mt-2">
                      {format(log.date, "EEE, MMM d")} • {log.routineLabel}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#f7f6f2]">{log.completion}%</p>
                    <p className="text-xs text-[#979795]">complete</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs text-[#c3c2bf] border-[#292928]">
                    {log.routineLabel}
                  </Badge>
                  {log.missingData && (
                    <Badge className="bg-amber-500/25 text-amber-100 text-xs flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Missing data
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto"
                    onClick={() =>
                      openEntryModal({
                        source: log.routineName,
                        dateLabel: format(log.date, "MMM d"),
                        routineLabel: log.routineLabel,
                      })
                    }
                  >
                    Enter results
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border border-[#292928] bg-[#10100f]">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base text-[#f7f6f2]">Data entry</CardTitle>
              <CardDescription className="text-sm text-[#979795] mt-2">
                Launch the data-entry modal to push sets/reps, weight, RPE, notes
              </CardDescription>
            </div>
            <Button onClick={() => openEntryModal({ source: "Manual entry" })}>
              Enter workout results
            </Button>
          </CardHeader>
        </Card>
      </section>

      <Dialog
        open={isEntryModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeEntryModal();
          } else {
            setIsEntryModalOpen(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Enter workout results</DialogTitle>
            <DialogDescription>
              {entryContext?.source ? `${entryContext.source}${entryContext.dateLabel ? ` • ${entryContext.dateLabel}` : ""}` : "Log the latest submission"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="sets">Sets completed</Label>
                <Input
                  id="sets"
                  value={entryForm.setsCompleted}
                  onChange={(event) => setEntryForm(prev => ({ ...prev, setsCompleted: event.target.value }))}
                  placeholder="e.g., 4"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="reps">Reps completed</Label>
                <Input
                  id="reps"
                  value={entryForm.repsCompleted}
                  onChange={(event) => setEntryForm(prev => ({ ...prev, repsCompleted: event.target.value }))}
                  placeholder="e.g., 10"
                  className="mt-2"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="weight">Weights used (lbs)</Label>
                <Input
                  id="weight"
                  value={entryForm.weightUsed}
                  onChange={(event) => setEntryForm(prev => ({ ...prev, weightUsed: event.target.value }))}
                  placeholder="e.g., 185"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>RPE</Label>
                <Select
                  value={entryForm.rpe}
                  onValueChange={(value) => setEntryForm(prev => ({ ...prev, rpe: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select RPE" />
                  </SelectTrigger>
                  <SelectContent>
                    {rpeOptions.map(value => (
                      <SelectItem key={value} value={value}>
                        RPE {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes / comments</Label>
              <Textarea
                id="notes"
                value={entryForm.notes}
                onChange={(event) => setEntryForm(prev => ({ ...prev, notes: event.target.value }))}
                placeholder="How did it feel? What needs attention next?"
                rows={4}
                className="mt-2"
              />
        </div>
      </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEntryModal}>
              Cancel
            </Button>
            <Button onClick={handleEntrySubmit}>Save results</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
