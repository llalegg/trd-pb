import { useState } from "react";
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

interface LoggedResult {
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
  onSave: (result: LoggedResult) => void;
  onCancel: () => void;
  existingResult?: LoggedResult;
}

export default function EnterResultsBottomSheet({
  exerciseName,
  sets,
  reps,
  onSave,
  onCancel,
  existingResult,
}: EnterResultsBottomSheetProps) {
  const [currentReps, setCurrentReps] = useState(existingResult?.reps || "");
  const [currentWeight, setCurrentWeight] = useState(existingResult?.weight || "");
  const [currentTime, setCurrentTime] = useState(existingResult?.time || "");
  const [currentRPE, setCurrentRPE] = useState(existingResult?.rpe || "");
  const [currentNotes, setCurrentNotes] = useState(existingResult?.notes || "");

  const hasChanges =
    currentReps !== (existingResult?.reps || "") ||
    currentWeight !== (existingResult?.weight || "") ||
    currentTime !== (existingResult?.time || "") ||
    currentRPE !== (existingResult?.rpe || "") ||
    currentNotes !== (existingResult?.notes || "");

  const handleSave = () => {
    if (!hasChanges && !currentReps && !currentWeight && !currentTime && !currentRPE && !currentNotes) {
      onCancel(); // If no changes and no new data, just close
      return;
    }

    const result: LoggedResult = {
      reps: currentReps,
      ...(currentWeight && { weight: currentWeight }),
      ...(currentTime && { time: currentTime }),
      ...(currentRPE && { rpe: currentRPE }),
      ...(currentNotes && { notes: currentNotes }),
    };
    onSave(result);
  };

  return (
    <Sheet open={true} onOpenChange={onCancel}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="text-lg">Log results</SheetTitle>
          <SheetDescription>
            {exerciseName} • {sets} sets x {reps} reps
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label htmlFor="reps">Reps</Label>
                <Input
                  id="reps"
                  type="text"
                  placeholder="e.g., 10, 8, 6"
                  value={currentReps}
                  onChange={(e) => setCurrentReps(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="text"
                  placeholder="e.g., 135, 140"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="time">Time (seconds)</Label>
                <Input
                  id="time"
                  type="text"
                  placeholder="e.g., 60, 45"
                  value={currentTime}
                  onChange={(e) => setCurrentTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="rpe">RPE (Rate of Perceived Exertion)</Label>
                <Select value={currentRPE} onValueChange={setCurrentRPE}>
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
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes about this exercise..."
                  value={currentNotes}
                  onChange={(e) => setCurrentNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave}>
            Save results
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
