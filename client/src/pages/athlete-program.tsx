import React from "react";
import { useLocation, useParams } from "wouter";
import TopBar from "@/components/athlete-program/TopBar";
import ReviewMode from "@/components/athlete-program/ReviewMode";
import AthleteInfoSidebar from "@/components/blocks/AthleteInfoSidebar";
import { useQuery } from "@tanstack/react-query";
import type { AthleteWithPhase } from "@shared/schema";
import AddProgram from "@/pages/program-builder";
import HorizontalCalendar from "@/components/coach/HorizontalCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Activity,
	AlertTriangle,
	ArrowRight,
	CalendarDays,
	CheckCircle2,
	Clock8,
	MessageSquareMore,
	TrendingUp,
} from "lucide-react";

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

	function DashboardView({
		athleteId,
		athleteName,
		onNavigateTab,
	}: {
		athleteId: string;
		athleteName?: string | null;
		onNavigateTab: (tab: AllowedTabs) => void;
	}) {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const endDate = new Date(today);
		endDate.setDate(endDate.getDate() + 60);
		const nextBlockDate = new Date(today);
		nextBlockDate.setDate(nextBlockDate.getDate() + 12);

		const formatDate = (date: Date) =>
			date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			});

		const adjustDate = (offset: number) => {
			const date = new Date(today);
			date.setDate(date.getDate() + offset);
			return date;
		};

		const summaryStatus = {
			current: "Active",
			weekDayLabel: "Week 3, Day 2",
			daysRemaining: 9,
			nextBlockDate: formatDate(nextBlockDate),
		};

		const summaryHighlights = [
			{
				label: "Current week / day",
				value: summaryStatus.weekDayLabel,
			},
			{
				label: "Days until block ends",
				value: `${summaryStatus.daysRemaining} days`,
			},
			{
				label: "Next block due date",
				value: summaryStatus.nextBlockDate,
			},
			{
				label: "Athlete",
				value: athleteName ?? `#${athleteId}`,
			},
		];

		const programTimelineStart = adjustDate(-7);
		const programTimelineEnd = adjustDate(45);
		const calendarBlocks = [
			{
				name: "Current block",
				startDate: adjustDate(-7),
				endDate: adjustDate(14),
			},
			{
				name: "Next block",
				startDate: adjustDate(15),
				endDate: adjustDate(42),
			},
		];
		const calendarPrograms = [
			{
				programId: "phase-1",
				startDate: programTimelineStart,
				endDate: programTimelineEnd,
			},
		];
		const calendarKeyEvents = [
			{
				date: adjustDate(4),
				label: "Movement assessment",
				tone: "info" as const,
			},
			{
				date: nextBlockDate,
				label: "Next block due",
				tone: "warning" as const,
			},
		];

		const alerts = [
			{
				title: "Missing workout data",
				detail: "2 sets awaiting results",
				severity: "info" as const,
				actionLabel: "Enter results",
				action: () => {
					// TODO: Implement performance intake modal
				},
			},
			{
				title: "Injury / rehab alert",
				detail: "Left shoulder flagged during warm-up",
				severity: "critical" as const,
				actionLabel: "Log update",
				action: () => {
					// TODO: Implement rehab tracker
				},
			},
			{
				title: "Upcoming assessment",
				detail: `Movement screen on ${formatDate(new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000))}`,
				severity: "info" as const,
				actionLabel: "View plan",
				action: () => {
					// TODO: Implement assessment scheduling
				},
			},
		];

		const activityFeed = [
			{
				type: "workout" as const,
				title: "Workout submitted",
				detail: "Full Body Strength — 5x5 completed at RPE 8",
				timestamp: "Today · 07:42",
			},
			{
				type: "performance" as const,
				title: "Performance update",
				detail: "Vertical jump up +2.5\" vs last block",
				timestamp: "Yesterday · 18:10",
			},
			{
				type: "coach" as const,
				title: "Coach note",
				detail: "Dial back overhead pressing volume if shoulder flare persists.",
				timestamp: "Yesterday · 12:35",
			},
			{
				type: "workout" as const,
				title: "Workout submitted",
				detail: "Tempo Run — pacing within 5% target.",
				timestamp: "Mon · 19:05",
			},
			{
				type: "coach" as const,
				title: "Comment added",
				detail: "Added contrast sets to Friday lift; confirm readiness.",
				timestamp: "Sun · 09:18",
			},
		];

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

		return (
			<div className="p-6 space-y-6">
				<div className="grid gap-3 lg:grid-cols-5">
					<Card className="p-4 text-[#4ade80] flex items-center justify-center">
						<div className="flex items-center gap-2 text-lg font-semibold">
							<CheckCircle2 className="h-5 w-5" />
							<span>{summaryStatus.current}</span>
						</div>
					</Card>
					{summaryHighlights.map(card => (
						<Card key={card.label} className="p-4">
							<p className="text-xs text-muted-foreground">{card.label}</p>
							<p className="mt-2 text-base font-semibold text-white">{card.value}</p>
						</Card>
					))}
				</div>

				<Card>
					<CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between px-4 pt-4 pb-0">
						<CardTitle>Program timeline</CardTitle>
						<span className="text-xs text-muted-foreground">
							{programTimelineStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })} –{" "}
							{programTimelineEnd.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
						</span>
					</CardHeader>
					<CardContent className="p-0">
						<HorizontalCalendar
							startDate={programTimelineStart}
							endDate={programTimelineEnd}
							blocks={calendarBlocks}
							activePrograms={calendarPrograms}
							selectedAthletePhaseEndDate={null}
							keyEvents={calendarKeyEvents}
						/>
					</CardContent>
				</Card>

				<div className="grid gap-4 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Alerts &amp; notifications</CardTitle>
						</CardHeader>
						<CardContent className="space-y-0">
							{alerts.map(alert => (
								<div key={alert.title} className="flex items-start justify-between gap-3 py-3 border-b border-[#2a2a28] last:border-b-0">
									<div>
										<div className="flex items-center gap-2">
											<div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${getAlertAccent(alert.severity)}`}>
												{alert.severity === "critical" && <AlertTriangle className="h-3 w-3" />}
												{alert.severity === "warning" && <Clock8 className="h-3 w-3" />}
												{alert.severity === "info" && <CalendarDays className="h-3 w-3" />}
												{alert.title}
											</div>
										</div>
										<p className="mt-2 text-sm text-muted-foreground">{alert.detail}</p>
									</div>
									<Button size="sm" variant="secondary" className="text-xs" onClick={alert.action}>
										{alert.actionLabel}
										<ArrowRight className="ml-1.5 h-3 w-3" />
									</Button>
								</div>
							))}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Recent activity feed</CardTitle>
						</CardHeader>
						<CardContent className="space-y-0">
							{activityFeed.map(item => (
								<div key={`${item.title}-${item.timestamp}`} className="flex gap-3 py-3 border-b border-[#2a2a28] last:border-b-0 last:pb-0 first:pt-0">
									{renderActivityIcon(item.type)}
									<div className="flex-1">
										<div className="flex flex-wrap items-center justify-between gap-2">
											<p className="text-sm font-medium text-white">{item.title}</p>
											<span className="text-xs text-muted-foreground">{item.timestamp}</span>
										</div>
										<p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				</div>
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

	function BuilderView({ athleteId, sidebarOpen, sidebarWidth }: { athleteId: string; sidebarOpen: boolean; sidebarWidth: number }) {
		// Pass header offset to push internal builder header below top bar
		return <AddProgram athleteId={athleteId} headerOffset={56} sidebarOpen={sidebarOpen} sidebarWidth={sidebarWidth} />;
	}

	// Athlete details drawer state
	const [detailsOpen, setDetailsOpen] = React.useState(false);
const detailsPanelWidth = 320;
	const { data: athletesData = [] } = useQuery<AthleteWithPhase[]>({
		queryKey: ["/api/athletes"],
	});
	const athleteData = React.useMemo(
		() => athletesData.find(a => a.athlete.id === athleteId),
		[athletesData, athleteId]
	);

	return (
		<div className="min-h-screen bg-surface-base font-['Montserrat'] relative">
			<TopBar
				currentTab={currentTab}
				onTabChange={(t) => handleTabChange(t)}
				onBack={() => setLocation("/programs")}
				phaseTitle="Phase 1 (25-'26)"
				onOpenAthleteDetails={() => setDetailsOpen(prev => !prev)}
				leftOffset={detailsOpen ? detailsPanelWidth : 0}
				athleteDetailsOpen={detailsOpen}
			/>
			{detailsOpen && (
				<div
					className="fixed inset-y-0 left-0 z-40 bg-[#0d0d0c]"
					style={{ width: detailsPanelWidth }}
				>
					<div className="h-full">
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
				</div>
			)}
			{/* Offset content for fixed top bar height (h-14 => 56px) */}
			<div className="pt-14 transition-[margin-left] duration-300" style={{ marginLeft: detailsOpen ? detailsPanelWidth : 0 }}>
				{currentTab === "summary" && (
					<DashboardView athleteId={athleteId!} athleteName={athleteData?.athlete.name} onNavigateTab={handleTabChange} />
				)}
				{currentTab === "review" && <ReviewMode athleteId={athleteId!} />}
				{currentTab === "builder" && <BuilderView athleteId={athleteId!} sidebarOpen={detailsOpen} sidebarWidth={detailsPanelWidth} />}
			</div>
		</div>
	);
}


