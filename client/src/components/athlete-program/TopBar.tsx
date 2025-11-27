import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, PanelLeftOpen, PanelLeftClose } from "lucide-react";

interface TopBarProps {
	currentTab: "summary" | "review" | "builder";
	onTabChange: (tab: "summary" | "review" | "builder") => void;
	onBack: () => void;
	phaseTitle?: string;
	onOpenAthleteDetails?: () => void;
	leftOffset?: number;
	athleteDetailsOpen?: boolean;
	athleteName?: string;
	programPosition?: { phase: number; block: number; week: number; day: number };
}

export default function TopBar({
	currentTab,
	onTabChange,
	onBack,
	phaseTitle,
	onOpenAthleteDetails,
	leftOffset = 0,
	athleteDetailsOpen = false,
	athleteName,
	programPosition,
}: TopBarProps) {
	const displayPhaseTitle = phaseTitle?.replace(/[()]/g, "").trim();
	const phasePrimaryMatch = displayPhaseTitle?.match(/^(Phase\s*\d+)/i);
	const phasePrimaryText = phasePrimaryMatch?.[0]?.trim() ?? (displayPhaseTitle || "");
	const phaseSecondaryText = phasePrimaryMatch
		? displayPhaseTitle?.slice(phasePrimaryMatch[0].length).trim()
		: "";
	
	const sidebarWidth = 320;
	const minimizeButtonLeft = athleteDetailsOpen ? sidebarWidth : 0;
	
	return (
		<div 
			className="fixed z-50 border-b border-[#292928] bg-surface-base" 
			style={{ 
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				width: '100%',
				margin: 0,
				padding: 0,
				boxSizing: 'border-box'
			}}
		>
			<div className="h-14 flex items-center px-4 relative">
				{/* Left: Back + Profile + Athlete Name + Program Position */}
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
					
					{/* Minimize button positioned on sidebar divider */}
					{onOpenAthleteDetails && (
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-[#979795] hover:text-[#f7f6f2] absolute"
							style={{ left: `${minimizeButtonLeft}px` }}
							onClick={onOpenAthleteDetails}
							aria-label={athleteDetailsOpen ? "Hide athlete details" : "Open athlete details"}
							aria-pressed={athleteDetailsOpen}
						>
							{athleteDetailsOpen ? (
								<PanelLeftClose className="h-4 w-4 text-inherit" />
							) : (
								<PanelLeftOpen className="h-4 w-4 text-inherit" />
							)}
						</Button>
					)}
					
					{/* Athlete Name - always visible */}
					{athleteName && (
						<div className="flex items-center gap-2 ml-12">
							<span className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">
								{athleteName}
							</span>
							{programPosition && (
								<Badge variant="outline" className="text-xs font-mono text-[#979795] bg-[#171716] border-[#292928]">
									Program {programPosition.phase}.{programPosition.block}.{programPosition.week}.{programPosition.day}
								</Badge>
							)}
						</div>
					)}
					
					{displayPhaseTitle && (
						<div className="flex items-baseline gap-2">
							{phasePrimaryText && (
								<span className="text-sm text-primary font-semibold">
									{phasePrimaryText}
								</span>
							)}
							{phaseSecondaryText && (
								<span className="text-sm text-[#979795] font-medium">
									{phaseSecondaryText}
								</span>
							)}
						</div>
					)}
				</div>
				{/* Center: Tabs */}
				<div className="flex-1 flex justify-center">
					<Tabs value={currentTab} onValueChange={(v) => onTabChange(v as any)}>
						<TabsList className="bg-transparent p-0 h-14">
							<TabsTrigger
								value="summary"
								className="rounded-none h-14 px-3 data-[state=active]:text-[#f7f6f2] data-[state=active]:border-b-2 data-[state=active]:border-primary"
							>
								Summary
							</TabsTrigger>
							<TabsTrigger
								value="review"
								className="rounded-none h-14 px-3 data-[state=active]:text-[#f7f6f2] data-[state=active]:border-b-2 data-[state=active]:border-primary"
							>
								Review
							</TabsTrigger>
							<TabsTrigger
								value="builder"
								className="rounded-none h-14 px-3 data-[state=active]:text-[#f7f6f2] data-[state=active]:border-b-2 data-[state=active]:border-primary"
							>
								Build
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


