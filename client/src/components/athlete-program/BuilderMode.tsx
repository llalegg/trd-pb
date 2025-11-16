import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import BlockView from "./BlockView";
import WeekView from "./WeekView";

interface BuilderModeProps {
  view: "block" | "week";
  onViewChange: (view: "block" | "week") => void;
  athleteId?: string;
}

export default function BuilderMode({ view, onViewChange, athleteId }: BuilderModeProps) {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="pb-4">
        <ToggleGroup
          type="single"
          variant="segmented"
          value={view}
          onValueChange={(val) => {
            if (val) onViewChange(val as "block" | "week");
          }}
          className="bg-[#1a1a19] border border-[#292928]"
        >
          <ToggleGroupItem value="block" className="text-[#f7f6f2] data-[state=on]:bg-[#0f0f0e] data-[state=on]:text-[#f7f6f2]">
            Block View
          </ToggleGroupItem>
          <ToggleGroupItem value="week" className="text-[#f7f6f2] data-[state=on]:bg-[#0f0f0e] data-[state=on]:text-[#f7f6f2]">
            Week View
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {view === "block" && <BlockView athleteId={athleteId} />}
      {view === "week" && <WeekView athleteId={athleteId} />}
    </div>
  );
}


