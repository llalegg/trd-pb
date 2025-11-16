import { format, addDays } from "date-fns";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Block } from "@shared/schema";
import { cn } from "@/lib/utils";

interface AddBlockCardProps {
  lastBlock?: Block;
  onClick: () => void;
}

const DEFAULT_DURATION_WEEKS = 4;

const calculateNextBlockNumber = (lastBlock?: Block): number => {
  if (!lastBlock) return 1;
  return lastBlock.blockNumber + 1;
};

const calculateStartDate = (lastBlock?: Block): Date => {
  if (!lastBlock) {
    // If no last block, start from today
    return new Date();
  }
  
  // Start the day after the last block ends
  const lastBlockEndDate = new Date(lastBlock.endDate);
  return addDays(lastBlockEndDate, 1);
};

export default function AddBlockCard({ lastBlock, onClick }: AddBlockCardProps) {
  const nextBlockNumber = calculateNextBlockNumber(lastBlock);
  const startDate = calculateStartDate(lastBlock);
  const formattedStartDate = format(startDate, "MMM d, yyyy");

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-[#0d0d0c] border-2 border-dashed border-[#292928] rounded-lg p-4 mb-4",
        "cursor-pointer transition-all duration-200",
        "hover:border-[#3a3a38] hover:bg-[#1a1a19]",
        "flex flex-col items-center justify-center text-center",
        "min-h-[200px]"
      )}
    >
      {/* Plus Icon */}
      <div className="mb-3">
        <div className="w-12 h-12 rounded-full bg-[#171716] border border-[#292928] flex items-center justify-center">
          <Plus className="h-6 w-6 text-[#979795]" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-[#f7f6f2] font-['Montserrat'] mb-2">
        Add Block {nextBlockNumber}
      </h3>

      {/* Start Date and Duration */}
      <div className="text-sm text-[#979795] font-['Montserrat'] mb-4">
        Start date: {formattedStartDate} ({DEFAULT_DURATION_WEEKS} weeks)
      </div>

      {/* Create Button */}
      <Button
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="h-9 px-4 text-xs font-semibold font-['Montserrat'] bg-[#e5e4e1] text-black hover:bg-[#d5d4d1]"
      >
        Create Block
      </Button>
    </div>
  );
}

