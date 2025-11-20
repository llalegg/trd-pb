import { type Athlete, type Block, type Phase, type AthleteWithPhase } from "@shared/schema";

// Helper functions for date manipulation
const today = new Date();
today.setHours(0, 0, 0, 0);

const daysAgo = (days: number): string => {
  const date = new Date(today);
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const daysFromNow = (days: number): string => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

// Name pools for generating random athlete names
const firstNames = [
  "Marcus", "Michael", "James", "Alexander", "Ryan", "Ethan", "Noah", "Lucas", "Mason", "Aiden",
  "David", "Thomas", "Christopher", "Daniel", "Matthew", "Joshua", "Andrew", "Joseph", "William", "Benjamin",
  "Samuel", "Robert", "John", "Kevin", "Brian", "Jason", "Justin", "Brandon", "Tyler", "Jonathan",
  "Nathan", "Eric", "Stephen", "Timothy", "Kenneth", "Patrick", "Jeremy", "Sean", "Aaron", "Jesse",
  "Adam", "Zachary", "Jordan", "Kyle", "Bryan", "Connor", "Cameron", "Dylan", "Logan", "Jake",
  "Owen", "Luke", "Jack", "Henry", "Isaac", "Liam", "Mason", "Noah", "Ethan", "Aiden"
];

const lastNames = [
  "Johnson", "Chen", "Rodriguez", "Williams", "Martinez", "Thompson", "Lee", "Kim", "Brown", "Wilson",
  "Davis", "Moore", "Jackson", "Taylor", "Anderson", "Garcia", "Miller", "Jones", "White", "Harris",
  "Martin", "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Walker", "Hall",
  "Allen", "Young", "King", "Wright", "Lopez", "Hill", "Scott", "Green", "Adams", "Baker",
  "Nelson", "Carter", "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans",
  "Edwards", "Collins", "Stewart", "Sanchez", "Morris", "Rogers", "Reed", "Cook", "Morgan", "Bell"
];

// Seasons and sub-seasons
const seasons = ["Pre-Season", "In-Season", "Off-Season", "Redshirt"] as const;
const subSeasons = ["Early", "Mid", "Late", "General Off-Season (GOS)"] as const;
const statuses = ["draft", "active", "planned", "complete"] as const;
const athleteStatuses = [null, "injured", "rehabbing", "lingering-issues"] as const;
const teams = ["Varsity", "JV", "Freshman", "Redshirt", "Transfer"] as const;

// Generate Unsplash photo URL for young male athlete
// Using Unsplash Source API with curated photo IDs for young male athletes/sports
const unsplashPhotoIds = [
  "1507003211169-0a1dd7228f2d", // Young male athlete
  "1531427182901-8c149bcceb19", // Young male portrait
  "1500648767791-00dcc994a43e", // Young male athlete
  "1492562080023-4313ab04b1be", // Young male portrait
  "1506794778202-cad84cf45f1d", // Young male athlete
  "1539571696357-5a69c17a67c6", // Young male portrait
  "1500648767791-00dcc994a43e", // Young male athlete
  "1531427182901-8c149bcceb19", // Young male portrait
  "1507003211169-0a1dd7228f2d", // Young male athlete
  "1492562080023-4313ab04b1be", // Young male portrait
  "1506794778202-cad84cf45f1d", // Young male athlete
  "1539571696357-5a69c17a67c6", // Young male portrait
  "1500648767791-00dcc994a43e", // Young male athlete
  "1531427182901-8c149bcceb19", // Young male portrait
  "1507003211169-0a1dd7228f2d", // Young male athlete
  "1492562080023-4313ab04b1be", // Young male portrait
  "1506794778202-cad84cf45f1d", // Young male athlete
  "1539571696357-5a69c17a67c6", // Young male portrait
  "1500648767791-00dcc994a43e", // Young male athlete
  "1531427182901-8c149bcceb19", // Young male portrait
  "1507003211169-0a1dd7228f2d", // Young male athlete
  "1492562080023-4313ab04b1be", // Young male portrait
  "1506794778202-cad84cf45f1d", // Young male athlete
  "1539571696357-5a69c17a67c6", // Young male portrait
  "1500648767791-00dcc994a43e", // Young male athlete
  "1531427182901-8c149bcceb19", // Young male portrait
  "1507003211169-0a1dd7228f2d", // Young male athlete
  "1492562080023-4313ab04b1be", // Young male portrait
  "1506794778202-cad84cf45f1d", // Young male athlete
  "1539571696357-5a69c17a67c6", // Young male portrait
];

const generatePhotoUrl = (index: number): string => {
  const photoId = unsplashPhotoIds[index % unsplashPhotoIds.length];
  return `https://images.unsplash.com/photo-${photoId}?w=400&h=400&fit=crop&crop=faces&auto=format&q=80`;
};
const xRoles = ["Starter", "Reliever"] as const;
const intensities = ["Low", "Moderate", "High"] as const;
const volumes = ["Low", "Moderate", "High"] as const;
const splits = ["4x2", "3x2", "2x2"] as const;
const emphases = ["Hypertrophy", "Strength", "Power", "Maintenance", "Recovery", "Restorative"] as const;
const variabilities = ["Low", "Medium", "High"] as const;
const schemes = ["Linear", "Undulating"] as const;
const coreEmphases = ["Stability", "Power", "Endurance"] as const;
const adaptations = ["Aerobic", "Anaerobic"] as const;
const methods = ["Continuous", "Interval"] as const;

// Helper to get random element from array
const random = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper to get random number in range
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate a random athlete name
const generateName = (index: number): string => {
  if (index < firstNames.length && index < lastNames.length) {
    return `${firstNames[index]} ${lastNames[index]}`;
  }
  const firstName = random(firstNames);
  const lastName = random(lastNames);
  return `${firstName} ${lastName}`;
};

// Generate blocks for an athlete
const generateBlocks = (
  athleteId: string,
  phaseId: string,
  phaseStartDate: string,
  phaseEndDate: string,
  numBlocks: number
): Block[] => {
  const blocks: Block[] = [];
  const phaseStart = new Date(phaseStartDate);
  const phaseEnd = new Date(phaseEndDate);
  const totalDays = Math.floor((phaseEnd.getTime() - phaseStart.getTime()) / (1000 * 60 * 60 * 24));
  const daysPerBlock = Math.floor(totalDays / numBlocks);

  for (let i = 0; i < numBlocks; i++) {
    const blockStart = new Date(phaseStart);
    blockStart.setDate(blockStart.getDate() + (i * daysPerBlock));
    const blockEnd = new Date(blockStart);
    blockEnd.setDate(blockEnd.getDate() + daysPerBlock - 1);

    const season = random(seasons);
    const blockStatus = i === numBlocks - 1 ? "active" : i < numBlocks - 2 ? "complete" : random(statuses);
    
    const block: Block = {
      id: `block-${athleteId}-${i + 1}`,
      athleteId,
      phaseId,
      blockNumber: i + 1,
      name: `${season} Block ${i + 1}`,
      startDate: blockStart.toISOString().split('T')[0],
      endDate: blockEnd.toISOString().split('T')[0],
      duration: randomInt(4, 6),
      season,
      subSeason: random(subSeasons),
      status: blockStatus as Block["status"],
      currentDay: blockStatus === "active" ? { week: randomInt(1, 4), day: randomInt(1, 7) } : undefined,
      throwing: Math.random() > 0.3 ? {
        xRole: random(xRoles),
        phase: season,
        exclusions: Math.random() > 0.7 ? "None" : undefined,
      } : undefined,
      movement: Math.random() > 0.2 ? {
        intensity: random(intensities),
        volume: random(volumes),
      } : undefined,
      lifting: Math.random() > 0.1 ? {
        split: random(splits),
        emphasis: random(emphases),
        variability: random(variabilities),
        scheme: random(schemes),
      } : undefined,
      conditioning: Math.random() > 0.4 ? {
        coreEmphasis: random(coreEmphases),
        adaptation: random(adaptations),
        method: random(methods),
      } : undefined,
      createdAt: daysAgo(randomInt(30, 180)),
      updatedAt: daysAgo(randomInt(0, 30)),
      lastModification: daysAgo(randomInt(0, 10)),
      lastSubmission: blockStatus === "active" ? daysAgo(randomInt(0, 7)) : undefined,
      nextBlockDue: blockStatus === "active" && i < numBlocks - 1 ? daysFromNow(randomInt(1, 14)) : undefined,
    };

    blocks.push(block);
  }

  return blocks;
};

// Generate seed athletes (60 athletes)
export function generateSeedAthletes(): AthleteWithPhase[] {
  const athletes: AthleteWithPhase[] = [];

  for (let i = 1; i <= 60; i++) {
    const athleteId = `athlete-${i}`;
    const phaseId = `phase-${athleteId}`;
    const name = generateName(i - 1);
    
    // Random phase dates (some in past, some current, some future)
    const phaseStartDaysAgo = randomInt(30, 200);
    const phaseDuration = randomInt(60, 180);
    const phaseStartDate = daysAgo(phaseStartDaysAgo);
    const phaseEndDate = daysFromNow(phaseDuration - phaseStartDaysAgo);
    
    // Determine phase status
    const phaseEnd = new Date(phaseEndDate);
    const phaseStatus = phaseEnd < today ? "complete" : "active";
    
    // Generate 1-4 blocks per athlete
    const numBlocks = randomInt(1, 4);
    const blocks = generateBlocks(athleteId, phaseId, phaseStartDate, phaseEndDate, numBlocks);
    
    const athlete: Athlete = {
      id: athleteId,
      name,
      photo: generatePhotoUrl(i),
      status: random(athleteStatuses),
      currentPhaseId: phaseId,
      team: random(teams),
    };

    const phase: Phase = {
      id: phaseId,
      athleteId,
      phaseNumber: 1,
      startDate: phaseStartDate,
      endDate: phaseEndDate,
      status: phaseStatus,
    };

    athletes.push({
      athlete: {
        ...athlete,
        phases: [phase],
      },
      currentPhase: phase,
      blocks,
    });
  }

  return athletes;
}

