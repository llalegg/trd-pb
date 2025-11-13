import { Edit, Shuffle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExerciseCardProps {
  exercise: {
    id?: string;
    name: string;
    sets: number;
    reps: string | number;
    repScheme?: string;
    progression?: string;
    restTime?: string;
  };
  showRepSchemes?: boolean;
  onEdit?: () => void;
  onShuffle?: () => void;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

export function ExerciseCard({
  exercise,
  showRepSchemes = false,
  onEdit,
  onShuffle,
  onRemove,
  onClick,
  className,
}: ExerciseCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-lg border border-border bg-surface-overlay p-2 shadow-sm transition hover:border-muted-foreground/40 group cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold truncate">{exercise.name}</div>
          {showRepSchemes && (
            <>
              <div className="text-xs text-muted-foreground mt-0.5">
                {exercise.sets} x {exercise.reps}
                {exercise.restTime ? ` • Rest ${exercise.restTime}` : ""}
              </div>
              {(exercise.repScheme || exercise.progression) && (
                <div className="text-[10px] text-muted-foreground/80 mt-1 flex flex-col gap-0.5">
                  {exercise.repScheme && <span>Scheme: {exercise.repScheme}</span>}
                  {exercise.progression && <span>Progression: {exercise.progression}</span>}
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0.5 hover:bg-muted rounded"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
          {onShuffle && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0.5 hover:bg-muted rounded"
              onClick={(e) => {
                e.stopPropagation();
                onShuffle();
              }}
              title="Replace with alternate exercise"
            >
              <Shuffle className="h-3 w-3" />
            </Button>
          )}
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0.5 hover:bg-destructive/10 hover:text-destructive rounded"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

