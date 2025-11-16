import React from "react";

interface WeekViewProps {
  athleteId?: string;
}

// Week grid with exercises (placeholder)
export default function WeekView({ athleteId }: WeekViewProps) {
  return (
    <div className="w-full rounded-lg border border-neutral-800 bg-neutral-900">
      <div className="px-3 py-2 border-b border-neutral-800 flex items-center justify-between">
        <h2 className="text-sm font-medium text-white">Week View</h2>
        <span className="text-xs text-neutral-400">{athleteId ? `Athlete: ${athleteId}` : ""}</span>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-md border border-neutral-800 bg-neutral-950 text-neutral-400 text-xs flex items-center justify-center"
            >
              Day {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


