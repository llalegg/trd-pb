import React from "react";
import { useLocation, useParams } from "wouter";
import TopBar from "@/components/athlete-program/TopBar";
import ReviewMode from "@/components/athlete-program/ReviewMode";
import AthleteInfoSidebar from "@/components/blocks/AthleteInfoSidebar";
import { useQuery } from "@tanstack/react-query";
import type { AthleteWithPhase } from "@shared/schema";
import AddProgram from "@/pages/program-builder";
import HorizontalCalendar from "@/components/coach/HorizontalCalendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
	Activity,
	AlertTriangle,
	ArrowRight,
	CalendarDays,
	CheckCircle2,
	ClipboardList,
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

	type AllowedTabs = "summary" | "review" | "builder";

	function DashboardView({ athleteId, onNavigateTab }: { athleteId: string; onNavigateTab: (tab: AllowedTabs) => void }) {
		const { toast } = useToast();
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

		const summaryStatus = {
			current: "Active",
			weekDayLabel: "Week 3, Day 2",
			daysRemaining: 9,
			nextBlockDate: formatDate(nextBlockDate),
		};

		const metrics = [
			{
				label: "Current program day",
				value: "Week 3, Day 2",
				meta: "Next session scheduled tomorrow",
			},
			{
				label: "Last workout submission",
				value: formatDate(new Date(today.getTime() - 24 * 60 * 60 * 1000)),
				meta: "Uploaded via mobile",
			},
			{
				label: "Compliance rate",
				value: "86%",
				meta: "12 of 14 scheduled workouts",
			},
			{
				label: "Last modification",
				value: formatDate(new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)),
				meta: "Coach Rivera",
			},
		];

		const alerts = [
			{
				title: "Blocks needing sign-off",
				detail: "Block 2 ready for review",
				severity: "warning" as const,
				actionLabel: "Review block",
				action: () => onNavigateTab("review"),
			},
			{
				title: "Missing workout data",
				detail: "2 sets awaiting results",
				severity: "info" as const,
				actionLabel: "Enter results",
				action: () =>
					toast({
						title: "Enter results",
						description: "This opens the performance intake modal in the next release.",
					}),
			},
			{
				title: "Injury / rehab alert",
				detail: "Left shoulder flagged during warm-up",
				severity: "critical" as const,
				actionLabel: "Log update",
				action: () =>
					toast({
						title: "Rehab tracker coming soon",
						description: "You'll be able to log medical updates here shortly.",
					}),
			},
			{
				title: "Upcoming assessment",
				detail: `Movement screen on ${formatDate(new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000))}`,
				severity: "info" as const,
				actionLabel: "View plan",
				action: () =>
					toast({
						title: "Assessment flow",
						description: "Assessment scheduling will surface here.",
					}),
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

		const quickActions = [
			{
				id: "review",
				label: "Review Performance",
				description: "Jump to review tab",
				action: () => onNavigateTab("review"),
			},
			{
				id: "builder",
				label: "Edit Current Block",
				description: "Jump to builder tab",
				action: () => onNavigateTab("builder"),
			},
			{
				id: "signoff",
				label: "Sign Off & Send Next Block",
				description: "Open sign-off modal",
				action: () =>
					toast({
						title: "Sign-off modal",
						description: "Sign-off workflow is being wired up next.",
					}),
			},
			{
				id: "missing-data",
				label: "Enter Missing Data",
				description: "Log outstanding results",
				action: () =>
					toast({
						title: "Enter results",
						description: "Modal shortcut connects to Enter Results flow.",
					}),
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
				<div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
					<Card className="bg-[#090908] border-[#2a2a28]">
						<CardHeader className="flex flex-col gap-4">
							<div className="flex items-center justify-between gap-4">
								<div>
									<CardTitle className="text-base text-white">Status Card</CardTitle>
									<CardDescription className="text-xs text-muted-foreground">
										Chat for summary updates
									</CardDescription>
								</div>
								<Badge className="text-xs px-3 py-1 bg-[#16a34a]/20 text-[#4ade80]" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
									{summaryStatus.current}
								</Badge>
							</div>
							<div className="flex flex-wrap gap-2">
								{["Active", "Pending Sign-off", "Complete"].map(status => (
									<div
										key={status}
										className={`rounded-full px-3 py-1 text-xs border ${
											status === summaryStatus.current
												? "border-[#16a34a]/50 text-[#4ade80] bg-[#122318]"
												: "border-[#2d2d2b] text-[#6b6b69]"
										}`}
									>
										{status}
									</div>
								))}
							</div>
						</CardHeader>
						<CardContent className="grid gap-4 sm:grid-cols-2">
							<div className="rounded-xl border border-[#2a2a28] bg-[#0f0f0f] p-4">
								<p className="text-xs text-muted-foreground">Current week / day</p>
								<p className="mt-2 text-lg font-semibold text-white">{summaryStatus.weekDayLabel}</p>
							</div>
							<div className="rounded-xl border border-[#2a2a28] bg-[#0f0f0f] p-4">
								<p className="text-xs text-muted-foreground">Days until block ends</p>
								<p className="mt-2 text-lg font-semibold text-white">{summaryStatus.daysRemaining} days</p>
							</div>
							<div className="rounded-xl border border-[#2a2a28] bg-[#0f0f0f] p-4">
								<p className="text-xs text-muted-foreground">Next block due date</p>
								<p className="mt-2 text-lg font-semibold text-white">{summaryStatus.nextBlockDate}</p>
							</div>
							<div className="rounded-xl border border-[#2a2a28] bg-[#0f0f0f] p-4">
								<p className="text-xs text-muted-foreground">Athlete</p>
								<p className="mt-2 text-lg font-semibold text-white">#{athleteId}</p>
							</div>
						</CardContent>
					</Card>
					<Card className="bg-[#090908] border-[#2a2a28]">
						<CardHeader>
							<CardTitle className="text-base text-white">Key Metrics (At-a-Glance)</CardTitle>
							<CardDescription>High-signal program vitals</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{metrics.map(metric => (
								<div key={metric.label} className="rounded-lg border border-[#2a2a28] bg-[#0d0d0c] p-3">
									<p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</p>
									<div className="mt-1 flex items-center justify-between">
										<p className="text-xl font-semibold text-white">{metric.value}</p>
										{metric.label === "Compliance rate" ? (
											<Badge className="bg-[#17202c] text-[#38bdf8]" icon={<Activity className="h-3.5 w-3.5" />}>
												{metric.meta}
											</Badge>
										) : (
											<span className="text-xs text-muted-foreground">{metric.meta}</span>
										)}
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				</div>

				<div className="grid gap-4 lg:grid-cols-[1fr,1.4fr]">
					<Card className="bg-[#090908] border-[#2a2a28]">
						<CardHeader>
							<CardTitle className="text-base text-white">Alerts &amp; Notifications</CardTitle>
							<CardDescription>Stay ahead of pending tasks</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{alerts.map(alert => (
								<div key={alert.title} className="flex items-start justify-between gap-3 rounded-xl border border-[#2a2a28] bg-[#0d0d0c] p-4">
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
									<Button size="sm" variant="outline" className="text-xs" onClick={alert.action}>
										{alert.actionLabel}
										<ArrowRight className="ml-1.5 h-3 w-3" />
									</Button>
								</div>
							))}
						</CardContent>
					</Card>

					<Card className="bg-[#090908] border-[#2a2a28]">
						<CardHeader>
							<CardTitle className="text-base text-white">Recent Activity Feed</CardTitle>
							<CardDescription>Last five updates across the block</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{activityFeed.map(item => (
								<div key={`${item.title}-${item.timestamp}`} className="flex gap-3 rounded-xl border border-[#2a2a28] bg-[#0f0f0f] p-3">
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

				<div className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
					<Card className="bg-[#090908] border-[#2a2a28]">
						<CardHeader>
							<CardTitle className="text-base text-white">Quick Actions</CardTitle>
							<CardDescription>One-tap workflows</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-3 sm:grid-cols-2">
							{quickActions.map(action => (
								<div key={action.id} className="rounded-xl border border-[#2a2a28] bg-[#0f0f0f] p-4">
									<p className="text-sm font-medium text-white">{action.label}</p>
									<p className="mt-1 text-xs text-muted-foreground">{action.description}</p>
									<Button size="sm" className="mt-3 w-full" variant="secondary" onClick={action.action}>
										{action.label.includes("Enter") ? <ClipboardList className="mr-2 h-4 w-4" /> : <ArrowRight className="mr-2 h-4 w-4" />}
										Go
									</Button>
								</div>
							))}
						</CardContent>
					</Card>

					<Card className="bg-[#090908] border-[#2a2a28]">
						<CardHeader>
							<CardTitle className="text-base text-white">Program Timeline</CardTitle>
							<CardDescription>Current week and upcoming blocks</CardDescription>
						</CardHeader>
						<CardContent className="-mt-4">
							<HorizontalCalendar
								startDate={today}
								endDate={endDate}
								blocks={[]}
								activePrograms={[]}
								selectedAthletePhaseEndDate={null}
							/>
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

	function BuilderView({ athleteId }: { athleteId: string }) {
		// Pass header offset to push internal builder header below top bar
		return <AddProgram athleteId={athleteId} headerOffset={56} />;
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
					<div className="pt-14 h-full">
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
				{currentTab === "summary" && <DashboardView athleteId={athleteId!} onNavigateTab={handleTabChange} />}
				{currentTab === "review" && <ReviewMode athleteId={athleteId!} />}
				{currentTab === "builder" && <BuilderView athleteId={athleteId!} />}
			</div>
		</div>
	);
}


