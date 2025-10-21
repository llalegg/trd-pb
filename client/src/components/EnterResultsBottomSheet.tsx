import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface SetResult {
  reps: string;
  weight?: string;
  time?: string;
  rpe?: string;
  notes?: string;
}

interface EnterResultsBottomSheetProps {
  exerciseName: string;
  sets: number;
  reps: string;
  currentSetIndex: number;
  onSave: (setIndex: number, result: SetResult) => void;
  onCancel: () => void;
  existingResults?: SetResult[];
}

export default function EnterResultsBottomSheet({
  exerciseName,
  sets,
  reps,
  onSave,
  onCancel,
  existingResults,
  currentSetIndex,
}: EnterResultsBottomSheetProps) {
  const initialForSet: SetResult = useMemo(() => {
    const empty: SetResult = { reps: "" };
    if (existingResults && existingResults[currentSetIndex]) return existingResults[currentSetIndex];
    return empty;
  }, [existingResults, currentSetIndex]);

  const [row, setRow] = useState<SetResult>(initialForSet);

  const updateField = (field: keyof SetResult, value: string) => {
    setRow(prev => ({ ...prev, [field]: value }));
  };

  const hasData = useMemo(() => (row.reps && row.reps.trim()) || row.weight || row.time || row.rpe || row.notes, [row]);

  const handleSave = () => {
    if (!hasData) {
      onCancel();
      return;
    }
    onSave(currentSetIndex, row);
  };

  return (
    <Sheet open={true} onOpenChange={onCancel}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="text-lg">Log results</SheetTitle>
          <SheetDescription>
            {exerciseName} • Set {currentSetIndex + 1} of {sets} • Target {reps}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`reps`}>Reps</Label>
              <Input
                id={`reps`}
                type="text"
                placeholder="e.g., 10"
                value={row.reps}
                onChange={(e) => updateField("reps", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`weight`}>Weight (lbs)</Label>
              <Input
                id={`weight`}
                type="text"
                placeholder="e.g., 135"
                value={row.weight || ""}
                onChange={(e) => updateField("weight", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`time`}>Time (seconds)</Label>
              <Input
                id={`time`}
                type="text"
                placeholder="e.g., 60"
                value={row.time || ""}
                onChange={(e) => updateField("time", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`rpe`}>RPE</Label>
              <Select value={row.rpe || ""} onValueChange={(val) => updateField("rpe", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select RPE" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Very Light</SelectItem>
                  <SelectItem value="2">2 - Light</SelectItem>
                  <SelectItem value="3">3 - Moderate</SelectItem>
                  <SelectItem value="4">4 - Somewhat Hard</SelectItem>
                  <SelectItem value="5">5 - Hard</SelectItem>
                  <SelectItem value="6">6 - Very Hard</SelectItem>
                  <SelectItem value="7">7 - Extremely Hard</SelectItem>
                  <SelectItem value="8">8 - Max Effort</SelectItem>
                  <SelectItem value="9">9 - Max Effort (with spot)</SelectItem>
                  <SelectItem value="10">10 - Max Effort (no spot)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor={`notes`}>Notes</Label>
            <Textarea
              id={`notes`}
              placeholder="Notes for this set..."
              value={row.notes || ""}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t">
          <Button variant="outline" className="flex-1 h-14 text-lg font-medium" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="flex-1 h-14 text-lg font-medium" onClick={handleSave}>
            Save Results
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
