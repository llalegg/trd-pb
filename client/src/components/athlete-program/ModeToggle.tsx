import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Mode = "builder" | "review";

interface ModeToggleProps {
  value: Mode;
  onChange: (mode: Mode) => void;
}

export default function ModeToggle({ value, onChange }: ModeToggleProps) {
  return (
    <div className="px-4 py-4">
      <ToggleGroup
        type="single"
        variant="segmented"
        value={value}
        onValueChange={(val) => {
          if (val) onChange(val as Mode);
        }}
        className="bg-[#1a1a19] border border-[#292928]"
      >
        <ToggleGroupItem value="review" className="text-[#f7f6f2] data-[state=on]:bg-[#0f0f0e] data-[state=on]:text-[#f7f6f2]">
          Review
        </ToggleGroupItem>
        <ToggleGroupItem value="builder" className="text-[#f7f6f2] data-[state=on]:bg-[#0f0f0e] data-[state=on]:text-[#f7f6f2]">
          Builder
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}


