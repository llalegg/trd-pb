import React from "react";

interface BlockViewProps {
  athleteId?: string;
}

// Horizontal template table (placeholder)
export default function BlockView({ athleteId }: BlockViewProps) {
  return (
    <div className="w-full rounded-lg border border-neutral-800 bg-neutral-900">
      <div className="px-3 py-2 border-b border-neutral-800 flex items-center justify-between">
        <h2 className="text-sm font-medium text-white">Block Templates</h2>
        <span className="text-xs text-neutral-400">{athleteId ? `Athlete: ${athleteId}` : ""}</span>
      </div>
      <div className="p-3 text-sm text-neutral-300">
        {/* Replace with real horizontal template table */}
        <div className="h-24 flex items-center justify-center text-neutral-500">
          Horizontal template table (placeholder)
        </div>
      </div>
    </div>
  );
}


