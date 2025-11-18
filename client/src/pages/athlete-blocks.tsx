import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { type AthleteWithPhase, type Phase } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import AthleteHeader from "@/components/blocks/AthleteHeader";
import ViewTabs from "@/components/blocks/ViewTabs";
import ListView from "@/components/blocks/ListView";
import TemplateView from "@/components/blocks/TemplateView";
import AthleteInfoSidebar from "@/components/blocks/AthleteInfoSidebar";

export default function AthleteBlocks() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute<{ athleteId: string }>("/athletes/:athleteId/blocks");
  const athleteId = params?.athleteId || "";

  // Parse query params for view state
  const urlParams = new URLSearchParams(window.location.search);
  const view = (urlParams.get("view") || "list") as "list" | "template" | "week";
  const blockParam = urlParams.get("block");

  // Determine if week view is enabled (requires a block to be selected)
  const weekViewEnabled = !!blockParam;

  // Fetch athlete data
  const { data: athletesData = [], isLoading: isLoadingAthletes, error: athletesError } = useQuery<AthleteWithPhase[]>({
    queryKey: ["/api/athletes"],
  });

  // Find the athlete
  const athleteData = athletesData.find((a) => a.athlete.id === athleteId);
  const athlete = athleteData?.athlete;
  const allBlocks = athleteData?.blocks || [];

  // Get current phase (status === "active")
  // Prefer athleteData.currentPhase when active; fallback to athlete.phases; final fallback: infer from blocks
  // The API returns currentPhase with id, phaseNumber, startDate, and nested blocks (not full schema Phase).
  // Use its id for fetching blocks. Fallback to inferring from blocks if needed.
  const currentPhaseId = athleteData?.currentPhase?.id
    ?? (allBlocks[0]?.phaseId || undefined);

  // Loading state
  if (isLoadingAthletes) {
    return (
      <div className="min-h-screen bg-surface-base">
        <div className="w-full">
          <div className="p-6 border-b border-[#292928]">
            <Skeleton className="h-8 w-64 mb-4 bg-[#171716]" />
            <Skeleton className="h-4 w-48 bg-[#171716]" />
          </div>
          <div className="px-5 pt-5 pb-4 border-b border-[#292928]">
            <Skeleton className="h-10 w-64 bg-[#171716]" />
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-48 w-full bg-[#171716]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state: Athlete not found
  if (!athlete) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-2 text-[#f7f6f2] font-['Montserrat']">
            Athlete not found
          </h2>
          <p className="text-[#979795] mb-4 font-['Montserrat']">
            {athletesError instanceof Error
              ? athletesError.message
              : "The athlete you're looking for doesn't exist."}
          </p>
          <Button
            onClick={() => setLocation("/programs")}
            className="bg-[#e5e4e1] text-black hover:bg-[#d5d4d1] font-['Montserrat']"
          >
            Back to Programs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base">
      <div className="w-full">
        {/* Athlete Header with tabs on the right */}
        <AthleteHeader
          athlete={athlete}
          currentPhase={undefined}
          blocks={allBlocks}
          rightContent={
            <ViewTabs
              activeView={view}
              weekViewEnabled={weekViewEnabled}
              selectedBlockId={blockParam || undefined}
            />
          }
        />

        {/* Main layout: Sidebar + Content */}
        <div className="flex">
          <AthleteInfoSidebar athlete={athlete} currentPhase={undefined} blocks={allBlocks} />
          <div className="flex-1 min-w-0">
            {/* Content Area - Conditional Views */}
            <div>
              {/* List View */}
              {view === "list" && (
                <>
                  {currentPhaseId ? (
                    <ListView athleteId={athleteId} phaseId={currentPhaseId} />
                  ) : (
                    <div className="max-w-4xl mx-auto p-6">
                      <div className="border border-[#292928] rounded-lg bg-surface-base p-12">
                        <div className="text-center max-w-md mx-auto">
                          <h3 className="text-lg font-semibold font-['Montserrat'] text-[#f7f6f2] mb-2">
                            No active phase found
                          </h3>
                          <p className="text-sm font-['Montserrat'] text-[#979795] mb-6">
                            This athlete doesn't have an active phase yet. Create a block to get started.
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
                  )}
                </>
              )}
              {/* Template View */}
              {view === "template" && currentPhaseId && (
                <TemplateView
                  athleteId={athleteId}
                  phaseId={currentPhaseId}
                  selectedBlockId={blockParam || undefined}
                />
              )}
              {/* Week View */}
              {view === "week" && (
                <>
                  {blockParam ? (
                    <div className="max-w-4xl mx-auto p-6">
                      <div className="border border-[#292928] rounded-lg p-6 bg-[#1a1a19]">
                        <h2 className="text-lg font-semibold text-[#f7f6f2] font-['Montserrat'] mb-4">
                          Week View - Block {blockParam}
                        </h2>
                        <p className="text-sm text-[#979795] font-['Montserrat']">
                          Week view coming soon...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-4xl mx-auto p-6">
                      <div className="border border-[#292928] rounded-lg bg-surface-base p-12">
                        <div className="text-center max-w-md mx-auto">
                          <h3 className="text-lg font-semibold font-['Montserrat'] text-[#f7f6f2] mb-2">
                            No block selected
                          </h3>
                          <p className="text-sm font-['Montserrat'] text-[#979795] mb-6">
                            Please select a block to view its weekly schedule.
                          </p>
                          <Button
                            onClick={() => setLocation(`/athletes/${athleteId}/blocks?view=list`)}
                            className="bg-[#e5e4e1] text-black hover:bg-[#d5d4d1] font-['Montserrat']"
                          >
                            Back to List View
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
