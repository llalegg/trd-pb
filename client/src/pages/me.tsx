import { Camera, User, CreditCard, Calendar, Dumbbell, BookOpenCheck, ChartPie, CalendarDays, Zap, HelpCircle, ChevronRight, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MobileTabBar from "@/components/MobileTabBar";
import { useLocation } from "wouter";

// Mock team data
const teamMembers = [
  { name: "Tyler German", role: "Primary Coach", avatar: null },
  { name: "Isaac Wiley", role: "Secondary Coach", avatar: null },
  { name: "Kyle Crockett", role: "Athlete Support", avatar: null },
  { name: "James Werner", role: "Director of Rehab", avatar: null },
  { name: "Kenny Campbell", role: "Onboarding Specialist", avatar: null },
  { name: "Max Aarons", role: "Physiotherapist", avatar: null },
  { name: "Gavin Montgomery", role: "Content Specialist", avatar: null },
  { name: "Ronald Pena", role: "Parent", avatar: null },
  { name: "Kathryn Pena", role: "Parent", avatar: null },
];

export default function MePage() {
  const [, setLocation] = useLocation();

  const menuItems = [
    { icon: Target, label: "Programs", href: "/program-page" },
    { icon: User, label: "Profile Information", href: "#" },
    { icon: CreditCard, label: "Contacts", href: "#" },
    { icon: Calendar, label: "Schedule", href: "#" },
    { icon: Dumbbell, label: "Equipment", href: "#" },
    { icon: BookOpenCheck, label: "Injury Ledger", href: "#" },
    { icon: ChartPie, label: "Assessment Overview", href: "#" },
    { icon: CalendarDays, label: "History", href: "#" },
    { icon: Zap, label: "Exercises", href: "#" },
    { icon: HelpCircle, label: "Tech Support", href: "#" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="w-8" />
          <h1 className="text-lg font-semibold">Me</h1>
          <div className="w-8" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-5">
        {/* Profile Section */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src="/api/placeholder/96/96" alt="Eleanor Pena" />
              <AvatarFallback className="text-lg">EP</AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-muted border border-border"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">Eleanor Pena</h2>
            <p className="text-sm text-muted-foreground">Princeton, In-Season</p>
          </div>
        </div>

        {/* Team Section */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex-shrink-0 text-center w-28">
                  <Avatar className="w-12 h-12 mx-auto mb-2">
                    <AvatarFallback className="text-xs">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs font-semibold text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-0">
                <Button
                  variant="ghost"
                  className="w-full justify-between p-4 h-auto"
                  onClick={() => {
                    if (item.href === "#") {
                      console.log(`Navigate to ${item.label}`);
                    } else {
                      setLocation(item.href);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-6 w-6 text-muted-foreground" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <MobileTabBar />
    </div>
  );
}


