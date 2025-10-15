import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileTabBar from "@/components/MobileTabBar";
import { useLocation } from "wouter";

export default function MessagesPage() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/athlete-view")} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Messages</h1>
          <div className="w-8" />
        </div>
      </div>
      <div className="p-4 text-muted-foreground">No messages yet.</div>
      <MobileTabBar />
    </div>
  );
}


