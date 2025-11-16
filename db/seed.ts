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

// Generate mock athlete-centric data with new Block and Phase structure
export function generateSeedAthletes(): AthleteWithPhase[] {
  const athletes: AthleteWithPhase[] = [];

  // Athlete 1: Marcus Johnson - Phase 1 with 2 blocks
  const phase1Id = "phase-athlete-1";
  const phase1StartDate = daysAgo(60);
  const phase1EndDate = daysFromNow(30);
  
  const block1_1: Block = {
    id: "block-1-1",
    athleteId: "athlete-1",
    phaseId: phase1Id,
    blockNumber: 1,
    name: "Pre-Season Block 1",
    startDate: daysAgo(60),
    endDate: daysAgo(32),
    duration: 4,
    season: "Pre-Season",
    subSeason: "Early",
    status: "complete",
    currentDay: { week: 4, day: 7 },
    throwing: {
      xRole: "Starter",
      phase: "Pre-Season",
      exclusions: "None",
    },
    movement: {
      intensity: "Moderate",
      volume: "High",
    },
    lifting: {
      split: "4x2",
      emphasis: "Strength",
      variability: "Low",
      scheme: "Linear",
    },
    conditioning: {
      coreEmphasis: "Stability",
      adaptation: "Aerobic",
      method: "Continuous",
    },
    createdAt: daysAgo(65),
    updatedAt: daysAgo(32),
    lastModification: daysAgo(33),
  };

  const block1_2: Block = {
    id: "block-1-2",
    athleteId: "athlete-1",
    phaseId: phase1Id,
    blockNumber: 2,
    name: "Pre-Season Block 2",
    startDate: daysAgo(32),
    endDate: daysFromNow(2),
    duration: 5,
    season: "Pre-Season",
    subSeason: "Mid",
    status: "active",
    currentDay: { week: 4, day: 5 },
    throwing: {
      xRole: "Starter",
      phase: "Pre-Season",
    },
    movement: {
      intensity: "High",
      volume: "Moderate",
    },
    lifting: {
      split: "3x2",
      emphasis: "Power",
      variability: "Medium",
      scheme: "Undulating",
    },
    conditioning: {
      coreEmphasis: "Power",
      adaptation: "Anaerobic",
      method: "Interval",
    },
    createdAt: daysAgo(35),
    updatedAt: daysAgo(1),
    lastModification: daysAgo(2),
  };

  athletes.push({
    athlete: {
      id: "athlete-1",
      name: "Marcus Johnson",
      photo: undefined,
      status: null,
      currentPhaseId: phase1Id,
      phases: [
        {
          id: phase1Id,
          athleteId: "athlete-1",
          phaseNumber: 1,
          startDate: phase1StartDate,
          endDate: phase1EndDate,
          status: "active",
        },
      ],
    },
    currentPhase: {
      id: phase1Id,
      athleteId: "athlete-1",
      phaseNumber: 1,
      startDate: phase1StartDate,
      endDate: phase1EndDate,
      status: "active",
    },
    blocks: [block1_1, block1_2],
  });

  // Athlete 2: Samuel Chen - Phase 1 with 3 blocks
  const phase2Id = "phase-athlete-2";
  const phase2StartDate = daysAgo(90);
  const phase2EndDate = daysFromNow(30);

  const block2_1: Block = {
    id: "block-2-1",
    athleteId: "athlete-2",
    phaseId: phase2Id,
    blockNumber: 1,
    name: "Pre-Season Block 1",
    startDate: daysAgo(90),
    endDate: daysAgo(62),
    duration: 4,
    season: "Pre-Season",
    subSeason: "Early",
    status: "complete",
    currentDay: { week: 4, day: 7 },
    lifting: {
      split: "4x2",
      emphasis: "Hypertrophy",
      variability: "Low",
      scheme: "Linear",
    },
    createdAt: daysAgo(95),
    updatedAt: daysAgo(62),
    lastModification: daysAgo(63),
  };

  const block2_2: Block = {
    id: "block-2-2",
    athleteId: "athlete-2",
    phaseId: phase2Id,
    blockNumber: 2,
    name: "In-Season Block 1",
    startDate: daysAgo(62),
    endDate: daysAgo(34),
    duration: 4,
    season: "In-Season",
    subSeason: "Early",
    status: "complete",
    currentDay: { week: 4, day: 7 },
    throwing: {
      xRole: "Reliever",
      phase: "In-Season",
    },
    movement: {
      intensity: "Moderate",
      volume: "Moderate",
    },
    lifting: {
      split: "3x2",
      emphasis: "Maintenance",
      variability: "Medium",
      scheme: "Undulating",
    },
    createdAt: daysAgo(65),
    updatedAt: daysAgo(34),
    lastModification: daysAgo(35),
  };

  const block2_3: Block = {
    id: "block-2-3",
    athleteId: "athlete-2",
    phaseId: phase2Id,
    blockNumber: 3,
    name: "In-Season Block 2",
    startDate: daysAgo(34),
    endDate: daysFromNow(2),
    duration: 5,
    season: "In-Season",
    subSeason: "Mid",
    status: "active",
    currentDay: { week: 4, day: 3 },
    throwing: {
      xRole: "Reliever",
      phase: "In-Season",
    },
    movement: {
      intensity: "Moderate",
      volume: "Low",
    },
    lifting: {
      split: "2x2",
      emphasis: "Restorative",
      variability: "High",
      scheme: "Undulating",
    },
    conditioning: {
      coreEmphasis: "Endurance",
      adaptation: "Aerobic",
      method: "Continuous",
    },
    createdAt: daysAgo(37),
    updatedAt: daysAgo(1),
    lastModification: daysAgo(2),
  };

  athletes.push({
    athlete: {
      id: "athlete-2",
      name: "Samuel Chen",
      photo: undefined,
      status: null,
      currentPhaseId: phase2Id,
      phases: [
        {
          id: phase2Id,
          athleteId: "athlete-2",
          phaseNumber: 1,
          startDate: phase2StartDate,
          endDate: phase2EndDate,
          status: "active",
        },
      ],
    },
    currentPhase: {
      id: phase2Id,
      athleteId: "athlete-2",
      phaseNumber: 1,
      startDate: phase2StartDate,
      endDate: phase2EndDate,
      status: "active",
    },
    blocks: [block2_1, block2_2, block2_3],
  });

  // Athlete 3: James Rodriguez - Phase 1 with 4 blocks
  const phase3Id = "phase-athlete-3";
  const phase3StartDate = daysAgo(120);
  const phase3EndDate = daysFromNow(30);

  const block3_1: Block = {
    id: "block-3-1",
    athleteId: "athlete-3",
    phaseId: phase3Id,
    blockNumber: 1,
    name: "Pre-Season Block 1",
    startDate: daysAgo(120),
    endDate: daysAgo(92),
    duration: 4,
    season: "Pre-Season",
    subSeason: "Early",
    status: "complete",
    currentDay: { week: 4, day: 7 },
    throwing: {
      xRole: "Starter",
      phase: "Pre-Season",
    },
    movement: {
      intensity: "Low",
      volume: "High",
    },
    lifting: {
      split: "4x2",
      emphasis: "Hypertrophy",
      variability: "Low",
      scheme: "Linear",
    },
    conditioning: {
      coreEmphasis: "Stability",
      adaptation: "Aerobic",
      method: "Continuous",
    },
    createdAt: daysAgo(125),
    updatedAt: daysAgo(92),
    lastModification: daysAgo(93),
  };

  const block3_2: Block = {
    id: "block-3-2",
    athleteId: "athlete-3",
    phaseId: phase3Id,
    blockNumber: 2,
    name: "Pre-Season Block 2",
    startDate: daysAgo(92),
    endDate: daysAgo(64),
    duration: 4,
    season: "Pre-Season",
    subSeason: "Mid",
    status: "complete",
    currentDay: { week: 4, day: 7 },
    throwing: {
      xRole: "Starter",
      phase: "Pre-Season",
    },
    movement: {
      intensity: "Moderate",
      volume: "High",
    },
    lifting: {
      split: "4x2",
      emphasis: "Strength",
      variability: "Low",
      scheme: "Linear",
    },
    createdAt: daysAgo(95),
    updatedAt: daysAgo(64),
    lastModification: daysAgo(65),
  };

  const block3_3: Block = {
    id: "block-3-3",
    athleteId: "athlete-3",
    phaseId: phase3Id,
    blockNumber: 3,
    name: "In-Season Block 1",
    startDate: daysAgo(64),
    endDate: daysAgo(36),
    duration: 4,
    season: "In-Season",
    subSeason: "Early",
    status: "complete",
    currentDay: { week: 4, day: 7 },
    throwing: {
      xRole: "Starter",
      phase: "In-Season",
    },
    movement: {
      intensity: "Moderate",
      volume: "Moderate",
    },
    lifting: {
      split: "3x2",
      emphasis: "Power",
      variability: "Medium",
      scheme: "Undulating",
    },
    conditioning: {
      coreEmphasis: "Power",
      adaptation: "Anaerobic",
      method: "Interval",
    },
    createdAt: daysAgo(67),
    updatedAt: daysAgo(36),
    lastModification: daysAgo(37),
  };

  const block3_4: Block = {
    id: "block-3-4",
    athleteId: "athlete-3",
    phaseId: phase3Id,
    blockNumber: 4,
    name: "In-Season Block 2",
    startDate: daysAgo(36),
    endDate: daysFromNow(2),
    duration: 5,
    season: "In-Season",
    subSeason: "Mid",
    status: "pending-signoff",
    currentDay: { week: 3, day: 2 },
    throwing: {
      xRole: "Starter",
      phase: "In-Season",
    },
    movement: {
      intensity: "Moderate",
      volume: "Low",
    },
    lifting: {
      split: "2x2",
      emphasis: "Maintenance",
      variability: "High",
      scheme: "Undulating",
    },
    createdAt: daysAgo(39),
    updatedAt: daysAgo(1),
    lastModification: daysAgo(1),
  };

  athletes.push({
    athlete: {
      id: "athlete-3",
      name: "James Rodriguez",
      photo: undefined,
      status: null,
      currentPhaseId: phase3Id,
      phases: [
        {
          id: phase3Id,
          athleteId: "athlete-3",
          phaseNumber: 1,
          startDate: phase3StartDate,
          endDate: phase3EndDate,
          status: "active",
        },
      ],
    },
    currentPhase: {
      id: phase3Id,
      athleteId: "athlete-3",
      phaseNumber: 1,
      startDate: phase3StartDate,
      endDate: phase3EndDate,
      status: "active",
    },
    blocks: [block3_1, block3_2, block3_3, block3_4],
  });

  // Athlete 11: Robert Martinez - Past athlete (all blocks complete, ended in past)
  const phase11Id = "phase-athlete-11";
  const phase11StartDate = daysAgo(180);
  const phase11EndDate = daysAgo(30);

  const block11_1: Block = {
    id: "block-11-1",
    athleteId: "athlete-11",
    phaseId: phase11Id,
    blockNumber: 1,
    name: "Pre-Season Block 1",
    startDate: daysAgo(180),
    endDate: daysAgo(152),
    duration: 4,
    season: "Pre-Season",
    subSeason: "Early",
    status: "complete",
    currentDay: { week: 4, day: 7 },
    throwing: {
      xRole: "Starter",
      phase: "Pre-Season",
    },
    movement: {
      intensity: "Low",
      volume: "High",
    },
    lifting: {
      split: "4x2",
      emphasis: "Hypertrophy",
      variability: "Low",
      scheme: "Linear",
    },
    conditioning: {
      coreEmphasis: "Stability",
      adaptation: "Aerobic",
      method: "Continuous",
    },
    createdAt: daysAgo(185),
    updatedAt: daysAgo(152),
    lastModification: daysAgo(153),
  };

  const block11_2: Block = {
    id: "block-11-2",
    athleteId: "athlete-11",
    phaseId: phase11Id,
    blockNumber: 2,
    name: "Pre-Season Block 2",
    startDate: daysAgo(152),
    endDate: daysAgo(124),
    duration: 4,
    season: "Pre-Season",
    subSeason: "Mid",
    status: "complete",
    currentDay: { week: 4, day: 7 },
    throwing: {
      xRole: "Starter",
      phase: "Pre-Season",
    },
    movement: {
      intensity: "Moderate",
      volume: "High",
    },
    lifting: {
      split: "4x2",
      emphasis: "Strength",
      variability: "Low",
      scheme: "Linear",
    },
    createdAt: daysAgo(155),
    updatedAt: daysAgo(124),
    lastModification: daysAgo(125),
  };

  const block11_3: Block = {
    id: "block-11-3",
    athleteId: "athlete-11",
    phaseId: phase11Id,
    blockNumber: 3,
    name: "In-Season Block 1",
    startDate: daysAgo(124),
    endDate: daysAgo(96),
    duration: 4,
    season: "In-Season",
    subSeason: "Early",
    status: "complete",
    currentDay: { week: 4, day: 7 },
    throwing: {
      xRole: "Starter",
      phase: "In-Season",
    },
    movement: {
      intensity: "Moderate",
      volume: "Moderate",
    },
    lifting: {
      split: "3x2",
      emphasis: "Power",
      variability: "Medium",
      scheme: "Undulating",
    },
    createdAt: daysAgo(127),
    updatedAt: daysAgo(96),
    lastModification: daysAgo(97),
  };

  athletes.push({
    athlete: {
      id: "athlete-11",
      name: "Robert Martinez",
      photo: undefined,
      status: null,
      currentPhaseId: phase11Id,
      phases: [
        {
          id: phase11Id,
          athleteId: "athlete-11",
          phaseNumber: 1,
          startDate: phase11StartDate,
          endDate: phase11EndDate,
          status: "complete",
        },
      ],
    },
    currentPhase: {
      id: phase11Id,
      athleteId: "athlete-11",
      phaseNumber: 1,
      startDate: phase11StartDate,
      endDate: phase11EndDate,
      status: "complete",
    },
    blocks: [block11_1, block11_2, block11_3],
  });

  // Athlete 12: Christopher Wilson - Past athlete (all blocks complete, ended in past)
  const phase12Id = "phase-athlete-12";
  const phase12StartDate = daysAgo(150);
  const phase12EndDate = daysAgo(20);

  const block12_1: Block = {
    id: "block-12-1",
    athleteId: "athlete-12",
    phaseId: phase12Id,
    blockNumber: 1,
    name: "Off-Season Block 1",
    startDate: daysAgo(150),
    endDate: daysAgo(122),
    duration: 4,
    season: "Off-Season",
    subSeason: "Early",
    status: "complete",
    currentDay: { week: 4, day: 7 },
    movement: {
      intensity: "Low",
      volume: "Moderate",
    },
    lifting: {
      split: "3x2",
      emphasis: "Recovery",
      variability: "High",
      scheme: "Undulating",
    },
    conditioning: {
      coreEmphasis: "Endurance",
      adaptation: "Aerobic",
      method: "Continuous",
    },
    createdAt: daysAgo(155),
    updatedAt: daysAgo(122),
    lastModification: daysAgo(123),
  };

  const block12_2: Block = {
    id: "block-12-2",
    athleteId: "athlete-12",
    phaseId: phase12Id,
    blockNumber: 2,
    name: "Off-Season Block 2",
    startDate: daysAgo(122),
    endDate: daysAgo(94),
    duration: 4,
    season: "Off-Season",
    subSeason: "Mid",
    status: "complete",
    currentDay: { week: 4, day: 7 },
    movement: {
      intensity: "Moderate",
      volume: "Moderate",
    },
    lifting: {
      split: "3x2",
      emphasis: "Hypertrophy",
      variability: "Medium",
      scheme: "Linear",
    },
    createdAt: daysAgo(125),
    updatedAt: daysAgo(94),
    lastModification: daysAgo(95),
  };

  athletes.push({
    athlete: {
      id: "athlete-12",
      name: "Christopher Wilson",
      photo: undefined,
      status: null,
      currentPhaseId: phase12Id,
      phases: [
        {
          id: phase12Id,
          athleteId: "athlete-12",
          phaseNumber: 1,
          startDate: phase12StartDate,
          endDate: phase12EndDate,
          status: "complete",
        },
      ],
    },
    currentPhase: {
      id: phase12Id,
      athleteId: "athlete-12",
      phaseNumber: 1,
      startDate: phase12StartDate,
      endDate: phase12EndDate,
      status: "complete",
    },
    blocks: [block12_1, block12_2],
  });

  // Athlete 4: Casey Davis - Phase 1 with 3 blocks (has pending-signoff)
  const phase4Id = "phase-athlete-4";
  const phase4StartDate = daysAgo(90);
  const phase4EndDate = daysFromNow(30);

  const block4_1: Block = {
    id: "block-4-1",
    athleteId: "athlete-4",
    phaseId: phase4Id,
    blockNumber: 1,
    name: "Pre-Season Block 1",
    startDate: daysAgo(90),
    endDate: daysAgo(62),
    duration: 4,
    season: "Pre-Season",
    subSeason: "Early",
    status: "complete",
    currentDay: { week: 4, day: 7 },
    throwing: {
      xRole: "Starter",
      phase: "Pre-Season",
    },
    movement: {
      intensity: "Low",
      volume: "High",
    },
    lifting: {
      split: "4x2",
      emphasis: "Hypertrophy",
      variability: "Low",
      scheme: "Linear",
    },
    createdAt: daysAgo(95),
    updatedAt: daysAgo(62),
    lastModification: daysAgo(63),
  };

  const block4_2: Block = {
    id: "block-4-2",
    athleteId: "athlete-4",
    phaseId: phase4Id,
    blockNumber: 2,
    name: "Pre-Season Block 2",
    startDate: daysAgo(62),
    endDate: daysAgo(34),
    duration: 4,
    season: "Pre-Season",
    subSeason: "Mid",
    status: "active",
    currentDay: { week: 3, day: 2 },
    throwing: {
      xRole: "Starter",
      phase: "Pre-Season",
    },
    movement: {
      intensity: "Moderate",
      volume: "High",
    },
    lifting: {
      split: "4x2",
      emphasis: "Strength",
      variability: "Low",
      scheme: "Linear",
    },
    nextBlockDue: daysFromNow(8),
    createdAt: daysAgo(65),
    updatedAt: daysAgo(1),
    lastModification: daysAgo(20),
  };

  const block4_3: Block = {
    id: "block-4-3",
    athleteId: "athlete-4",
    phaseId: phase4Id,
    blockNumber: 3,
    name: "Pre-Season Block 3",
    startDate: daysFromNow(8),
    endDate: daysFromNow(36),
    duration: 4,
    season: "Pre-Season",
    subSeason: "Late",
    status: "pending-signoff",
    currentDay: { week: 1, day: 1 },
    throwing: {
      xRole: "Starter",
      phase: "Pre-Season",
    },
    movement: {
      intensity: "High",
      volume: "Moderate",
    },
    lifting: {
      split: "3x2",
      emphasis: "Power",
      variability: "Medium",
      scheme: "Undulating",
    },
    nextBlockDue: daysFromNow(8),
    createdAt: daysAgo(5),
    updatedAt: daysAgo(1),
    lastModification: daysAgo(1),
  };

  athletes.push({
    athlete: {
      id: "athlete-4",
      name: "Casey Davis",
      photo: undefined,
      status: null,
      currentPhaseId: phase4Id,
      phases: [
        {
          id: phase4Id,
          athleteId: "athlete-4",
          phaseNumber: 1,
          startDate: phase4StartDate,
          endDate: phase4EndDate,
          status: "active",
        },
      ],
    },
    currentPhase: {
      id: phase4Id,
      athleteId: "athlete-4",
      phaseNumber: 1,
      startDate: phase4StartDate,
      endDate: phase4EndDate,
      status: "active",
    },
    blocks: [block4_1, block4_2, block4_3],
  });

  // Athlete 5: Alex Thompson - Phase 1 with 2 blocks
  const phase5Id = "phase-athlete-5";
  const phase5StartDate = daysAgo(80);
  const phase5EndDate = daysFromNow(20);

  const block5_1: Block = {
    id: "block-5-1",
    athleteId: "athlete-5",
    phaseId: phase5Id,
    blockNumber: 1,
    name: "In-Season Block 1",
    startDate: daysAgo(80),
    endDate: daysAgo(52),
    duration: 4,
    season: "In-Season",
    subSeason: "Late",
    status: "complete",
    currentDay: { week: 4, day: 7 },
    throwing: {
      xRole: "Reliever",
      phase: "In-Season",
    },
    movement: {
      intensity: "Moderate",
      volume: "Moderate",
    },
    lifting: {
      split: "3x2",
      emphasis: "Maintenance",
      variability: "Medium",
      scheme: "Undulating",
    },
    createdAt: daysAgo(85),
    updatedAt: daysAgo(52),
    lastModification: daysAgo(53),
  };

  const block5_2: Block = {
    id: "block-5-2",
    athleteId: "athlete-5",
    phaseId: phase5Id,
    blockNumber: 2,
    name: "Off-Season Block 2",
    startDate: daysAgo(52),
    endDate: daysFromNow(0),
    duration: 5,
    season: "Off-Season",
    subSeason: "Mid",
    status: "active",
    currentDay: { week: 4, day: 3 },
    movement: {
      intensity: "Low",
      volume: "Moderate",
    },
    lifting: {
      split: "3x2",
      emphasis: "Recovery",
      variability: "High",
      scheme: "Undulating",
    },
    nextBlockDue: daysFromNow(0),
    createdAt: daysAgo(55),
    updatedAt: daysAgo(5),
    lastModification: daysAgo(5),
  };

  athletes.push({
    athlete: {
      id: "athlete-5",
      name: "Alex Thompson",
      photo: undefined,
      status: null,
      currentPhaseId: phase5Id,
      phases: [
        {
          id: phase5Id,
          athleteId: "athlete-5",
          phaseNumber: 1,
          startDate: phase5StartDate,
          endDate: phase5EndDate,
          status: "active",
        },
      ],
    },
    currentPhase: {
      id: phase5Id,
      athleteId: "athlete-5",
      phaseNumber: 1,
      startDate: phase5StartDate,
      endDate: phase5EndDate,
      status: "active",
    },
    blocks: [block5_1, block5_2],
  });

  // Athlete 6: Michael Lee - Phase 1 with 1 block
  const phase6Id = "phase-athlete-6";
  const phase6StartDate = daysAgo(50);
  const phase6EndDate = daysFromNow(20);

  const block6_1: Block = {
    id: "block-6-1",
    athleteId: "athlete-6",
    phaseId: phase6Id,
    blockNumber: 1,
    name: "In-Season Block 1",
    startDate: daysAgo(50),
    endDate: daysFromNow(0),
    duration: 4,
    season: "In-Season",
    subSeason: "Mid",
    status: "active",
    currentDay: { week: 3, day: 4 },
    throwing: {
      xRole: "Starter",
      phase: "In-Season",
    },
    movement: {
      intensity: "Moderate",
      volume: "Moderate",
    },
    lifting: {
      split: "3x2",
      emphasis: "Power",
      variability: "Medium",
      scheme: "Undulating",
    },
    nextBlockDue: daysFromNow(0),
    createdAt: daysAgo(55),
    updatedAt: daysAgo(1),
    lastModification: daysAgo(1),
  };

  athletes.push({
    athlete: {
      id: "athlete-6",
      name: "Michael Lee",
      photo: undefined,
      status: null,
      currentPhaseId: phase6Id,
      phases: [
        {
          id: phase6Id,
          athleteId: "athlete-6",
          phaseNumber: 1,
          startDate: phase6StartDate,
          endDate: phase6EndDate,
          status: "active",
        },
      ],
    },
    currentPhase: {
      id: phase6Id,
      athleteId: "athlete-6",
      phaseNumber: 1,
      startDate: phase6StartDate,
      endDate: phase6EndDate,
      status: "active",
    },
    blocks: [block6_1],
  });

  // Athlete 7: David Kim - Phase 1 with 1 block (injured)
  const phase7Id = "phase-athlete-7";
  const phase7StartDate = daysAgo(40);
  const phase7EndDate = daysFromNow(30);

  const block7_1: Block = {
    id: "block-7-1",
    athleteId: "athlete-7",
    phaseId: phase7Id,
    blockNumber: 1,
    name: "In-Season Block 1",
    startDate: daysAgo(40),
    endDate: daysFromNow(5),
    duration: 4,
    season: "In-Season",
    subSeason: "Mid",
    status: "active",
    currentDay: { week: 2, day: 3 },
    throwing: {
      xRole: "Reliever",
      phase: "In-Season",
    },
    movement: {
      intensity: "Low",
      volume: "Low",
    },
    lifting: {
      split: "2x2",
      emphasis: "Recovery",
      variability: "High",
      scheme: "Undulating",
    },
    nextBlockDue: daysFromNow(5),
    createdAt: daysAgo(45),
    updatedAt: daysAgo(2),
    lastModification: daysAgo(2),
  };

  athletes.push({
    athlete: {
      id: "athlete-7",
      name: "David Kim",
      photo: undefined,
      status: "injured",
      currentPhaseId: phase7Id,
      phases: [
        {
          id: phase7Id,
          athleteId: "athlete-7",
          phaseNumber: 1,
          startDate: phase7StartDate,
          endDate: phase7EndDate,
          status: "active",
        },
      ],
    },
    currentPhase: {
      id: phase7Id,
      athleteId: "athlete-7",
      phaseNumber: 1,
      startDate: phase7StartDate,
      endDate: phase7EndDate,
      status: "active",
    },
    blocks: [block7_1],
  });

  // Athlete 8: Jordan Williams - Phase 1 with 1 block (rehabbing)
  const phase8Id = "phase-athlete-8";
  const phase8StartDate = daysAgo(35);
  const phase8EndDate = daysFromNow(30);

  const block8_1: Block = {
    id: "block-8-1",
    athleteId: "athlete-8",
    phaseId: phase8Id,
    blockNumber: 1,
    name: "Off-Season Block 1",
    startDate: daysAgo(35),
    endDate: daysFromNow(14),
    duration: 4,
    season: "Off-Season",
    subSeason: "Early",
    status: "active",
    currentDay: { week: 2, day: 5 },
    movement: {
      intensity: "Low",
      volume: "Moderate",
    },
    lifting: {
      split: "3x2",
      emphasis: "Recovery",
      variability: "High",
      scheme: "Undulating",
    },
    conditioning: {
      coreEmphasis: "Endurance",
      adaptation: "Aerobic",
      method: "Continuous",
    },
    nextBlockDue: daysFromNow(14),
    createdAt: daysAgo(40),
    updatedAt: daysAgo(3),
    lastModification: daysAgo(3),
  };

  athletes.push({
    athlete: {
      id: "athlete-8",
      name: "Jordan Williams",
      photo: undefined,
      status: "rehabbing",
      currentPhaseId: phase8Id,
      phases: [
        {
          id: phase8Id,
          athleteId: "athlete-8",
          phaseNumber: 1,
          startDate: phase8StartDate,
          endDate: phase8EndDate,
          status: "active",
        },
      ],
    },
    currentPhase: {
      id: phase8Id,
      athleteId: "athlete-8",
      phaseNumber: 1,
      startDate: phase8StartDate,
      endDate: phase8EndDate,
      status: "active",
    },
    blocks: [block8_1],
  });

  // Athlete 9: Ethan Martinez - Phase 1 with 1 block
  const phase9Id = "phase-athlete-9";
  const phase9StartDate = daysAgo(30);
  const phase9EndDate = daysFromNow(30);

  const block9_1: Block = {
    id: "block-9-1",
    athleteId: "athlete-9",
    phaseId: phase9Id,
    blockNumber: 1,
    name: "Off-Season Block 1",
    startDate: daysAgo(30),
    endDate: daysFromNow(20),
    duration: 4,
    season: "Off-Season",
    subSeason: "Early",
    status: "active",
    currentDay: { week: 2, day: 1 },
    movement: {
      intensity: "Low",
      volume: "Moderate",
    },
    lifting: {
      split: "3x2",
      emphasis: "Hypertrophy",
      variability: "Medium",
      scheme: "Linear",
    },
    nextBlockDue: daysFromNow(20),
    createdAt: daysAgo(35),
    updatedAt: daysAgo(4),
    lastModification: daysAgo(4),
  };

  athletes.push({
    athlete: {
      id: "athlete-9",
      name: "Ethan Martinez",
      photo: undefined,
      status: null,
      currentPhaseId: phase9Id,
      phases: [
        {
          id: phase9Id,
          athleteId: "athlete-9",
          phaseNumber: 1,
          startDate: phase9StartDate,
          endDate: phase9EndDate,
          status: "active",
        },
      ],
    },
    currentPhase: {
      id: phase9Id,
      athleteId: "athlete-9",
      phaseNumber: 1,
      startDate: phase9StartDate,
      endDate: phase9EndDate,
      status: "active",
    },
    blocks: [block9_1],
  });

  // Athlete 10: Tyler Brown - Phase 2 with 4 blocks
  const phase10Id = "phase-athlete-10";
  const phase10StartDate = daysAgo(200);
  const phase10EndDate = daysFromNow(30);

  const block10_1: Block = {
    id: "block-10-1",
    athleteId: "athlete-10",
    phaseId: phase10Id,
    blockNumber: 1,
    name: "Pre-Season Block 1",
    startDate: daysAgo(200),
    endDate: daysAgo(172),
    duration: 4,
    season: "Pre-Season",
    subSeason: "Early",
    status: "complete",
    currentDay: { week: 4, day: 7 },
    throwing: {
      xRole: "Starter",
      phase: "Pre-Season",
    },
    movement: {
      intensity: "Low",
      volume: "High",
    },
    lifting: {
      split: "4x2",
      emphasis: "Hypertrophy",
      variability: "Low",
      scheme: "Linear",
    },
    createdAt: daysAgo(205),
    updatedAt: daysAgo(172),
    lastModification: daysAgo(173),
  };

  const block10_2: Block = {
    id: "block-10-2",
    athleteId: "athlete-10",
    phaseId: phase10Id,
    blockNumber: 2,
    name: "Pre-Season Block 2",
    startDate: daysAgo(172),
    endDate: daysAgo(144),
    duration: 4,
    season: "Pre-Season",
    subSeason: "Mid",
    status: "complete",
    currentDay: { week: 4, day: 7 },
    throwing: {
      xRole: "Starter",
      phase: "Pre-Season",
    },
    movement: {
      intensity: "Moderate",
      volume: "High",
    },
    lifting: {
      split: "4x2",
      emphasis: "Strength",
      variability: "Low",
      scheme: "Linear",
    },
    createdAt: daysAgo(175),
    updatedAt: daysAgo(144),
    lastModification: daysAgo(145),
  };

  const block10_3: Block = {
    id: "block-10-3",
    athleteId: "athlete-10",
    phaseId: phase10Id,
    blockNumber: 3,
    name: "Pre-Season Block 3",
    startDate: daysAgo(144),
    endDate: daysFromNow(22),
    duration: 5,
    season: "Pre-Season",
    subSeason: "Late",
    status: "active",
    currentDay: { week: 3, day: 2 },
    throwing: {
      xRole: "Starter",
      phase: "Pre-Season",
    },
    movement: {
      intensity: "High",
      volume: "Moderate",
    },
    lifting: {
      split: "3x2",
      emphasis: "Power",
      variability: "Medium",
      scheme: "Undulating",
    },
    nextBlockDue: daysFromNow(22),
    createdAt: daysAgo(147),
    updatedAt: daysAgo(1),
    lastModification: daysAgo(1),
  };

  const block10_4: Block = {
    id: "block-10-4",
    athleteId: "athlete-10",
    phaseId: phase10Id,
    blockNumber: 4,
    name: "In-Season Block 4",
    startDate: daysFromNow(22),
    endDate: daysFromNow(50),
    duration: 4,
    season: "In-Season",
    subSeason: "Early",
    status: "draft",
    currentDay: { week: 1, day: 1 },
    throwing: {
      xRole: "Starter",
      phase: "In-Season",
    },
    movement: {
      intensity: "Moderate",
      volume: "Moderate",
    },
    lifting: {
      split: "3x2",
      emphasis: "Power",
      variability: "Medium",
      scheme: "Undulating",
    },
    createdAt: daysAgo(10),
    updatedAt: daysAgo(5),
    lastModification: daysAgo(5),
  };

  athletes.push({
    athlete: {
      id: "athlete-10",
      name: "Tyler Brown",
      photo: undefined,
      status: null,
      currentPhaseId: phase10Id,
      phases: [
        {
          id: phase10Id,
          athleteId: "athlete-10",
          phaseNumber: 2,
          startDate: phase10StartDate,
          endDate: phase10EndDate,
          status: "active",
        },
      ],
    },
    currentPhase: {
      id: phase10Id,
      athleteId: "athlete-10",
      phaseNumber: 2,
      startDate: phase10StartDate,
      endDate: phase10EndDate,
      status: "active",
    },
    blocks: [block10_1, block10_2, block10_3, block10_4],
  });

  return athletes;
}
