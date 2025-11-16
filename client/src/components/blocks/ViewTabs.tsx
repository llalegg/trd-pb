import { useLocation, useRoute } from "wouter";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

interface ViewTabsProps {
  activeView: "list" | "template" | "week";
  onViewChange?: (view: "list" | "template" | "week") => void;
  weekViewEnabled: boolean;
  selectedBlockId?: string; // Block ID for week view URL param
}

export default function ViewTabs({ 
  activeView, 
  onViewChange,
  weekViewEnabled,
  selectedBlockId 
}: ViewTabsProps) {
  const [, setLocation] = useLocation();
  const [, params] = useRoute<{ athleteId: string }>("/athletes/:athleteId/blocks");
  const athleteId = params?.athleteId || "";

  const handleViewChange = (value: string) => {
    if (!value) return;
    
    const view = value as "list" | "template" | "week";
    
    // Build URL with appropriate query params
    let url = `/athletes/${athleteId}/blocks`;
    
    if (view === "template") {
      url += "?view=template";
    } else if (view === "week" && selectedBlockId) {
      url += `?view=week&block=${selectedBlockId}`;
    }
    // list view has no query params
    
    setLocation(url);
    
    // Call optional callback
    if (onViewChange) {
      onViewChange(view);
    }
  };

  return (
    <ToggleGroup
      type="single"
      value={activeView}
      onValueChange={handleViewChange}
      variant="segmented"
    >
      <ToggleGroupItem value="list" aria-label="List View">
        List View
      </ToggleGroupItem>
      <ToggleGroupItem value="template" aria-label="Template View">
        Template View
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="week" 
        aria-label="Week View"
        disabled={!weekViewEnabled}
        className={cn(
          !weekViewEnabled && "opacity-50 cursor-not-allowed"
        )}
      >
        Week View
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

