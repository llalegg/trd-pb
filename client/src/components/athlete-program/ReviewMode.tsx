import React, { useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { AthleteWithPhase } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReviewModeProps {
  athleteId?: string;
}

function StatusBadge({ status }: { status: "active" | "complete" | "pending-signoff" | "draft" }) {
  const label =
    status === "active" ? "Active" :
    status === "complete" ? "Complete" :
    status === "pending-signoff" ? "Pending" : "Draft";
  const color =
    status === "active" ? "bg-green-500/20 text-green-400" :
    status === "complete" ? "bg-[#979795]/5 text-[#979795]" :
    status === "pending-signoff" ? "bg-amber-500/20 text-amber-400" :
    "bg-[#171716] text-[#979795]";
  return <span className={cn("text-xs px-2 py-0.5 rounded-full", color)}>{label}</span>;
}

export default function ReviewMode({ athleteId }: ReviewModeProps) {
  const [, setLocation] = useLocation();
  const { data: athletesData = [] } = useQuery<AthleteWithPhase[]>({
    queryKey: ["/api/athletes"],
  });
  const athlete = useMemo(
    () => athletesData.find(a => a.athlete.id === athleteId),
    [athletesData, athleteId]
  );
  const blocks = athlete?.blocks ?? [];
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-[#f7f6f2]">Program Timeline</h2>
        {athlete?.athlete?.name ? <span className="text-xs text-[#979795]">{athlete.athlete.name}</span> : null}
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-4">
          {blocks.map((b, idx) => (
            <button
              key={b.id}
              className="min-w-[300px] text-left bg-[#1a1a19] border border-[#292928] rounded-lg p-4 hover:bg-[#1f1f1e] transition-colors"
              onClick={() => setLocation(`/program-page?blockId=${b.id}`)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-[#979795]">Block {idx + 1}</div>
                  <div className="text-base font-medium text-[#f7f6f2]">{b.name}</div>
                </div>
                <StatusBadge status={b.status as any} />
              </div>
              <div className="text-xs text-[#979795] mt-1">
                {new Date(b.startDate).toLocaleDateString()} — {new Date(b.endDate).toLocaleDateString()}
              </div>
              {b.daysAvailable !== undefined && b.daysComplete !== undefined && (
                <div className="mt-3">
                  <div className="h-2 bg-[#292928] rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, Math.round((b.daysComplete / Math.max(1, b.daysAvailable)) * 100))}%` }}
                      className="h-full rounded-full bg-green-500"
                    />
                  </div>
                  <div className="mt-2 text-xs text-[#979795]">
                    {b.daysComplete}/{b.daysAvailable} days
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


