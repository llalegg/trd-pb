import { useState } from "react";
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

interface LoggedResult {
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
  onSave: (result: LoggedResult) => void;
  onCancel: () => void;
  existingResult?: LoggedResult;
}

export default function EnterResultsModal({
  exerciseName,
  sets,
  reps,
  onSave,
  onCancel,
  existingResult
}: EnterResultsModalProps) {
  const [formData, setFormData] = useState<LoggedResult>({
    reps: existingResult?.reps || "",
    weight: existingResult?.weight || "",
    time: existingResult?.time || "",
    rpe: existingResult?.rpe || "",
    notes: existingResult?.notes || ""
  });

  const handleInputChange = (field: keyof LoggedResult, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Only save if at least one field has content
    if (formData.reps.trim() || formData.weight?.trim() || formData.time?.trim() || formData.notes?.trim()) {
      onSave(formData);
    } else {
      onCancel();
    }
  };

  const rpeOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Enter Results</CardTitle>
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

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="reps">Reps</Label>
                <Input
                  id="reps"
                  value={formData.reps}
                  onChange={(e) => handleInputChange("reps", e.target.value)}
                  placeholder="e.g., 10"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  value={formData.weight || ""}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  placeholder="e.g., 135"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  value={formData.time || ""}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  placeholder="e.g., 1:30"
                />
              </div>
              <div>
                <Label htmlFor="rpe">RPE</Label>
                <Select
                  value={formData.rpe || ""}
                  onValueChange={(value) => handleInputChange("rpe", value)}
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
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="How did it feel? Any adjustments needed?"
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
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