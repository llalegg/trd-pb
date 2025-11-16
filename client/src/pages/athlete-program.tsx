import React from "react";
import { useLocation, useParams } from "wouter";
import TopBar from "@/components/athlete-program/TopBar";
import ReviewMode from "@/components/athlete-program/ReviewMode";
import AthleteInfoSidebar from "@/components/blocks/AthleteInfoSidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import type { AthleteWithPhase } from "@shared/schema";
import AddProgram from "@/pages/program-builder";

export default function AthleteProgramPage() {
	const { athleteId } = useParams<{ athleteId: string }>();
	const [, setLocation] = useLocation();

	const [currentTab, setCurrentTab] = React.useState<"summary" | "review" | "builder">("summary");

	// Sync state from URL query params (tab)
	React.useEffect(() => {
		const search = typeof window !== "undefined" ? window.location.search : "";
		const params = new URLSearchParams(search);
		const urlTab = params.get("tab");
		// Support legacy "dashboard" by mapping to "summary"
		if (urlTab === "dashboard") setCurrentTab("summary");
		else if (urlTab === "review" || urlTab === "builder") setCurrentTab(urlTab);
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

	function DashboardView({ athleteId }: { athleteId: string }) {
		return (
			<div className="p-8">
				<h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
				<p className="text-muted-foreground">Dashboard view - Coming soon</p>
				<p className="text-sm text-muted-foreground mt-2">Athlete: {athleteId}</p>
			</div>
		);
	}

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

	function BuilderView({ athleteId }: { athleteId: string }) {
		// Pass header offset to push internal builder header below top bar
		return <AddProgram athleteId={athleteId} headerOffset={56} />;
	}

	// Athlete details drawer state
	const [detailsOpen, setDetailsOpen] = React.useState(false);
	const { data: athletesData = [] } = useQuery<AthleteWithPhase[]>({
		queryKey: ["/api/athletes"],
	});
	const athleteData = React.useMemo(
		() => athletesData.find(a => a.athlete.id === athleteId),
		[athletesData, athleteId]
	);

	return (
		<div className="min-h-screen bg-surface-base font-['Montserrat']">
			<TopBar
				currentTab={currentTab}
				onTabChange={(t) => handleTabChange(t)}
				onBack={() => setLocation("/programs")}
				phaseTitle="Phase 1 (25-26)"
				onOpenAthleteDetails={() => setDetailsOpen(true)}
			/>
			{/* Offset content for fixed top bar height (h-14 => 56px) */}
			<div className="pt-14">
				{currentTab === "summary" && <DashboardView athleteId={athleteId!} />}
				{currentTab === "review" && <ReviewMode athleteId={athleteId!} />}
				{currentTab === "builder" && <BuilderView athleteId={athleteId!} />}
			</div>
			<Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
				<SheetContent side="left" className="p-0 bg-[#0d0d0c] border-r border-[#292928] w-[320px]">
					{athleteData && (
						<AthleteInfoSidebar
							athlete={athleteData.athlete}
							currentPhase={athleteData.currentPhase}
							blocks={athleteData.blocks}
						/>
					)}
				</SheetContent>
			</Sheet>
		</div>
	);
}


