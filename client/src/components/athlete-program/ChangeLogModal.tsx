import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import type { ChangeLogEntry } from "./SummaryBlockCard";

interface ChangeLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blockName: string;
  changeLogEntries: ChangeLogEntry[];
}

export default function ChangeLogModal({
  open,
  onOpenChange,
  blockName,
  changeLogEntries,
}: ChangeLogModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-['Montserrat']">
            Change Log: {blockName}
          </DialogTitle>
          <DialogDescription className="font-['Montserrat']">
            Complete history of changes made to this block
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {changeLogEntries.length === 0 ? (
            <div className="text-center py-8 text-[#979795] font-['Montserrat']">
              No changes recorded for this block
            </div>
          ) : (
            changeLogEntries.map((entry) => (
              <div
                key={entry.id}
                className="border border-[#292928] rounded-lg p-4 bg-[#171716]"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">
                      {entry.coachName}
                    </p>
                    <p className="text-xs text-[#979795] font-['Montserrat'] mt-1">
                      {format(parseISO(entry.timestamp), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-[#f7f6f2] font-['Montserrat'] mt-2">
                  {entry.detailedDescription || entry.description}
                </p>

                {entry.changes && entry.changes.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold text-[#979795] font-['Montserrat'] uppercase tracking-wide">
                      Changes Made:
                    </p>
                    {entry.changes.map((change, index) => (
                      <div
                        key={index}
                        className="bg-[#0d0d0c] rounded p-2 text-xs font-['Montserrat']"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[#979795] font-medium">
                            {change.field}:
                          </span>
                          <span className="text-red-400 line-through">
                            {change.before}
                          </span>
                          <span className="text-[#979795]">→</span>
                          <span className="text-green-400">{change.after}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

