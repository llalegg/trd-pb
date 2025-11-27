import React from "react";
import { useLocation, useParams } from "wouter";
import TopBar from "@/components/athlete-program/TopBar";
import ReviewMode from "@/components/athlete-program/ReviewMode";
import AthleteInfoSidebar from "@/components/blocks/AthleteInfoSidebar";
import SummaryRightSidebar from "@/components/athlete-program/SummaryRightSidebar";
import ProgramTimeline from "@/components/athlete-program/ProgramTimeline";
import DaySnapshot from "@/components/athlete-program/DaySnapshot";
import { useQuery } from "@tanstack/react-query";
import type { AthleteWithPhase } from "@shared/schema";
import AddProgram from "@/pages/program-builder";
import { cn } from "@/lib/utils";

export default function AthleteProgramPage() {
	const { athleteId } = useParams<{ athleteId: string }>();
	const [, setLocation] = useLocation();

	const [location] = useLocation();
	const [currentTab, setCurrentTab] = React.useState<"summary" | "review" | "builder">("summary");

	// Sync state from URL query params (tab)
	React.useEffect(() => {
		const search = typeof window !== "undefined" ? window.location.search : "";
		const params = new URLSearchParams(search);
		const urlTab = params.get("tab");
		// Support legacy "dashboard" by mapping to "summary"
		if (urlTab === "dashboard") setCurrentTab("summary");
		else if (urlTab === "review") setCurrentTab(urlTab);
		else if (urlTab === "builder") setCurrentTab("builder");
		else setCurrentTab("summary");
	}, [location]);

	const updateQuery = (next: Record<string, string | number | null | undefined>) => {
		const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
		Object.entries(next).forEach(([k, v]) => {
			if (v === null || v === undefined || v === "") {
				params.delete(k);
			} else {
				params.set(k, String(v));
			}
		});
		const base = `/programs/${athleteId}`;
		const query = params.toString();
		setLocation(query ? `${base}?${query}` : base);
	};

	const handleTabChange = (tab: string) => {
		// Update local state immediately for responsive UI
		if (tab === "summary" || tab === "review" || tab === "builder") {
			setCurrentTab(tab);
		}
		if (tab === "summary") {
			// Clean URL (no tab param for default)
			updateQuery({ tab: null });
		} else {
			updateQuery({ tab });
		}
	};

	type AllowedTabs = "summary" | "review" | "builder";


	function ReviewView({ athleteId }: { athleteId: string }) {
		return (
			<div className="p-8">
				<h2 className="text-2xl font-semibold mb-4">Review</h2>
				<p className="text-muted-foreground">Block timeline and review - Coming soon</p>
				<p className="text-sm text-muted-foreground mt-2">
					This will show:
				</p>
				<ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
					<li>Block timeline with status</li>
					<li>Performance analytics</li>
					<li>Recent workout logs</li>
					<li>Schedule view</li>
				</ul>
				<p className="text-xs text-muted-foreground mt-6">Athlete: {athleteId}</p>
			</div>
		);
	}

	function BuilderView({ athleteId, sidebarOpen, sidebarWidth }: { athleteId: string; sidebarOpen: boolean; sidebarWidth: number }) {
		// Pass header offset to push internal builder header below top bar
		return <AddProgram athleteId={athleteId} headerOffset={56} sidebarOpen={sidebarOpen} sidebarWidth={sidebarWidth} />;
	}

	// Athlete details drawer state
	const [detailsOpen, setDetailsOpen] = React.useState(true); // Auto-expanded by default
	const detailsPanelWidth = 320;
	
	const { data: athletesData = [] } = useQuery<AthleteWithPhase[]>({
		queryKey: ["/api/athletes"],
	});
	const athleteData = React.useMemo(
		() => athletesData.find(a => a.athlete.id === athleteId),
		[athletesData, athleteId]
	);

	const phaseTitle = athleteData?.currentPhase 
		? `Phase ${athleteData.currentPhase.phaseNumber} (25-'26)`
		: "Phase 1 (25-'26)";

	// Calculate program position
	const programPosition = React.useMemo(() => {
		if (!athleteData) return undefined;
		const currentBlock = athleteData.blocks.find(b => b.status === "active");
		const phaseNum = athleteData.currentPhase?.phaseNumber || 1;
		const blockNum = currentBlock?.blockNumber || 1;
		const week = currentBlock?.currentDay?.week || 1;
		const day = currentBlock?.currentDay?.day || 1;
		return { phase: phaseNum, block: blockNum, week, day };
	}, [athleteData]);

	// State for selected day in timeline
	const today = React.useMemo(() => {
		const d = new Date();
		d.setHours(0, 0, 0, 0);
		return d;
	}, []);
	
	const [selectedDay, setSelectedDay] = React.useState<Date | null>(today);

	// Key events for timeline
	const keyEvents = React.useMemo(() => {
		if (!athleteData) return [];
		const events: Array<{ date: Date; label: string }> = [];
		athleteData.blocks.forEach(block => {
			if (block.nextBlockDue) {
				const dueDate = new Date(block.nextBlockDue);
				dueDate.setHours(0, 0, 0, 0);
				events.push({
					date: dueDate,
					label: "Next block due",
				});
			}
		});
		return events;
	}, [athleteData]);

	return (
		<div className="min-h-screen bg-surface-base font-['Montserrat'] relative">
			<TopBar
				currentTab={currentTab}
				onTabChange={(t) => handleTabChange(t)}
				onBack={() => setLocation("/programs")}
				phaseTitle={phaseTitle}
				onOpenAthleteDetails={() => setDetailsOpen(prev => !prev)}
				athleteDetailsOpen={detailsOpen}
				athleteName={athleteData?.athlete.name}
				programPosition={programPosition}
			/>
			{/* Offset content for fixed top bar height (h-14 => 56px) */}
			<div className="pt-14">
				{currentTab === "summary" && (
					<div className="h-[calc(100vh-3.5rem)] bg-[#0d0d0c] relative">
						{/* Left Sidebar - Athlete Profile */}
						{detailsOpen && (
							<div className="fixed inset-y-0 left-0 z-30 bg-[#0d0d0c] transition-all duration-300 pt-14 w-[320px]">
								{athleteData ? (
									<AthleteInfoSidebar
										athlete={athleteData.athlete}
										currentPhase={athleteData.currentPhase}
										blocks={athleteData.blocks}
									/>
								) : (
									<div className="p-4 text-xs text-[#979795]">Loading athlete details...</div>
								)}
							</div>
						)}
						
						{/* Center - Main Content */}
						<div className={cn(
							"overflow-y-auto transition-all duration-300 px-6 pt-6 space-y-6",
							detailsOpen ? "ml-[320px] mr-[320px]" : "mr-[320px]"
						)}>
							{athleteData && (
								<>
									<ProgramTimeline
										blocks={athleteData.blocks}
										selectedDay={selectedDay}
										onDaySelect={setSelectedDay}
										keyEvents={keyEvents}
									/>
									<DaySnapshot
										selectedDay={selectedDay}
										onLogUpdate={() => {
											// TODO: Implement log update
										}}
										onViewPlan={() => {
											// TODO: Implement view plan
										}}
									/>
								</>
							)}
						</div>

						{/* Right Sidebar - Alerts & Activity */}
						<div className="fixed right-0 top-14 bottom-0 w-[320px] flex-shrink-0 z-30">
							<SummaryRightSidebar />
						</div>
					</div>
				)}
				{currentTab === "review" && <ReviewMode athleteId={athleteId!} />}
				{currentTab === "builder" && <BuilderView athleteId={athleteId!} sidebarOpen={detailsOpen} sidebarWidth={detailsPanelWidth} />}
			</div>
		</div>
	);
}


