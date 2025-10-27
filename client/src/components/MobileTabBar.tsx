import { Home, MessageCircleMore, SquarePlay, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

type TabKey = "home" | "messages" | "vault" | "me";

const tabs: Array<{ key: TabKey; label: string; href: string; icon: any; disabled?: boolean }> = [
  { key: "home", label: "Home", href: "/home", icon: Home },
  { key: "messages", label: "Messages", href: "/messages", icon: MessageCircleMore, disabled: true },
  { key: "vault", label: "Vault", href: "/vault", icon: SquarePlay, disabled: true },
  { key: "me", label: "Me", href: "/me", icon: User },
];

export default function MobileTabBar() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-950">
      <div className="flex gap-6 items-center justify-center px-4 pt-4 pb-4">
        {tabs.map(({ key, label, href, icon: Icon, disabled }) => {
          const active = location === href;
          return (
            <button
              key={key}
              className={cn(
                "flex flex-col gap-1.5 items-center justify-center grow transition-colors",
                active 
                  ? "text-foreground" 
                  : "text-[#585856] hover:text-foreground",
                disabled && "opacity-40 cursor-not-allowed"
              )}
              onClick={() => !disabled && setLocation(href)}
              disabled={disabled}
            >
              <Icon className="h-6 w-6" strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px] leading-[1.2] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
      {/* iOS home indicator area */}
      <div className="h-4 bg-neutral-950" />
    </nav>
  );
}


