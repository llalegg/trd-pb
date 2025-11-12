const VERSION = "1.0.0";

const RELEASE_NOTES = [
  {
    version: "1.0.0",
    date: "2024-01-15",
    updates: [
      "Initial prototype release",
      "Athlete view with session tracking",
      "Coach view with program management",
      "Exercise execution interface",
      "Focus view for exercise demonstrations",
    ],
  },
];

export default function ReleaseNotes() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[#f7f6f2] mb-2 font-mono">
          Release Notes
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          {RELEASE_NOTES.map((release, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#f7f6f2] font-mono">
                  v{release.version}
                </span>
                <span className="text-xs text-[#f7f6f2] opacity-50 font-mono">
                  {release.date}
                </span>
              </div>
              <ul className="list-none space-y-1 ml-0">
                {release.updates.map((update, updateIndex) => (
                  <li
                    key={updateIndex}
                    className="text-xs text-[#f7f6f2] opacity-80 font-mono"
                  >
                    • {update}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

