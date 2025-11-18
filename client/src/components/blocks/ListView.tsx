import { useLocation } from "wouter";
import { type Block } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import BlockCard from "./BlockCard";
import AddBlockCard from "./AddBlockCard";
import CreateBlockModal from "./CreateBlockModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { parseISO, isBefore, isAfter } from "date-fns";

interface ListViewProps {
  athleteId: string;
  phaseId: string;
}

export default function ListView({ athleteId, phaseId }: ListViewProps) {
  const [, setLocation] = useLocation();
  const [createOpen, setCreateOpen] = useState(false);

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

  // Sort blocks by endDate descending (latest first)
  const sortedBlocks = useMemo(() => {
    return [...blocks].sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
  }, [blocks]);

  // Latest block
  const lastBlock = sortedBlocks[0];

  // Horizontal scroll container
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      // Latest is at the left when sorted desc, so position 0
      scrollRef.current.scrollLeft = 0;
    }
  }, [sortedBlocks.length]);

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-48 w-full bg-[#171716]" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="border border-[#292928] rounded-lg bg-[#1a1a19] p-12">
          <div className="text-center max-w-md mx-auto">
            <h3 className="text-lg font-semibold font-['Montserrat'] text-[#f7f6f2] mb-2">
              Error loading blocks
            </h3>
            <p className="text-sm font-['Montserrat'] text-[#979795] mb-6">
              {error instanceof Error ? error.message : "Failed to load blocks"}
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

  // Empty state
  if (sortedBlocks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="border border-[#292928] rounded-lg bg-[#1a1a19] p-12">
          <div className="text-center max-w-md mx-auto">
            <h3 className="text-lg font-semibold font-['Montserrat'] text-[#f7f6f2] mb-2">
              No blocks created yet
            </h3>
            <p className="text-sm font-['Montserrat'] text-[#979795] mb-6">
              Get started by creating the first block for this phase.
            </p>
            <Button
              onClick={() => setLocation(`/programs/${athleteId}?tab=builder&mode=create`)}
              className="bg-[#e5e4e1] text-black hover:bg-[#d5d4d1] font-['Montserrat']"
            >
              Create First Block
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Blocks list (horizontal) with bottom calendar
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Create Block Modal */}
      <CreateBlockModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        athleteId={athleteId}
        phaseId={phaseId}
        lastBlock={lastBlock}
      />

      {/* Horizontal scroller */}
      <div ref={scrollRef} className="overflow-x-auto">
        <div className="flex gap-4 pr-4">
          {sortedBlocks.map((block) => (
            <div key={block.id} className="w-[380px] flex-shrink-0">
              <BlockCard
                block={block}
                onEdit={() => setLocation(`/programs/${athleteId}?tab=builder&mode=edit&blockId=${block.id}`)}
                onView={() => setLocation(`/program-page?blockId=${block.id}`)}
                onDelete={block.status === "draft" ? async () => {
                  if (confirm("Are you sure you want to delete this block?")) {
                    try {
                      const response = await fetch(`/api/blocks/${block.id}`, {
                        method: "DELETE",
                      });
                      if (response.ok) {
                        // Refresh data
                        window.location.reload();
                      } else {
                        throw new Error("Failed to delete block");
                      }
                    } catch (error) {
                      console.error("Error deleting block:", error);
                      alert("Failed to delete block. Please try again.");
                    }
                  }
                } : undefined}
                onCopy={block.status === "complete" ? () => {
                  setLocation(`/programs/${athleteId}?tab=builder&mode=copy&blockId=${block.id}`);
                } : undefined}
                onViewPerformance={block.status === "active" ? () => {
                  setLocation(`/athletes/${athleteId}/blocks?view=performance&block=${block.id}`);
                } : undefined}
              />
            </div>
          ))}
          {/* Add Block Card */}
          <div className="w-[380px] flex-shrink-0">
            <AddBlockCard
              lastBlock={lastBlock}
              onClick={() => setCreateOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Bottom calendar */}
      {sortedBlocks.length > 0 && (() => {
        const minStart = sortedBlocks.reduce((min, b) => {
          const s = parseISO(b.startDate);
          return !min || isBefore(s, min) ? s : min;
        }, null as Date | null)!;
        const maxEnd = sortedBlocks.reduce((max, b) => {
          const e = parseISO(b.endDate);
          return !max || isAfter(e, max) ? e : max;
        }, null as Date | null)!;
        return (
          <div className="mt-6 border border-[#292928] rounded-lg p-3 bg-[#1a1a19]">
            <Calendar
              mode="range"
              selected={{ from: minStart, to: maxEnd }}
              defaultMonth={maxEnd}
            />
          </div>
        );
      })()}
    </div>
  );
}

