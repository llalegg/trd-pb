import React from "react";

interface AthleteHeaderProps {
  athleteId?: string;
}

export default function AthleteHeader({ athleteId }: AthleteHeaderProps) {
  return (
    <div className="w-full px-4 py-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
      <div>
        <h1 className="text-lg font-semibold text-white">Program Builder</h1>
        <p className="text-sm text-neutral-400">{athleteId ? `Athlete: ${athleteId}` : "Select an athlete"}</p>
      </div>
    </div>
  );
}


