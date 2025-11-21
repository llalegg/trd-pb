import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis } from "recharts";

export interface PerformanceMetric {
  name: string;
  currentValue: number;
  unit: string;
  trend: "up" | "down" | "stable";
  percentageChange: number;
  sparklineData: number[];
}

interface PerformanceMetricCardProps {
  metric: PerformanceMetric;
}

export default function PerformanceMetricCard({ metric }: PerformanceMetricCardProps) {
  const trendColor =
    metric.trend === "up"
      ? "text-green-400"
      : metric.trend === "down"
      ? "text-red-400"
      : "text-[#979795]";

  const trendBgColor =
    metric.trend === "up"
      ? "bg-green-500/10"
      : metric.trend === "down"
      ? "bg-red-500/10"
      : "bg-[#171716]";

  const TrendIcon =
    metric.trend === "up"
      ? TrendingUp
      : metric.trend === "down"
      ? TrendingDown
      : Minus;

  // Prepare sparkline data
  const sparklineChartData = metric.sparklineData.map((value, index) => ({
    value,
    index: index + 1,
  }));

  const minValue = Math.min(...metric.sparklineData);
  const maxValue = Math.max(...metric.sparklineData);
  const range = maxValue - minValue || 1;

  return (
    <Card className={cn("bg-[#171716] border-[#292928]")}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Metric Name */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-[#f7f6f2] font-['Montserrat']">
              {metric.name}
            </h4>
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium font-['Montserrat']",
                trendColor,
                trendBgColor
              )}
            >
              <TrendIcon className="h-3 w-3" />
              <span>
                {metric.trend === "up" ? "+" : metric.trend === "down" ? "-" : ""}
                {Math.abs(metric.percentageChange).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Current Value */}
          <div>
            <p className="text-2xl font-semibold text-[#f7f6f2] font-['Montserrat']">
              {metric.currentValue}
              <span className="text-sm font-normal text-[#979795] ml-1">
                {metric.unit}
              </span>
            </p>
          </div>

          {/* Sparkline Chart */}
          <div className="h-12 w-full">
            <ChartContainer
              config={{
                value: {
                  label: metric.name,
                  color:
                    metric.trend === "up"
                      ? "hsl(142, 70%, 45%)"
                      : metric.trend === "down"
                      ? "hsl(0, 70%, 50%)"
                      : "hsl(0, 0%, 50%)",
                },
              }}
              className="h-full w-full [&>div]:!aspect-auto"
            >
              <LineChart data={sparklineChartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <XAxis dataKey="index" hide />
                <YAxis
                  domain={[minValue - range * 0.1, maxValue + range * 0.1]}
                  hide
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={
                    metric.trend === "up"
                      ? "hsl(142, 70%, 45%)"
                      : metric.trend === "down"
                      ? "hsl(0, 70%, 50%)"
                      : "hsl(0, 0%, 50%)"
                  }
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

