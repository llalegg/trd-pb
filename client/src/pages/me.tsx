import { Camera, User, CreditCard, Calendar, Dumbbell, BookOpenCheck, ChartPie, CalendarDays, Zap, HelpCircle, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MobileTabBar from "@/components/MobileTabBar";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

// Mock team data
const teamMembers = [
  { name: "Alex Johnson", role: "Primary Coach", avatar: null, initials: "AJ" },
  { name: "Samuel Martin", role: "Secondary Coach", avatar: null, initials: "SM" },
  { name: "David Chen", role: "Athlete Support", avatar: null, initials: "DC" },
  { name: "Ethan Liu", role: "Director of Rehab", avatar: null, initials: "EL" },
  { name: "Michael Brown", role: "Onboarding Specialist", avatar: null, initials: "MB" },
  { name: "James Kim", role: "Physiotherapist", avatar: null, initials: "JK" },
  { name: "Daniel Taylor", role: "Content Specialist", avatar: null, initials: "DT" },
  { name: "Ryan Davis", role: "Parent", avatar: null, initials: "RD" },
  { name: "Ethan Wright", role: "Parent", avatar: null, initials: "EW" },
];

export default function MePage() {
  const [, setLocation] = useLocation();

  const menuItems = [
    { icon: User, label: "Profile Information", href: "#" },
    { icon: CreditCard, label: "Contacts", href: "#" },
  ];

  const additionalItems = [
    { icon: FileText, label: "Program", href: "/athlete/program" },
    { icon: Calendar, label: "Schedule", href: "#" },
    { icon: Dumbbell, label: "Equipment", href: "#" },
    { icon: BookOpenCheck, label: "Injury Ledger", href: "#" },
    { icon: ChartPie, label: "Assessment Overview", href: "#" },
    { icon: CalendarDays, label: "History", href: "#" },
    { icon: Zap, label: "Exercises", href: "#" },
  ];

  const techSupportItem = [
    { icon: HelpCircle, label: "Tech Support", href: "#" },
  ];

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Content */}
      <div className="px-4 py-5 space-y-5 pb-32">
        {/* Profile Section */}
        <div className="flex items-center gap-5 relative">
          <Avatar className="w-24 h-24 border border-white/10">
            <AvatarImage src="/api/placeholder/96/96" alt="Owen Martinez" />
            <AvatarFallback className="text-lg bg-[#1C1C1B]">OM</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">Owen Martinez</h2>
            <p className="text-sm text-muted-foreground">Princeton, In-Season</p>
          </div>
          <Button
            size="sm"
            className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-[#1C1C1B] border border-white/10"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>

        {/* Team Section - Performance & Access Team */}
        <div className="bg-[#1C1C1B] rounded-lg px-4 py-2">
          <div className="flex gap-8 overflow-x-auto pb-2">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex-shrink-0 text-center w-28">
                <Avatar className="w-12 h-12 mx-auto mb-2 border border-white/10">
                  <AvatarFallback className="text-xs bg-[#1C1C1B]">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs font-semibold text-foreground leading-tight">{member.name}</p>
                <p className="text-xs text-muted-foreground leading-tight">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Menu Items - First List */}
        <div className="bg-[#1C1C1B] rounded-lg overflow-hidden">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-between px-4 py-2",
                index < menuItems.length - 1 && "border-b border-neutral-700"
              )}
            >
              <Button
                variant="ghost"
                className="w-full justify-between px-0 h-auto hover:bg-transparent"
                onClick={() => {
                  if (item.href !== "#") {
                    setLocation(item.href);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-6 w-6 text-muted-foreground" />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>

        {/* Additional Items - Second List */}
        <div className="bg-[#1C1C1B] rounded-lg overflow-hidden">
          {additionalItems.map((item, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-between px-4 py-2",
                index < additionalItems.length - 1 && "border-b border-neutral-700"
              )}
            >
              <Button
                variant="ghost"
                className="w-full justify-between px-0 h-auto hover:bg-transparent"
                onClick={() => {
                  if (item.href !== "#") {
                    setLocation(item.href);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-6 w-6 text-muted-foreground" />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>

        {/* Tech Support - Third List */}
        <div className="bg-[#1C1C1B] rounded-lg overflow-hidden">
          {techSupportItem.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-2"
            >
              <Button
                variant="ghost"
                className="w-full justify-between px-0 h-auto hover:bg-transparent"
                onClick={() => {
                  if (item.href !== "#") {
                    setLocation(item.href);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-6 w-6 text-muted-foreground" />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <MobileTabBar />
    </div>
  );
}


