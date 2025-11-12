import { Home, MessageCircleMore, SquarePlay, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

type TabKey = "home" | "messages" | "vault" | "me";

interface TabConfig {
  key: TabKey;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  disabled?: boolean;
}

const tabs: TabConfig[] = [
  { key: "home", label: "Home", href: "/home", icon: Home },
  { key: "messages", label: "Messages", href: "/messages", icon: MessageCircleMore, disabled: true },
  { key: "vault", label: "Vault", href: "/vault", icon: SquarePlay, disabled: true },
  { key: "me", label: "Me", href: "/me", icon: User },
];

export default function MobileTabBar() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d0c]">
      <div className="flex gap-6 items-center justify-center px-4 pt-4 pb-4">
        {tabs.map(({ key, label, href, icon: Icon, disabled }) => {
          const active = location === href;
          return (
            <div key={key} className="flex flex-col items-center gap-[6px] flex-1 relative">
              <button
                className={cn(
                  "flex flex-col gap-[6px] items-center justify-center transition-colors",
                  active 
                    ? "text-[#f7f6f2]" 
                    : "text-[#585856] hover:text-[#f7f6f2]",
                  disabled && "opacity-40 cursor-not-allowed"
                )}
                onClick={() => !disabled && setLocation(href)}
                disabled={disabled}
              >
                <Icon className="w-6 h-6" strokeWidth={active ? 2 : 1.5} />
                <span className="text-[10px] font-medium font-['Montserrat'] leading-[1.2]">{label}</span>
              </button>
              {/* Message badge */}
              {key === "messages" && (
                <div className="absolute -top-2 left-1/2 translate-x-2 min-w-[20px] h-5 bg-[#d6c281] rounded-full flex items-center justify-center px-[6px]">
                  <span className="text-xs font-semibold text-black font-['Montserrat'] leading-[1.32]">1</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Home Indicator */}
      <div className="flex items-center justify-center pb-2">
        <div className="w-[139px] h-[5px] bg-[#f7f6f2] rounded-full"></div>
      </div>
    </nav>
  );
}


