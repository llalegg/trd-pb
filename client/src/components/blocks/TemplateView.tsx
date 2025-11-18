import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import type { Block } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TemplateViewProps {
  athleteId: string;
  phaseId: string;
  selectedBlockId?: string;
}

export default function TemplateView({ athleteId, phaseId, selectedBlockId }: TemplateViewProps) {
  const [, setLocation] = useLocation();
  const [currentBlockId, setCurrentBlockId] = useState<string | undefined>(selectedBlockId);

  // Hardcoded blocks data (to avoid API calls)
  const hardcodedBlocks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysAgo = (days: number) => {
      const date = new Date(today);
      date.setDate(date.getDate() - days);
      return date.toISOString().split('T')[0];
    };
    const daysFromNow = (days: number) => {
      const date = new Date(today);
      date.setDate(date.getDate() + days);
      return date.toISOString().split('T')[0];
    };

    // Return blocks based on athleteId and phaseId
    const blocksMap: Record<string, Record<string, Block[]>> = {
      "athlete-1": {
        "phase-athlete-1": [
          {
            id: "block-1-1",
            athleteId: "athlete-1",
            phaseId: "phase-athlete-1",
            blockNumber: 1,
            name: "Pre-Season Block 1",
            startDate: daysAgo(60),
            endDate: daysAgo(32),
            duration: 4,
            season: "Pre-Season",
            subSeason: "Early",
            status: "complete",
            createdAt: daysAgo(65),
            updatedAt: daysAgo(32),
          },
          {
            id: "block-1-2",
            athleteId: "athlete-1",
            phaseId: "phase-athlete-1",
            blockNumber: 2,
            name: "Pre-Season Block 2",
            startDate: daysAgo(32),
            endDate: daysFromNow(2),
            duration: 5,
            season: "Pre-Season",
            subSeason: "Mid",
            status: "active",
            createdAt: daysAgo(35),
            updatedAt: daysAgo(1),
          },
        ],
      },
      "athlete-2": {
        "phase-athlete-2": [
          {
            id: "block-2-1",
            athleteId: "athlete-2",
            phaseId: "phase-athlete-2",
            blockNumber: 1,
            name: "In-Season Block 1",
            startDate: daysAgo(90),
            endDate: daysAgo(62),
            duration: 4,
            season: "In-Season",
            subSeason: "Early",
            status: "complete",
            createdAt: daysAgo(95),
            updatedAt: daysAgo(62),
          },
          {
            id: "block-2-2",
            athleteId: "athlete-2",
            phaseId: "phase-athlete-2",
            blockNumber: 2,
            name: "In-Season Block 2",
            startDate: daysAgo(62),
            endDate: daysFromNow(2),
            duration: 9,
            season: "In-Season",
            subSeason: "Mid",
            status: "active",
            createdAt: daysAgo(65),
            updatedAt: daysAgo(1),
          },
        ],
      },
      "athlete-3": {
        "phase-athlete-3": [
          {
            id: "block-3-1",
            athleteId: "athlete-3",
            phaseId: "phase-athlete-3",
            blockNumber: 1,
            name: "Off-Season Block 1",
            startDate: daysAgo(45),
            endDate: daysFromNow(5),
            duration: 7,
            season: "Off-Season",
            subSeason: "Late",
            status: "active",
            createdAt: daysAgo(48),
            updatedAt: daysAgo(1),
          },
        ],
      },
      "athlete-4": {
        "phase-athlete-4": [
          {
            id: "block-4-1",
            athleteId: "athlete-4",
            phaseId: "phase-athlete-4",
            blockNumber: 1,
            name: "Pre-Season Block 1",
            startDate: daysAgo(120),
            endDate: daysAgo(92),
            duration: 4,
            season: "Pre-Season",
            subSeason: "Early",
            status: "complete",
            createdAt: daysAgo(125),
            updatedAt: daysAgo(92),
          },
          {
            id: "block-4-2",
            athleteId: "athlete-4",
            phaseId: "phase-athlete-4",
            blockNumber: 2,
            name: "Pre-Season Block 2",
            startDate: daysAgo(62),
            endDate: daysFromNow(36),
            duration: 14,
            season: "Pre-Season",
            subSeason: "Mid",
            status: "active",
            createdAt: daysAgo(65),
            updatedAt: daysAgo(1),
          },
        ],
      },
      "athlete-5": {
        "phase-athlete-5": [
          {
            id: "block-5-1",
            athleteId: "athlete-5",
            phaseId: "phase-athlete-5",
            blockNumber: 1,
            name: "In-Season Block 1",
            startDate: daysAgo(30),
            endDate: daysFromNow(0),
            duration: 4,
            season: "In-Season",
            subSeason: "Early",
            status: "active",
            createdAt: daysAgo(35),
            updatedAt: daysAgo(1),
          },
        ],
      },
    };

    return blocksMap[athleteId]?.[phaseId] || [];
  }, [athleteId, phaseId]);

  // Use hardcoded blocks instead of API
  const blocks = hardcodedBlocks;
  const isLoading = false;
  const error = null;

  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.blockNumber - b.blockNumber),
    [blocks]
  );

  const initialBlockId = useMemo(() => {
    if (selectedBlockId && sortedBlocks.some(b => b.id === selectedBlockId)) return selectedBlockId;
    return sortedBlocks[0]?.id;
  }, [selectedBlockId, sortedBlocks]);

  useEffect(() => {
    // Sync local state with URL param (from parent) on mount/param change
    setCurrentBlockId(selectedBlockId ?? initialBlockId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBlockId, initialBlockId]);

  useEffect(() => {
    // If there is no block in the URL but we can infer one, push it
    if (!selectedBlockId && initialBlockId) {
      setLocation(`/athletes/${athleteId}/blocks?view=template&block=${initialBlockId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBlockId, initialBlockId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64 bg-[#171716]" />
          <Skeleton className="h-24 w-full bg-[#171716]" />
          <Skeleton className="h-24 w-full bg-[#171716]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="border border-[#292928] rounded-lg bg-[#1a1a19] p-12">
          <div className="text-center max-w-md mx-auto">
            <h3 className="text-lg font-semibold font-['Montserrat'] text-[#f7f6f2] mb-2">
              Error loading templates
            </h3>
            <p className="text-sm font-['Montserrat'] text-[#979795] mb-6">
              {(error as Error).message}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-[#e5e4e1] text-black hover:bg-[#d5d4d1] font-['Montserrat']"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (sortedBlocks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="border border-[#292928] rounded-lg bg-[#1a1a19] p-12">
          <div className="text-center max-w-md mx-auto">
            <h3 className="text-lg font-semibold font-['Montserrat'] text-[#f7f6f2] mb-2">
              No blocks found for this phase
            </h3>
            <p className="text-sm font-['Montserrat'] text-[#979795] mb-6">
              Create a block to configure its templates.
            </p>
            <Button
              onClick={() => setLocation(`/programs/${athleteId}?tab=builder&mode=create`)}
              className="bg-[#e5e4e1] text-black hover:bg-[#d5d4d1] font-['Montserrat']"
            >
              Create Block
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const selectedBlock = sortedBlocks.find(b => b.id === currentBlockId) ?? sortedBlocks[0];

  const InfoRow = ({ label, value }: { label: string; value?: string }) => (
    <div className="flex items-center justify-between py-2 border-b border-[#292928] last:border-b-0">
      <span className="text-sm text-[#979795] font-['Montserrat']">{label}</span>
      <span className="text-sm text-[#f7f6f2] font-['Montserrat']">{value || "—"}</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Block selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-[#f7f6f2] font-['Montserrat']">Block:</span>
        <Select
          value={selectedBlock?.id}
          onValueChange={(val) => {
            setCurrentBlockId(val);
            setLocation(`/athletes/${athleteId}/blocks?view=template&block=${val}`);
          }}
        >
          <SelectTrigger className="bg-[#171716] border-[#292928] w-64">
            <SelectValue placeholder="Select block" />
          </SelectTrigger>
          <SelectContent>
            {sortedBlocks.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {`Block ${b.blockNumber}: ${b.season}${b.subSeason ? ` (${b.subSeason})` : ""}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Template summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-[#292928] rounded-lg p-4 bg-[#1a1a19]">
          <h3 className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat'] mb-3">Throwing</h3>
          <InfoRow label="Role" value={selectedBlock.throwing?.xRole} />
          <InfoRow label="Phase" value={selectedBlock.throwing?.phase} />
          <InfoRow label="Exclusions" value={selectedBlock.throwing?.exclusions} />
        </div>
        <div className="border border-[#292928] rounded-lg p-4 bg-[#1a1a19]">
          <h3 className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat'] mb-3">Movement</h3>
          <InfoRow label="Intensity" value={selectedBlock.movement?.intensity} />
          <InfoRow label="Volume" value={selectedBlock.movement?.volume} />
        </div>
        <div className="border border-[#292928] rounded-lg p-4 bg-[#1a1a19]">
          <h3 className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat'] mb-3">Lifting</h3>
          <InfoRow label="Split" value={selectedBlock.lifting?.split} />
          <InfoRow label="Emphasis" value={selectedBlock.lifting?.emphasis} />
          <InfoRow label="Variability" value={selectedBlock.lifting?.variability} />
          <InfoRow label="Scheme" value={selectedBlock.lifting?.scheme} />
        </div>
        <div className="border border-[#292928] rounded-lg p-4 bg-[#1a1a19]">
          <h3 className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat'] mb-3">Conditioning</h3>
          <InfoRow label="Core Emphasis" value={selectedBlock.conditioning?.coreEmphasis} />
          <InfoRow label="Adaptation" value={selectedBlock.conditioning?.adaptation} />
          <InfoRow label="Method" value={selectedBlock.conditioning?.method} />
        </div>
      </div>
    </div>
  );
}


