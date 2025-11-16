import { useQuery } from "@tanstack/react-query";
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
  const [pendingSignoffBlock, setPendingSignoffBlock] = useState<Block | null>(null);

  // Fetch blocks for this phase
  const { data: blocks = [], isLoading, error } = useQuery<Block[]>({
    queryKey: ["/api/athletes", athleteId, "phases", phaseId, "blocks"],
    queryFn: async () => {
      const response = await fetch(`/api/athletes/${athleteId}/phases/${phaseId}/blocks`);
      if (!response.ok) {
        throw new Error("Failed to fetch blocks");
      }
      return response.json();
    },
    enabled: !!athleteId && !!phaseId,
  });

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
              onClick={() => setLocation(`/add-program?mode=create&athleteId=${athleteId}`)}
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
      
      {/* Sign-off Dialog */}
      <AlertDialog open={!!pendingSignoffBlock} onOpenChange={(open) => !open && setPendingSignoffBlock(null)}>
        <AlertDialogContent className="bg-surface-base border-[#292928]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#f7f6f2] font-['Montserrat']">
              {pendingSignoffBlock ? `Sign off ${pendingSignoffBlock.name}?` : "Sign off block?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#979795] font-['Montserrat']">
              The block will be activated and sent to the athlete.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              className="border-[#292928] text-[#979795] hover:text-[#f7f6f2] hover:bg-[#1a1a19]"
              onClick={() => {
                if (pendingSignoffBlock) {
                  setLocation(`/athletes/${athleteId}/blocks?view=week&block=${pendingSignoffBlock.id}`);
                }
                setPendingSignoffBlock(null);
              }}
            >
              Review Exercises
            </Button>
            <AlertDialogCancel className="bg-[#171716] text-[#f7f6f2] border-[#292928] hover:bg-[#1a1a19] font-['Montserrat']">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#e5e4e1] text-black hover:bg-[#d5d4d1] font-['Montserrat']"
              onClick={async () => {
                if (!pendingSignoffBlock) return;
                try {
                  const response = await fetch(`/api/blocks/${pendingSignoffBlock.id}/sign-off`, {
                    method: "POST",
                  });
                  setPendingSignoffBlock(null);
                  if (response.ok) {
                    window.location.reload();
                  } else {
                    throw new Error("Failed to sign off block");
                  }
                } catch (error) {
                  console.error("Error signing off block:", error);
                  alert("Failed to sign off block. Please try again.");
                }
              }}
            >
              Sign off
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Horizontal scroller */}
      <div ref={scrollRef} className="overflow-x-auto">
        <div className="flex gap-4 pr-4">
          {sortedBlocks.map((block) => (
            <div key={block.id} className="w-[380px] flex-shrink-0">
              <BlockCard
                block={block}
                onEdit={() => setLocation(`/add-program?mode=edit&blockId=${block.id}`)}
                onView={() => setLocation(`/program-page?blockId=${block.id}`)}
                onSignOff={block.status === "pending-signoff" ? () => setPendingSignoffBlock(block) : undefined}
                onDelete={block.status === "draft" || block.status === "pending-signoff" ? async () => {
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
                  setLocation(`/add-program?mode=copy&blockId=${block.id}`);
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

