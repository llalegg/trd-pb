import { Home, MessageCircle, Lock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

type TabKey = "home" | "messages" | "vault" | "me";

const tabs: Array<{ key: TabKey; label: string; href: string; icon: any; disabled?: boolean }> = [
  { key: "home", label: "Home", href: "/home", icon: Home },
  { key: "messages", label: "Messages", href: "/messages", icon: MessageCircle, disabled: true },
  { key: "vault", label: "Vault", href: "/vault", icon: Lock, disabled: true },
  { key: "me", label: "Me", href: "/me", icon: User },
];

export default function MobileTabBar() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-zinc-950 z-50">
      <div className="grid grid-cols-4 h-16">
        {tabs.map(({ key, label, href, icon: Icon, disabled }) => {
          const active = location === href;
          return (
            <button
              key={key}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs",
                active ? "text-foreground" : "text-muted-foreground",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => !disabled && setLocation(href)}
              disabled={disabled}
            >
              <Icon className={cn("h-5 w-5", active && "text-primary")} />
              <span className="leading-none">{label}</span>
            </button>
          );
        })}
      </div>
      {/* iOS home indicator padding */}
      <div className="h-3" />
    </nav>
  );
}


