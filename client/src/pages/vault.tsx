import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileTabBar from "@/components/MobileTabBar";
import { useLocation } from "wouter";

export default function VaultPage() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-surface-base pb-20">
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/home")} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Vault</h1>
          <div className="w-8" />
        </div>
      </div>
      <div className="p-4 text-muted-foreground">Your saved resources will appear here.</div>
      <MobileTabBar />
    </div>
  );
}


