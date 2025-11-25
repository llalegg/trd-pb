import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import type { Block, Phase } from "@shared/schema";

// Get current active block
export const getCurrentBlock = (blocks: Block[]): Block | null => {
  const sorted = [...blocks].sort((a, b) => a.blockNumber - b.blockNumber);
  return sorted.find((b) => b.status === "active") || null;
};

// Get block progress countdown (days remaining until block expires)
export const getBlockProgress = (blocks: Block[]): { daysRemaining: number | null; text: string; needsAction: boolean } => {
  const currentBlock = getCurrentBlock(blocks);
  if (!currentBlock) {
    return { daysRemaining: null, text: "–", needsAction: false };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(currentBlock.endDate);
  endDate.setHours(0, 0, 0, 0);
  
  const daysRemaining = differenceInDays(endDate, today);
  
  if (daysRemaining < 0) {
    return { daysRemaining: 0, text: "in 0 day(s)", needsAction: true };
  }
  
  const needsAction = daysRemaining <= 3;
  const text = daysRemaining === 1 ? "in 1 day" : `in ${daysRemaining} day(s)`;
  
  return { daysRemaining, text, needsAction };
};

// Get days until block end with color coding
export const getDaysUntilBlockEnd = (blocks: Block[]): { days: number | null; text: string; colorClass: string } => {
  const progress = getBlockProgress(blocks);
  if (progress.daysRemaining === null) {
    return { days: null, text: "–", colorClass: "text-[#979795]" };
  }
  
  const days = progress.daysRemaining;
  let colorClass = "text-[#979795]"; // default (good)
  
  if (days <= 0) {
    colorClass = "text-red-500"; // urgent (light red)
  } else if (days <= 3) {
    colorClass = "text-red-400"; // urgent (light red)
  } else if (days <= 7) {
    colorClass = "text-yellow-500"; // warning (yellow)
  } else if (days <= 14) {
    colorClass = "text-gray-400"; // warning (gray)
  }
  
  return {
    days,
    text: days === 1 ? "1 day" : `${days} days`,
    colorClass,
  };
};

// Get program position in "P1 B3(4) W2 D2" format
export const getProgramPosition = (blocks: Block[], currentPhase?: Phase): string => {
  const currentBlock = getCurrentBlock(blocks);
  if (!currentBlock || !currentPhase) return "–";
  
  const totalBlocksInPhase = blocks.length;
  const phaseNum = currentPhase.phaseNumber;
  const blockNum = currentBlock.blockNumber;
  const week = currentBlock.currentDay?.week || 1;
  const day = currentBlock.currentDay?.day || 1;
  
  return `P${phaseNum} B${blockNum}(${totalBlocksInPhase}) W${week} D${day}`;
};

// Get sub-season status (In-Season or Off-Season)
export const getSubSeasonStatus = (blocks: Block[]): string => {
  const currentBlock = getCurrentBlock(blocks);
  if (!currentBlock) return "–";
  
  const season = currentBlock.season || "";
  if (season.includes("In-Season")) {
    return "In-Season";
  } else if (season.includes("Off-Season")) {
    return "Off-Season";
  } else if (season.includes("Pre-Season")) {
    return "In-Season"; // Pre-Season is part of In-Season
  }
  return season || "–";
};

// Get next block due date
export const getNextBlockDue = (blocks: Block[]): { date: Date | null; text: string } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = blocks.filter(b => b.nextBlockDue).sort((a, b) => new Date(a.nextBlockDue!).getTime() - new Date(b.nextBlockDue!).getTime())[0];
  if (!next || !next.nextBlockDue) return { date: null, text: "–" };
  const due = new Date(next.nextBlockDue);
  due.setHours(0, 0, 0, 0);
  return {
    date: due,
    text: format(due, "MMM d, yyyy")
  };
};

