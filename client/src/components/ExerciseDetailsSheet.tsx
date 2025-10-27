import { Dumbbell, Target, Zap, ChevronRight, ChevronLeft, Forward } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

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

  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end"
      style={{ 
        zIndex: 9999, 
        position: 'fixed !important',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onClick={onClose}
    >
      <div 
        className="bg-[#0d0d0c] w-full rounded-t-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0d0d0c] border-b border-[#292928] rounded-t-xl">
          <div className="flex items-center justify-between h-12 px-4">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-[#f7f6f2] hover:bg-[#171716]">
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-semibold text-[#f7f6f2] font-['Montserrat']">{exercise.name}</h1>
            <Button variant="ghost" size="icon" className="text-[#f7f6f2] hover:bg-[#171716]">
              <Forward className="h-6 w-6" />
            </Button>
          </div>
        </div>

      {/* Content */}
      <div className="px-4 pt-2 pb-6 space-y-6">
        {/* Video Section */}
        <div className="relative w-full aspect-square rounded-2xl bg-[#171716] overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 bg-black/30 rounded-full flex items-center justify-center">
              <div className="h-6 w-6 text-white ml-1">▶</div>
            </div>
          </div>
        </div>

        {/* Equipment Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">Equipment needed</h3>
          
          <div className="space-y-2.5">
            {exercise.equipment?.map((item, index) => (
              <div key={index} className="flex items-center gap-3 px-0 py-2.5">
                <div className="w-12 h-12 bg-[#171716] border border-[#292928] rounded-xl flex items-center justify-center">
                  <Dumbbell className="h-6 w-6 text-[#979795]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#f7f6f2] font-['Montserrat']">{item}</p>
                  <p className="text-xs text-[#979795] font-['Montserrat']">Equipment</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-2">
          <Collapsible open={isDescriptionOpen} onOpenChange={setIsDescriptionOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full">
              <ChevronRight className={cn("h-5 w-5 transition-transform text-[#979795]", isDescriptionOpen && "rotate-90")} />
              <span className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">Description</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <p className="text-sm text-[#979795] leading-relaxed pl-7 font-['Montserrat']">
                {exercise.description}
              </p>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Set-up Instructions */}
        {exercise.instructions && exercise.instructions.length > 0 && (
          <div className="space-y-2">
            <Collapsible open={isSetupOpen} onOpenChange={setIsSetupOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full">
                <ChevronRight className={cn("h-5 w-5 transition-transform text-[#979795]", isSetupOpen && "rotate-90")} />
                <span className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">Set-up instructions</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <ol className="text-sm text-[#979795] space-y-3 pl-7 font-['Montserrat']">
                  {exercise.instructions.map((instruction, index) => (
                    <li key={index} className="leading-relaxed">
                      {instruction}
                    </li>
                  ))}
                </ol>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* How-to Section */}
        {exercise.formCues && exercise.formCues.length > 0 && (
          <div className="space-y-2">
            <Collapsible open={isHowToOpen} onOpenChange={setIsHowToOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full">
                <ChevronRight className={cn("h-5 w-5 transition-transform text-[#979795]", isHowToOpen && "rotate-90")} />
                <span className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">How-to</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <ul className="text-sm text-[#979795] space-y-3 pl-7 font-['Montserrat']">
                  {exercise.formCues.map((cue, index) => (
                    <li key={index} className="leading-relaxed">
                      {cue}
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </div>
      </div>
    </div>,
    document.body
  );
}
