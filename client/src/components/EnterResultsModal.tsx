import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SetResult {
  reps: string;
  weight?: string;
  time?: string;
  rpe?: string;
  notes?: string;
}

interface EnterResultsModalProps {
  exerciseName: string;
  sets: number;
  reps: string;
  onSave: (results: SetResult[]) => void;
  onCancel: () => void;
  existingResults?: SetResult[];
}

export default function EnterResultsModal({
  exerciseName,
  sets,
  reps,
  onSave,
  onCancel,
  existingResults
}: EnterResultsModalProps) {
  const initialRows: SetResult[] = useMemo(() => {
    if (existingResults && existingResults.length > 0) {
      const copy = [...existingResults];
      if (copy.length < sets) {
        const empty: SetResult = { reps: "" };
        return [...copy, ...Array.from({ length: sets - copy.length }, () => ({ ...empty }))];
      }
      return copy.slice(0, sets);
    }
    return Array.from({ length: sets }, () => ({ reps: "" }));
  }, [existingResults, sets]);

  const [setResults, setSetResults] = useState<SetResult[]>(initialRows);

  const updateSetField = (index: number, field: keyof SetResult, value: string) => {
    setSetResults(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSave = () => {
    const anyData = setResults.some(r => (r.reps && r.reps.trim()) || r.weight || r.time || r.rpe || r.notes);
    if (!anyData) {
      onCancel();
      return;
    }
    onSave(setResults);
  };

  const rpeOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Enter results</CardTitle>
              <CardDescription>{exerciseName}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Target: {sets} sets × {reps}
          </div>

          <div className="space-y-3">
            {setResults.map((row, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Set {idx + 1}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`reps-${idx}`}>Reps</Label>
                      <Input
                        id={`reps-${idx}`}
                        value={row.reps}
                        onChange={(e) => updateSetField(idx, "reps", e.target.value)}
                        placeholder="e.g., 10"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`weight-${idx}`}>Weight (lbs)</Label>
                      <Input
                        id={`weight-${idx}`}
                        value={row.weight || ""}
                        onChange={(e) => updateSetField(idx, "weight", e.target.value)}
                        placeholder="e.g., 135"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`time-${idx}`}>Time</Label>
                      <Input
                        id={`time-${idx}`}
                        value={row.time || ""}
                        onChange={(e) => updateSetField(idx, "time", e.target.value)}
                        placeholder="e.g., 1:30"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`rpe-${idx}`}>RPE</Label>
                      <Select
                        value={row.rpe || ""}
                        onValueChange={(value) => updateSetField(idx, "rpe", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {rpeOptions.map((rpe) => (
                            <SelectItem key={rpe} value={rpe.toString()}>
                              {rpe} - {rpe <= 3 ? "Very Easy" : rpe <= 5 ? "Easy" : rpe <= 7 ? "Moderate" : rpe <= 9 ? "Hard" : "Max Effort"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`notes-${idx}`}>Notes</Label>
                    <Textarea
                      id={`notes-${idx}`}
                      value={row.notes || ""}
                      onChange={(e) => updateSetField(idx, "notes", e.target.value)}
                      placeholder="How did it feel? Any adjustments needed?"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
            >
              Save Results
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}