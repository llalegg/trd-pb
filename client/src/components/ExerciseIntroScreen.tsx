import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Equipment {
  name: string;
  type: string;
  description?: string;
  specifications?: string[];
}

interface ExerciseIntroScreenProps {
  exercise: {
    id: string;
    name: string;
    description: string;
    instructions?: string[];
    formCues?: string[];
    equipment?: string[];
    routineType?: string;
    reps?: string;
    sets?: number;
    weight?: string;
    restTime?: string;
  };
  equipmentData?: Equipment[];
  onStart: () => void;
  onClose: () => void;
  onEquipmentClick: (equipment: Equipment) => void;
}

export default function ExerciseIntroScreen({ 
  exercise, 
  equipmentData = [], 
  onStart, 
  onClose,
  onEquipmentClick 
}: ExerciseIntroScreenProps) {
  const getEquipmentDetails = (equipmentName: string): Equipment | null => {
    return equipmentData.find(eq => eq.name === equipmentName) || null;
  };

  return (
    <div className="bg-neutral-950 min-h-screen w-full flex flex-col relative">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-center h-12 px-4 shrink-0">
        <button 
          onClick={onClose}
          className="flex items-center justify-center w-12 h-12 shrink-0 rounded-full hover:bg-muted/50 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <div className="flex-1" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-4 py-2 space-y-6">
          {/* Title Section */}
          <div className="space-y-1">
            <p className="text-sm text-[#979795] font-semibold">Prepare for exercise</p>
            <h1 className="text-lg font-semibold text-foreground">{exercise.name}</h1>
          </div>

          {/* Assigned Section */}
          {(exercise.reps || exercise.sets || exercise.weight || exercise.restTime) && (
            <div className="space-y-2.5">
              <h3 className="text-sm font-semibold text-foreground">Assigned</h3>
              <div className="flex gap-4">
                {(exercise.reps && exercise.sets) && (
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm text-[#979795] font-medium">Reps x Sets</p>
                    <p className="text-xl text-white font-medium">{exercise.reps} x {exercise.sets}</p>
                  </div>
                )}
                {exercise.weight && (
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm text-[#979795] font-medium">Weight</p>
                    <p className="text-xl text-white font-medium">{exercise.weight}</p>
                  </div>
                )}
                {exercise.restTime && (
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm text-[#979795] font-medium">Rest after</p>
                    <p className="text-xl text-white font-medium">{exercise.restTime}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Equipment Section */}
          {exercise.equipment && exercise.equipment.length > 0 && (
            <div className="space-y-0">
              <h3 className="text-sm font-semibold text-foreground mb-0">Equipment needed</h3>
              <div className="space-y-0">
                {exercise.equipment.map((equipmentName, index) => {
                  const equipmentDetails = getEquipmentDetails(equipmentName);
                  const hasDetails = equipmentDetails !== null;
                  
                  return (
                    <div 
                      key={index}
                      className={cn(
                        "flex items-center gap-3 py-2.5",
                        hasDetails && "cursor-pointer"
                      )}
                      onClick={() => hasDetails && onEquipmentClick(equipmentDetails)}
                    >
                      {/* Equipment Image */}
                      <div className="w-12 h-12 bg-muted rounded-xl border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <div className="w-full h-full bg-muted-foreground/10" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{equipmentName}</p>
                        {equipmentDetails?.type && (
                          <p className="text-xs text-[#979795] mt-1">{equipmentDetails.type}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Description</h3>
            <p className="text-sm text-[#979795] leading-relaxed">
              {exercise.description}
            </p>
          </div>

          {/* Set-up Instructions */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Set-up instructions</h3>
              <ol className="space-y-3 text-sm text-[#979795] list-decimal pl-5">
                {exercise.instructions.map((instruction, index) => (
                  <li key={index} className="leading-relaxed">
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* How-to Section */}
          {exercise.formCues && exercise.formCues.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">How-to</h3>
              <ul className="space-y-3 text-sm text-[#979795] list-disc pl-5">
                {exercise.formCues.map((cue, index) => (
                  <li key={index} className="leading-relaxed">
                    {cue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Action Button */}
      <div className="absolute bottom-0 left-0 right-0 bg-neutral-950 p-4">
        <Button 
          className="w-full h-12 text-sm font-semibold"
          onClick={onStart}
        >
          Start
        </Button>
      </div>
    </div>
  );
}

