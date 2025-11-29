import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays, addWeeks, getDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { type Block, type AthleteWithPhase } from "@shared/schema";

interface CreateBlockModalProps {
  open: boolean;
  onClose: () => void;
  athleteId: string;
  phaseId: string;
  lastBlock?: Block;
}

const createBlockSchema = z.object({
  name: z.string().min(1, "Block name is required"),
  season: z.enum(["Pre-Season", "In-Season", "Off-Season"]),
  subSeason: z.enum(["Early", "Mid", "Late", "General Off-Season (GOS)"]).optional(),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  duration: z.number().min(1).max(4),
  copyFromLastBlock: z.boolean().default(false),
  useDefaultTemplate: z.boolean().default(false),
});

type CreateBlockFormData = z.infer<typeof createBlockSchema>;

const SEASON_OPTIONS = ["Pre-Season", "In-Season", "Off-Season"] as const;
const SUB_SEASON_OPTIONS = ["Early", "Mid", "Late", "General Off-Season (GOS)"] as const;
const DURATION_OPTIONS = [1, 2, 3, 4] as const;

const getSubSeasonOptions = (season: string): string[] => {
  if (season === "Off-Season") {
    return ["Early", "Mid", "Late", "General Off-Season (GOS)"];
  }
  return ["Early", "Mid", "Late"];
};

const getDayName = (date: Date): string => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[getDay(date)];
};

export default function CreateBlockModal({
  open,
  onClose,
  athleteId,
  phaseId,
  lastBlock,
}: CreateBlockModalProps) {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch athlete data to get name
  const { data: athletesData = [] } = useQuery<AthleteWithPhase[]>({
    queryKey: ["/api/athletes"],
  });
  const athlete = athletesData.find((a) => a.athlete.id === athleteId)?.athlete;

  // Calculate next block number
  const nextBlockNumber = lastBlock ? lastBlock.blockNumber + 1 : 1;

  // Calculate default start date (day after last block ends, or today)
  const defaultStartDate = lastBlock
    ? addDays(new Date(lastBlock.endDate), 1)
    : new Date();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateBlockFormData>({
    resolver: zodResolver(createBlockSchema),
    defaultValues: {
      name: "",
      season: "Pre-Season",
      subSeason: undefined,
      startDate: defaultStartDate,
      duration: 4,
      copyFromLastBlock: false,
      useDefaultTemplate: false,
    },
  });

  const season = watch("season");
  const startDate = watch("startDate");
  const duration = watch("duration");

  // Calculate end date
  const endDate = startDate && duration ? addWeeks(startDate, duration) : null;

  // Auto-generate block name when season or block number changes
  useEffect(() => {
    if (season) {
      const generatedName = `${season} Block ${nextBlockNumber}`;
      setValue("name", generatedName);
    }
  }, [season, nextBlockNumber, setValue]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      reset({
        name: "",
        season: "Pre-Season",
        subSeason: undefined,
        startDate: defaultStartDate,
        duration: 4,
        copyFromLastBlock: false,
        useDefaultTemplate: false,
      });
    }
  }, [open, defaultStartDate, reset]);

  const createBlock = async (data: CreateBlockFormData): Promise<Block> => {
    const blockData = {
      phaseId,
      blockNumber: nextBlockNumber,
      name: data.name,
      startDate: data.startDate.toISOString(),
      endDate: endDate!.toISOString(),
      duration: data.duration,
      season: data.season,
      subSeason: data.subSeason,
      status: "draft" as const,
    };

    const response = await fetch(
      `/api/athletes/${athleteId}/phases/${phaseId}/blocks`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blockData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create block");
    }

    return response.json();
  };

  const handleSaveAsDraft = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      await createBlock(data);
      // Close modal and refresh
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error creating block:", error);
      alert("Failed to create block. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleSaveAndConfigure = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      const createdBlock = await createBlock(data);
      // Close modal and navigate to template view
      onClose();
      setLocation(`/athletes/${athleteId}/blocks?view=template&block=${createdBlock.id}`);
    } catch (error) {
      console.error("Error creating block:", error);
      alert("Failed to create block. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  });

  const subSeasonOptions = getSubSeasonOptions(season);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-surface-base border-[#292928] text-[#f7f6f2] font-['Montserrat']">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Create Block {nextBlockNumber} for {athlete?.name || "Athlete"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Previous Block Info */}
          {lastBlock && (
            <div className="mb-6">
              <Label className="text-sm text-[#979795] mb-2 block">
                Previous Block (Block {lastBlock.blockNumber}):
              </Label>
              <div className="border border-[#292928] rounded-lg p-3 bg-[#171716]">
                <div className="flex items-center gap-2 flex-wrap text-sm text-[#979795]">
                  <span>
                    {lastBlock.season}
                    {lastBlock.subSeason && ` (${lastBlock.subSeason})`}
                  </span>
                  {lastBlock.lifting?.split && (
                    <>
                      <span>•</span>
                      <span>{lastBlock.lifting.split} split</span>
                    </>
                  )}
                  {lastBlock.lifting?.emphasis && (
                    <>
                      <span>•</span>
                      <span>{lastBlock.lifting.emphasis}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Block Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Name
              </Label>
              <Input
                id="name"
                {...register("name")}
                className="bg-[#171716] border-[#292928] text-[#f7f6f2] focus:border-[#f7f6f2]"
                placeholder="Block name"
              />
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Season and Sub-Season */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="season" className="text-sm font-semibold">
                  Season
                </Label>
                <Controller
                  name="season"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Clear sub-season when season changes
                        setValue("subSeason", undefined);
                      }}
                    >
                      <SelectTrigger className="bg-[#171716] border-[#292928]">
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEASON_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.season && (
                  <p className="text-xs text-red-400">{errors.season.message}</p>
                )}
              </div>

              {subSeasonOptions.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="subSeason" className="text-sm font-semibold">
                    Sub-season
                  </Label>
                  <Controller
                    name="subSeason"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="bg-[#171716] border-[#292928]">
                          <SelectValue placeholder="Select sub-season" />
                        </SelectTrigger>
                        <SelectContent>
                          {subSeasonOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Start Date and Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Start</Label>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-[#171716] border-[#292928] text-[#f7f6f2] hover:bg-[#1a1a19]",
                            !field.value && "text-[#979795]"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            <>
                              {format(field.value, "MMM d, yyyy")} ({getDayName(field.value)})
                            </>
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-surface-overlay border-[#292928]">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.startDate && (
                  <p className="text-xs text-red-400">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Duration</Label>
                <Controller
                  name="duration"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger className="bg-[#171716] border-[#292928]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DURATION_OPTIONS.map((weeks) => (
                          <SelectItem key={weeks} value={weeks.toString()}>
                            {weeks} week{weeks !== 1 ? "s" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.duration && (
                  <p className="text-xs text-red-400">
                    {errors.duration.message}
                  </p>
                )}
              </div>
            </div>

            {/* End Date Display */}
            {endDate && (
              <div className="text-sm text-[#979795]">
                End: {format(endDate, "MMM d, yyyy")} ({getDayName(endDate)})
              </div>
            )}

            {/* Template Options */}
            <div className="space-y-3 pt-2 border-t border-[#292928]">
              <Label className="text-sm font-semibold">Template Options</Label>
              <div className="space-y-2">
                {lastBlock && (
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="copyFromLastBlock"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="copyFromLastBlock"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label
                      htmlFor="copyFromLastBlock"
                      className="text-sm text-[#979795] cursor-pointer"
                    >
                      Copy template from Block {lastBlock.blockNumber}
                    </Label>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Controller
                    name="useDefaultTemplate"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="useDefaultTemplate"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label
                    htmlFor="useDefaultTemplate"
                    className="text-sm text-[#979795] cursor-pointer"
                  >
                    Use default {season} template
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#292928] text-[#979795] hover:text-[#f7f6f2] hover:bg-[#1a1a19]"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveAsDraft}
              className="bg-[#171716] text-[#f7f6f2] border-[#292928] hover:bg-[#1a1a19]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save as Draft"}
            </Button>
            <Button
              type="button"
              onClick={handleSaveAndConfigure}
              className="bg-[#e5e4e1] text-black hover:bg-[#d5d4d1]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save & Configure"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

