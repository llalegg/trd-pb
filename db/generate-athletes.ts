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
const seasons = ["Pre-Season", "In-Season", "Off-Season"] as const;
const subSeasons = ["Early", "Mid", "Late", "General Off-Season (GOS)"] as const;
const statuses = ["draft", "active", "planned", "complete"] as const;
const athleteStatuses = [null, "injured", "rehabbing", "lingering-issues"] as const;

// MLB Teams (30 teams)
const mlbTeams = [
  "Arizona Diamondbacks", "Atlanta Braves", "Baltimore Orioles", "Boston Red Sox", "Chicago Cubs",
  "Chicago White Sox", "Cincinnati Reds", "Cleveland Guardians", "Colorado Rockies", "Detroit Tigers",
  "Houston Astros", "Kansas City Royals", "Los Angeles Angels", "Los Angeles Dodgers", "Miami Marlins",
  "Milwaukee Brewers", "Minnesota Twins", "New York Mets", "New York Yankees", "Oakland Athletics",
  "Philadelphia Phillies", "Pittsburgh Pirates", "San Diego Padres", "San Francisco Giants", "Seattle Mariners",
  "St. Louis Cardinals", "Tampa Bay Rays", "Texas Rangers", "Toronto Blue Jays", "Washington Nationals"
] as const;

// MLB Levels
const mlbLevels = ["MLB", "AAA", "AA", "A", "Rookie"] as const;

// Baseball Positions
const primaryPositions = ["RHP", "LHP", "C", "1B", "2B", "SS", "3B", "OF"] as const;
const secondaryPositions = ["RHP", "LHP", "C", "1B", "2B", "SS", "3B", "OF", null] as const;
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
const random = <T>(arr: readonly T[] | T[]): T => arr[Math.floor(Math.random() * arr.length)];

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

    const season = random(seasons) as Block["season"];
    const blockStatus = i === numBlocks - 1 ? "active" : i < numBlocks - 2 ? "complete" : random(statuses) as Block["status"];
    
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
      subSeason: random(subSeasons) as Block["subSeason"],
      status: blockStatus as Block["status"],
      currentDay: blockStatus === "active" ? { week: randomInt(1, 4), day: randomInt(1, 7) } : undefined,
      throwing: Math.random() > 0.3 ? {
        xRole: random(xRoles) as string,
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
      // Add sign-off status for some blocks (20% have pending sign-off)
      signOffStatus: Math.random() < 0.2 ? "pending" : Math.random() < 0.3 ? "approved" : undefined,
      signOffBy: Math.random() < 0.3 ? `user-${randomInt(1, 5)}` : undefined,
      signOffAt: Math.random() < 0.3 ? daysAgo(randomInt(1, 10)) : undefined,
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
    
    // Generate MLB level
    const level = random(mlbLevels) as string;
    
    // Generate positions
    const primaryPos = random(primaryPositions) as string;
    const secondaryPos = random(secondaryPositions) as string | null;
    
    // Generate team assignment (80% have teams, 20% are Free Agents)
    const hasTeam = Math.random() < 0.8;
    let team: string | undefined;
    let teamLevel: string | undefined;
    
    if (hasTeam) {
      const teamName = random(mlbTeams) as string;
      // Format: "Minnesota Twins (AAA)"
      team = `${teamName} (${level})`;
      teamLevel = level;
    } else {
      team = undefined;
      teamLevel = "Free Agent";
    }
    
    // Add photos for some athletes (using placeholder images - replace with actual URLs)
    const photoUrls = [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=faces",
    ];
    // Assign photos to ~40% of athletes
    const photo = Math.random() < 0.4 ? random(photoUrls) : undefined;
    
    const athlete: Athlete = {
      id: athleteId,
      name,
      photo,
      status: random(athleteStatuses) as Athlete["status"],
      currentPhaseId: phaseId,
      team,
      level: teamLevel,
      primaryPosition: primaryPos,
      secondaryPosition: secondaryPos || undefined,
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

