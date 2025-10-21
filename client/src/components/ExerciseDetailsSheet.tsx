import { Dumbbell, Target, Zap, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ExerciseDetailsSheetProps {
  exercise: {
    id: string;
    name: string;
    sets: number;
    reps: string;
    weight?: string;
    description: string;
    instructions?: string[];
    formCues?: string[];
    equipment?: string[];
    commonMistakes?: string[];
    routineType?: string;
  };
  onClose: () => void;
}

const routineTypeIcons = {
  throwing: Target,
  movement: Zap,
  lifting: Dumbbell,
};


export default function ExerciseDetailsSheet({ exercise, onClose }: ExerciseDetailsSheetProps) {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [isSetupOpen, setIsSetupOpen] = useState(true);
  const [isHowToOpen, setIsHowToOpen] = useState(true);

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-auto max-h-[85vh]">
        <SheetHeader>
          <SheetTitle className="text-lg">{exercise.name}</SheetTitle>
          <SheetDescription>
            Exercise details and instructions
          </SheetDescription>
        </SheetHeader>

        <div className="overflow-y-auto py-6 space-y-4">
        {/* Video Section */}
        <div className="p-4">
          <div className="relative aspect-square w-full rounded-2xl bg-muted overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 bg-black/30 rounded-full flex items-center justify-center">
                <Play className="h-6 w-6 text-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-sm text-muted-foreground">
                Video demonstration would appear here
              </p>
            </div>
          </div>
        </div>

        {/* Equipment Section */}
        <div className="px-4 pb-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Equipment needed</h3>
          <div className="flex items-center gap-3 p-3 border border-border rounded-xl">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Resistance Band</p>
              <p className="text-xs text-muted-foreground">Light to Medium</p>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="px-4 pb-6">
          <Collapsible open={isDescriptionOpen} onOpenChange={setIsDescriptionOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full">
              <ChevronRight className={cn("h-4 w-4 transition-transform", isDescriptionOpen && "rotate-90")} />
              <span className="text-sm font-semibold text-foreground">Description</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {exercise.description}
              </p>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Set-up Instructions */}
        {exercise.instructions && exercise.instructions.length > 0 && (
          <div className="px-4 pb-6">
            <Collapsible open={isSetupOpen} onOpenChange={setIsSetupOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full">
                <ChevronRight className={cn("h-4 w-4 transition-transform", isSetupOpen && "rotate-90")} />
                <span className="text-sm font-semibold text-foreground">Set-up instructions</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <ol className="space-y-3 text-sm text-muted-foreground">
                  {exercise.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="font-medium text-primary flex-shrink-0">{index + 1}.</span>
                      <span className="leading-relaxed">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* How-to Section */}
        {exercise.formCues && exercise.formCues.length > 0 && (
          <div className="px-4 pb-6">
            <Collapsible open={isHowToOpen} onOpenChange={setIsHowToOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full">
                <ChevronRight className={cn("h-4 w-4 transition-transform", isHowToOpen && "rotate-90")} />
                <span className="text-sm font-semibold text-foreground">How-to</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {exercise.formCues.map((cue, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-primary flex-shrink-0">•</span>
                      <span className="leading-relaxed">{cue}</span>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Common Mistakes */}
        {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
          <div className="px-4 pb-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Common Mistakes</h3>
            <div className="space-y-2">
              {exercise.commonMistakes.map((mistake, index) => (
                <div key={index} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="text-destructive flex-shrink-0">⚠</span>
                  <span className="leading-relaxed">{mistake}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
