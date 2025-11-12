import { useLocation } from "wouter";
import { Users, Shield } from "lucide-react";
import ReleaseNotes from "@/components/ReleaseNotes";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-surface-base flex">
      {/* Left Panel - Athlete and Coach Views */}
      <div className="flex-1 flex items-center justify-center border-r border-border">
        <div className="flex items-center gap-6">
          {/* Athlete View Card */}
          <button
            onClick={() => setLocation("/home")}
            className="flex flex-col items-center justify-center w-32 h-32 rounded-lg cursor-pointer hover:bg-[#171716] transition-colors duration-200"
            data-testid="card-athlete-view"
          >
            <div className="mb-3 p-3 bg-[#171716] rounded-full">
              <Users className="h-6 w-6 text-[#f7f6f2]" />
            </div>
            <span className="text-sm font-medium text-[#f7f6f2] font-['Montserrat']">Athlete View</span>
          </button>

          {/* Coach View Card */}
          <button
            onClick={() => setLocation("/programs")}
            className="flex flex-col items-center justify-center w-32 h-32 rounded-lg cursor-pointer hover:bg-[#171716] transition-colors duration-200"
            data-testid="card-coach-view"
          >
            <div className="mb-3 p-3 bg-[#171716] rounded-full">
              <Shield className="h-6 w-6 text-[#f7f6f2]" />
            </div>
            <span className="text-sm font-medium text-[#f7f6f2] font-['Montserrat']">Coach View</span>
          </button>
        </div>
      </div>

      {/* Right Panel - Release Notes */}
      <div className="flex-1 flex items-start justify-start p-8">
        <ReleaseNotes />
      </div>
    </div>
  );
}

