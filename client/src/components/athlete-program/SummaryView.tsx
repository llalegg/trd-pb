import React, { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { AthleteWithPhase, Block } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { parseISO, isAfter, isBefore, startOfToday, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import PerformanceMetricCard, {
  type PerformanceMetric,
} from "./PerformanceMetricCard";
import SummaryBlockCard, { type ChangeLogEntry } from "./SummaryBlockCard";
import ChangeLogModal from "./ChangeLogModal";

interface SummaryViewProps {
  athleteId: string;
  athleteName?: string | null;
  onNavigateTab: (tab: "summary" | "review" | "builder") => void;
}

// Mock performance metrics data
const getMockPerformanceMetrics = (): PerformanceMetric[] => [
  {
    name: "Squat Max",
    currentValue: 315,
    unit: "lbs",
    trend: "up",
    percentageChange: 5.0,
    sparklineData: [290, 295, 300, 305, 310, 315],
  },
  {
    name: "Throwing Velocity",
    currentValue: 92,
    unit: "mph",
    trend: "up",
    percentageChange: 2.3,
    sparklineData: [88, 89, 90, 91, 91.5, 92],
  },
  {
    name: "Movement Score",
    currentValue: 8.5,
    unit: "/10",
    trend: "stable",
    percentageChange: 0,
    sparklineData: [8.3, 8.4, 8.5, 8.5, 8.5, 8.5],
  },
  {
    name: "Vertical Jump",
    currentValue: 32,
    unit: '"',
    trend: "up",
    percentageChange: 8.5,
    sparklineData: [28, 29, 30, 31, 31.5, 32],
  },
];

// Mock change log data generator
const generateMockChangeLog = (blockId: string): ChangeLogEntry[] => {
  const coaches = ["Coach Smith", "Coach Johnson", "Coach Williams"];
  const changeTypes = [
    {
      description: "Updated lifting emphasis",
      detailed: "Changed training emphasis from Strength to Speed-Strength",
      changes: [
        { field: "Lifting Emphasis", before: "Strength", after: "Speed-Strength" },
      ],
    },
    {
      description: "Modified exercise selection",
      detailed: "Replaced barbell squat with front squat for better form focus",
      changes: [
        { field: "Exercise", before: "Barbell Squat", after: "Front Squat" },
      ],
    },
    {
      description: "Adjusted volume parameters",
      detailed: "Increased sets from 3x5 to 4x5 for progressive overload",
      changes: [
        { field: "Sets", before: "3", after: "4" },
      ],
    },
    {
      description: "Updated template configuration",
      detailed: "Switched from 4x2 split to 3x2 split for better recovery",
      changes: [
        { field: "Split", before: "4x2", after: "3x2" },
      ],
    },
    {
      description: "Added contrast sets",
      detailed: "Added contrast sets to Friday lift session",
    },
  ];

  const today = new Date();
  const entries: ChangeLogEntry[] = [];

  for (let i = 0; i < 7; i++) {
    const changeType = changeTypes[i % changeTypes.length];
    const timestamp = new Date(today);
    timestamp.setDate(timestamp.getDate() - i * 2);
    
    entries.push({
      id: `${blockId}-change-${i}`,
      timestamp: timestamp.toISOString(),
      coachName: coaches[i % coaches.length],
      description: changeType.description,
      detailedDescription: changeType.detailed,
      changes: changeType.changes,
    });
  }

  return entries.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

export default function SummaryView({
  athleteId,
  athleteName,
  onNavigateTab,
}: SummaryViewProps) {
  const [, setLocation] = useLocation();
  const [changeLogModalOpen, setChangeLogModalOpen] = useState(false);
  const [selectedBlockForChangeLog, setSelectedBlockForChangeLog] = useState<{
    blockId: string;
    blockName: string;
    entries: ChangeLogEntry[];
  } | null>(null);

  const { data: athletesData = [] } = useQuery<AthleteWithPhase[]>({
    queryKey: ["/api/athletes"],
  });

  const athleteData = useMemo(
    () => athletesData.find((a) => a.athlete.id === athleteId),
    [athletesData, athleteId]
  );

  const blocks = athleteData?.blocks || [];
  const today = startOfToday();

  // Categorize blocks
  const { currentBlocks, pastBlocks, plannedBlocks } = useMemo(() => {
    const current: Block[] = [];
    const past: Block[] = [];
    const planned: Block[] = [];

    blocks.forEach((block) => {
      const startDate = parseISO(block.startDate);
      const endDate = parseISO(block.endDate);

      // Current block: status is "active" and today is within the block's date range
      if (block.status === "active" && isWithinInterval(today, { start: startDate, end: endDate })) {
        current.push(block);
      } 
      // Past blocks: status is "complete" OR (status is "active" but endDate has passed)
      else if (block.status === "complete" || (block.status === "active" && isBefore(endDate, today))) {
        past.push(block);
      } 
      // Planned blocks: status is "draft" OR "planned" OR startDate is in the future
      else if (block.status === "draft" || block.status === "planned" || isAfter(startDate, today)) {
        planned.push(block);
      } 
      // Default to past if unclear
      else {
        past.push(block);
      }
    });

    // Sort past blocks by end date (most recent first)
    past.sort((a, b) => {
      const dateA = parseISO(a.endDate).getTime();
      const dateB = parseISO(b.endDate).getTime();
      return dateB - dateA;
    });

    return {
      currentBlocks: current,
      pastBlocks: past,
      plannedBlocks: planned,
    };
  }, [blocks, today]);

  const performanceMetrics = getMockPerformanceMetrics();

  const handleViewDetails = (blockId: string) => {
    // Navigate to Review tab with block ID
    const url = `/programs/${athleteId}?tab=review&blockId=${blockId}`;
    console.log("Navigating to:", url);
    setLocation(url);
  };

  const handleChangeLogClick = (blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (block) {
      const entries = generateMockChangeLog(blockId);
      setSelectedBlockForChangeLog({
        blockId,
        blockName: block.name,
        entries,
      });
      setChangeLogModalOpen(true);
    }
  };

  // Get change log entries for a block
  const getChangeLogEntries = (blockId: string): ChangeLogEntry[] => {
    return generateMockChangeLog(blockId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Performance Metrics Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-[#f7f6f2] font-['Montserrat'] mb-1">
            Performance Overview
          </h2>
          <p className="text-sm text-[#979795] font-['Montserrat']">
            Key metrics and trends from recent training blocks
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {performanceMetrics.map((metric) => (
            <PerformanceMetricCard key={metric.name} metric={metric} />
          ))}
        </div>
        <div className="pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log("Navigate to detailed performance data view");
              // TODO: Navigate to detailed analytics view
            }}
            className="text-xs font-['Montserrat'] text-[#979795] hover:text-[#f7f6f2]"
          >
            View detailed performance data
            <ArrowRight className="ml-1.5 h-3 w-3" />
          </Button>
        </div>
      </section>

      {/* Current Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#f7f6f2] font-['Montserrat']">
          Current
        </h2>
        {currentBlocks.length === 0 ? (
          <Card className="bg-[#171716] border-[#292928] border-dashed">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-[#979795] font-['Montserrat']">
                No active block currently
              </p>
            </CardContent>
          </Card>
        ) : (
          currentBlocks.map((block) => (
            <SummaryBlockCard
              key={block.id}
              block={block}
              onViewDetails={handleViewDetails}
              onChangeLogClick={handleChangeLogClick}
              changeLogEntries={getChangeLogEntries(block.id)}
              isCurrent={true}
            />
          ))
        )}
      </section>

      {/* Past Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#f7f6f2] font-['Montserrat']">
          Past
        </h2>
        {pastBlocks.length === 0 ? (
          <Card className="bg-[#171716] border-[#292928] border-dashed">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-[#979795] font-['Montserrat']">
                No past blocks available
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pastBlocks.map((block) => (
              <SummaryBlockCard
                key={block.id}
                block={block}
                onViewDetails={handleViewDetails}
                onChangeLogClick={handleChangeLogClick}
                changeLogEntries={getChangeLogEntries(block.id)}
                isCurrent={false}
              />
            ))}
          </div>
        )}
      </section>

      {/* Planned Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#f7f6f2] font-['Montserrat']">
          Planned
        </h2>
        {plannedBlocks.length === 0 ? (
          <Card className="bg-[#171716] border-[#292928] border-dashed">
            <CardContent className="p-8 text-center space-y-3">
              <p className="text-sm text-[#979795] font-['Montserrat']">
                No planned blocks available
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNavigateTab("builder")}
                className="text-xs font-['Montserrat']"
              >
                Create new block
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {plannedBlocks.map((block) => (
              <SummaryBlockCard
                key={block.id}
                block={block}
                onViewDetails={handleViewDetails}
                onChangeLogClick={handleChangeLogClick}
                changeLogEntries={getChangeLogEntries(block.id)}
                isDraft={block.status === "draft"}
              />
            ))}
          </div>
        )}
      </section>

      {/* Change Log Modal */}
      {selectedBlockForChangeLog && (
        <ChangeLogModal
          open={changeLogModalOpen}
          onOpenChange={setChangeLogModalOpen}
          blockName={selectedBlockForChangeLog.blockName}
          changeLogEntries={selectedBlockForChangeLog.entries}
        />
      )}
    </div>
  );
}

