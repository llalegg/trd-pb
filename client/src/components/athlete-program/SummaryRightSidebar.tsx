import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CalendarDays, Clock8, ArrowRight, Activity, TrendingUp, MessageSquareMore } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Alert {
  title: string;
  detail: string;
  severity: "critical" | "warning" | "info";
  actionLabel?: string;
  action?: () => void;
}

interface ActivityItem {
  type: "workout" | "performance" | "coach";
  title: string;
  detail: string;
  timestamp: string;
}

interface SummaryRightSidebarProps {
  alerts?: Alert[];
  activityFeed?: ActivityItem[];
}

const getAlertAccent = (severity: "warning" | "critical" | "info") => {
  switch (severity) {
    case "critical":
      return "text-[#F97066] bg-[#2b1110]";
    case "warning":
      return "text-[#FEC84B] bg-[#2b230f]";
    default:
      return "text-[#7CD4FD] bg-[#102231]";
  }
};

const renderActivityIcon = (type: "workout" | "performance" | "coach") => {
  const baseClasses = "w-9 h-9 rounded-full flex items-center justify-center";
  switch (type) {
    case "workout":
      return (
        <div className={`${baseClasses} bg-[#14241f] text-[#4ade80]`}>
          <Activity className="h-4 w-4" />
        </div>
      );
    case "performance":
      return (
        <div className={`${baseClasses} bg-[#1b212f] text-[#60a5fa]`}>
          <TrendingUp className="h-4 w-4" />
        </div>
      );
    case "coach":
      return (
        <div className={`${baseClasses} bg-[#2a1c2b] text-[#f472b6]`}>
          <MessageSquareMore className="h-4 w-4" />
        </div>
      );
  }
};

export default function SummaryRightSidebar({ 
  alerts = [], 
  activityFeed = [] 
}: SummaryRightSidebarProps) {
  // Default alerts if none provided
  const defaultAlerts: Alert[] = alerts.length > 0 ? alerts : [
    {
      title: "Injury / rehab alert",
      detail: "Left shoulder flagged during warm-up",
      severity: "critical",
      actionLabel: "Log update",
    },
    {
      title: "Upcoming assessment",
      detail: `Movement screen on ${format(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), "MMM d")}`,
      severity: "info",
      actionLabel: "View plan",
    },
  ];

  // Default activity feed if none provided
  const defaultActivityFeed: ActivityItem[] = activityFeed.length > 0 ? activityFeed : [
    {
      type: "workout",
      title: "Workout submitted",
      detail: "Full Body Strength — 5x5 completed at RPE 8",
      timestamp: "Today · 07:42",
    },
    {
      type: "performance",
      title: "Performance update",
      detail: "Vertical jump up +2.5\" vs last block",
      timestamp: "Yesterday · 18:10",
    },
    {
      type: "coach",
      title: "Coach note",
      detail: "Dial back overhead pressing volume if shoulder flare persists.",
      timestamp: "Yesterday · 12:35",
    },
    {
      type: "workout",
      title: "Workout submitted",
      detail: "Tempo Run — pacing within 5% target.",
      timestamp: "Mon · 19:05",
    },
    {
      type: "coach",
      title: "Comment added",
      detail: "Added contrast sets to Friday lift; confirm readiness.",
      timestamp: "Sun · 09:18",
    },
  ];

  return (
    <aside className="w-[320px] border-l border-[#292928] bg-[#0d0d0c] h-full overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Alerts & Notifications Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">
              Alerts & notifications
            </h3>
          </div>
          <div className="space-y-3">
            {defaultAlerts.map((alert, index) => (
              <div
                key={index}
                className="bg-[#171716] border border-[#292928] rounded-lg p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium flex-shrink-0",
                      getAlertAccent(alert.severity)
                    )}>
                      {alert.severity === "critical" && <AlertTriangle className="h-3 w-3" />}
                      {alert.severity === "warning" && <Clock8 className="h-3 w-3" />}
                      {alert.severity === "info" && <CalendarDays className="h-3 w-3" />}
                      <span className="whitespace-nowrap">{alert.title}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#979795] font-['Montserrat']">
                  {alert.detail}
                </p>
                {alert.actionLabel && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 border-[#292928] text-[#979795] hover:text-[#f7f6f2] hover:bg-[#171716] font-['Montserrat']"
                    onClick={alert.action}
                  >
                    {alert.actionLabel}
                    <ArrowRight className="ml-1.5 h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">
            Recent activity feed
          </h3>
          <div className="space-y-0">
            {defaultActivityFeed.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3 py-3 border-b border-[#292928] last:border-b-0",
                  index === 0 && "pt-0"
                )}
              >
                {renderActivityIcon(item.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-[#f7f6f2] font-['Montserrat']">
                      {item.title}
                    </p>
                    <span className="text-xs text-[#979795] font-['Montserrat'] whitespace-nowrap">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-[#979795] font-['Montserrat']">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

