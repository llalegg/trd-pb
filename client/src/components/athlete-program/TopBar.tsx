import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User } from "lucide-react";

interface TopBarProps {
	currentTab: "summary" | "review" | "builder";
	onTabChange: (tab: "summary" | "review" | "builder") => void;
	onBack: () => void;
	phaseTitle?: string;
	onOpenAthleteDetails?: () => void;
}

export default function TopBar({ currentTab, onTabChange, onBack, phaseTitle, onOpenAthleteDetails }: TopBarProps) {
	return (
		<div className="fixed top-0 left-0 right-0 z-50 border-b border-[#292928] bg-surface-base">
			<div className="h-14 flex items-center px-4">
				{/* Left: Back + Profile + Phase title */}
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="sm"
						onClick={onBack}
						className="text-[#f7f6f2] hover:bg-[#171716]"
						aria-label="Back to Programs"
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					{onOpenAthleteDetails && (
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={onOpenAthleteDetails}
							aria-label="Open athlete details"
						>
							<User className="h-4 w-4 text-[#f7f6f2]" />
						</Button>
					)}
					{phaseTitle && (
						<div className="text-sm text-[#f7f6f2] font-medium">
							{phaseTitle}
						</div>
					)}
				</div>
				{/* Center: Tabs */}
				<div className="flex-1 flex justify-center">
					<Tabs value={currentTab} onValueChange={(v) => onTabChange(v as any)}>
						<TabsList className="bg-transparent p-0">
							<TabsTrigger
								value="summary"
								className="rounded-none data-[state=active]:text-[#f7f6f2] data-[state=active]:border-b-2 data-[state=active]:border-primary"
							>
								Summary
							</TabsTrigger>
							<TabsTrigger
								value="review"
								className="rounded-none data-[state=active]:text-[#f7f6f2] data-[state=active]:border-b-2 data-[state=active]:border-primary"
							>
								Review
							</TabsTrigger>
							<TabsTrigger
								value="builder"
								className="rounded-none data-[state=active]:text-[#f7f6f2] data-[state=active]:border-b-2 data-[state=active]:border-primary"
							>
								Builder
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
				{/* Right: Spacer */}
				<div className="w-20" />
			</div>
		</div>
	);
}


