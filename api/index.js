import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// api/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID as randomUUID2 } from "crypto";

// db/seed.ts
var today = /* @__PURE__ */ new Date();
today.setHours(0, 0, 0, 0);
var daysAgo = (days) => {
  const date2 = new Date(today);
  date2.setDate(date2.getDate() - days);
  return date2.toISOString();
};
var daysFromNow = (days) => {
  const date2 = new Date(today);
  date2.setDate(date2.getDate() + days);
  return date2.toISOString();
};
function generateSeedAthletes() {
  const athletes2 = [];
  const phase1Id = "phase-athlete-1";
  const phase1StartDate = daysAgo(60);
  const phase1EndDate = daysFromNow(30);
  const block1_1 = {
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
      exclusions: "None"
    },
    movement: {
      intensity: "Moderate",
      volume: "High"
    },
    lifting: {
      split: "4x2",
      emphasis: "Strength",
      variability: "Low",
      scheme: "Linear"
    },
    conditioning: {
      coreEmphasis: "Stability",
      adaptation: "Aerobic",
      method: "Continuous"
    },
    createdAt: daysAgo(65),
    updatedAt: daysAgo(32),
    lastModification: daysAgo(33)
  };
  const block1_2 = {
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
      phase: "Pre-Season"
    },
    movement: {
      intensity: "High",
      volume: "Moderate"
    },
    lifting: {
      split: "3x2",
      emphasis: "Power",
      variability: "Medium",
      scheme: "Undulating"
    },
    conditioning: {
      coreEmphasis: "Power",
      adaptation: "Anaerobic",
      method: "Interval"
    },
    createdAt: daysAgo(35),
    updatedAt: daysAgo(1),
    lastModification: daysAgo(2)
  };
  athletes2.push({
    athlete: {
      id: "athlete-1",
      name: "Marcus Johnson",
      photo: void 0,
      status: null,
      currentPhaseId: phase1Id,
      phases: [
        {
          id: phase1Id,
          athleteId: "athlete-1",
          phaseNumber: 1,
          startDate: phase1StartDate,
          endDate: phase1EndDate,
          status: "active"
        }
      ]
    },
    currentPhase: {
      id: phase1Id,
      athleteId: "athlete-1",
      phaseNumber: 1,
      startDate: phase1StartDate,
      endDate: phase1EndDate,
      status: "active"
    },
    blocks: [block1_1, block1_2]
  });
  const phase2Id = "phase-athlete-2";
  const phase2StartDate = daysAgo(90);
  const phase2EndDate = daysFromNow(30);
  const block2_1 = {
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
      scheme: "Linear"
    },
    createdAt: daysAgo(95),
    updatedAt: daysAgo(62),
    lastModification: daysAgo(63)
  };
  const block2_2 = {
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
      phase: "In-Season"
    },
    movement: {
      intensity: "Moderate",
      volume: "Moderate"
    },
    lifting: {
      split: "3x2",
      emphasis: "Maintenance",
      variability: "Medium",
      scheme: "Undulating"
    },
    createdAt: daysAgo(65),
    updatedAt: daysAgo(34),
    lastModification: daysAgo(35)
  };
  const block2_3 = {
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
      phase: "In-Season"
    },
    movement: {
      intensity: "Moderate",
      volume: "Low"
    },
    lifting: {
      split: "2x2",
      emphasis: "Restorative",
      variability: "High",
      scheme: "Undulating"
    },
    conditioning: {
      coreEmphasis: "Endurance",
      adaptation: "Aerobic",
      method: "Continuous"
    },
    createdAt: daysAgo(37),
    updatedAt: daysAgo(1),
    lastModification: daysAgo(2)
  };
  athletes2.push({
    athlete: {
      id: "athlete-2",
      name: "Samuel Chen",
      photo: void 0,
      status: null,
      currentPhaseId: phase2Id,
      phases: [
        {
          id: phase2Id,
          athleteId: "athlete-2",
          phaseNumber: 1,
          startDate: phase2StartDate,
          endDate: phase2EndDate,
          status: "active"
        }
      ]
    },
    currentPhase: {
      id: phase2Id,
      athleteId: "athlete-2",
      phaseNumber: 1,
      startDate: phase2StartDate,
      endDate: phase2EndDate,
      status: "active"
    },
    blocks: [block2_1, block2_2, block2_3]
  });
  const phase3Id = "phase-athlete-3";
  const phase3StartDate = daysAgo(120);
  const phase3EndDate = daysFromNow(30);
  const block3_1 = {
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
      phase: "Pre-Season"
    },
    movement: {
      intensity: "Low",
      volume: "High"
    },
    lifting: {
      split: "4x2",
      emphasis: "Hypertrophy",
      variability: "Low",
      scheme: "Linear"
    },
    conditioning: {
      coreEmphasis: "Stability",
      adaptation: "Aerobic",
      method: "Continuous"
    },
    createdAt: daysAgo(125),
    updatedAt: daysAgo(92),
    lastModification: daysAgo(93)
  };
  const block3_2 = {
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
      phase: "Pre-Season"
    },
    movement: {
      intensity: "Moderate",
      volume: "High"
    },
    lifting: {
      split: "4x2",
      emphasis: "Strength",
      variability: "Low",
      scheme: "Linear"
    },
    createdAt: daysAgo(95),
    updatedAt: daysAgo(64),
    lastModification: daysAgo(65)
  };
  const block3_3 = {
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
      phase: "In-Season"
    },
    movement: {
      intensity: "Moderate",
      volume: "Moderate"
    },
    lifting: {
      split: "3x2",
      emphasis: "Power",
      variability: "Medium",
      scheme: "Undulating"
    },
    conditioning: {
      coreEmphasis: "Power",
      adaptation: "Anaerobic",
      method: "Interval"
    },
    createdAt: daysAgo(67),
    updatedAt: daysAgo(36),
    lastModification: daysAgo(37)
  };
  const block3_4 = {
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
      phase: "In-Season"
    },
    movement: {
      intensity: "Moderate",
      volume: "Low"
    },
    lifting: {
      split: "2x2",
      emphasis: "Maintenance",
      variability: "High",
      scheme: "Undulating"
    },
    createdAt: daysAgo(39),
    updatedAt: daysAgo(1),
    lastModification: daysAgo(1)
  };
  athletes2.push({
    athlete: {
      id: "athlete-3",
      name: "James Rodriguez",
      photo: void 0,
      status: null,
      currentPhaseId: phase3Id,
      phases: [
        {
          id: phase3Id,
          athleteId: "athlete-3",
          phaseNumber: 1,
          startDate: phase3StartDate,
          endDate: phase3EndDate,
          status: "active"
        }
      ]
    },
    currentPhase: {
      id: phase3Id,
      athleteId: "athlete-3",
      phaseNumber: 1,
      startDate: phase3StartDate,
      endDate: phase3EndDate,
      status: "active"
    },
    blocks: [block3_1, block3_2, block3_3, block3_4]
  });
  const phase11Id = "phase-athlete-11";
  const phase11StartDate = daysAgo(180);
  const phase11EndDate = daysAgo(30);
  const block11_1 = {
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
      phase: "Pre-Season"
    },
    movement: {
      intensity: "Low",
      volume: "High"
    },
    lifting: {
      split: "4x2",
      emphasis: "Hypertrophy",
      variability: "Low",
      scheme: "Linear"
    },
    conditioning: {
      coreEmphasis: "Stability",
      adaptation: "Aerobic",
      method: "Continuous"
    },
    createdAt: daysAgo(185),
    updatedAt: daysAgo(152),
    lastModification: daysAgo(153)
  };
  const block11_2 = {
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
      phase: "Pre-Season"
    },
    movement: {
      intensity: "Moderate",
      volume: "High"
    },
    lifting: {
      split: "4x2",
      emphasis: "Strength",
      variability: "Low",
      scheme: "Linear"
    },
    createdAt: daysAgo(155),
    updatedAt: daysAgo(124),
    lastModification: daysAgo(125)
  };
  const block11_3 = {
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
      phase: "In-Season"
    },
    movement: {
      intensity: "Moderate",
      volume: "Moderate"
    },
    lifting: {
      split: "3x2",
      emphasis: "Power",
      variability: "Medium",
      scheme: "Undulating"
    },
    createdAt: daysAgo(127),
    updatedAt: daysAgo(96),
    lastModification: daysAgo(97)
  };
  athletes2.push({
    athlete: {
      id: "athlete-11",
      name: "Robert Martinez",
      photo: void 0,
      status: null,
      currentPhaseId: phase11Id,
      phases: [
        {
          id: phase11Id,
          athleteId: "athlete-11",
          phaseNumber: 1,
          startDate: phase11StartDate,
          endDate: phase11EndDate,
          status: "complete"
        }
      ]
    },
    currentPhase: {
      id: phase11Id,
      athleteId: "athlete-11",
      phaseNumber: 1,
      startDate: phase11StartDate,
      endDate: phase11EndDate,
      status: "complete"
    },
    blocks: [block11_1, block11_2, block11_3]
  });
  const phase12Id = "phase-athlete-12";
  const phase12StartDate = daysAgo(150);
  const phase12EndDate = daysAgo(20);
  const block12_1 = {
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
      volume: "Moderate"
    },
    lifting: {
      split: "3x2",
      emphasis: "Recovery",
      variability: "High",
      scheme: "Undulating"
    },
    conditioning: {
      coreEmphasis: "Endurance",
      adaptation: "Aerobic",
      method: "Continuous"
    },
    createdAt: daysAgo(155),
    updatedAt: daysAgo(122),
    lastModification: daysAgo(123)
  };
  const block12_2 = {
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
      volume: "Moderate"
    },
    lifting: {
      split: "3x2",
      emphasis: "Hypertrophy",
      variability: "Medium",
      scheme: "Linear"
    },
    createdAt: daysAgo(125),
    updatedAt: daysAgo(94),
    lastModification: daysAgo(95)
  };
  athletes2.push({
    athlete: {
      id: "athlete-12",
      name: "Christopher Wilson",
      photo: void 0,
      status: null,
      currentPhaseId: phase12Id,
      phases: [
        {
          id: phase12Id,
          athleteId: "athlete-12",
          phaseNumber: 1,
          startDate: phase12StartDate,
          endDate: phase12EndDate,
          status: "complete"
        }
      ]
    },
    currentPhase: {
      id: phase12Id,
      athleteId: "athlete-12",
      phaseNumber: 1,
      startDate: phase12StartDate,
      endDate: phase12EndDate,
      status: "complete"
    },
    blocks: [block12_1, block12_2]
  });
  const phase4Id = "phase-athlete-4";
  const phase4StartDate = daysAgo(90);
  const phase4EndDate = daysFromNow(30);
  const block4_1 = {
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
      phase: "Pre-Season"
    },
    movement: {
      intensity: "Low",
      volume: "High"
    },
    lifting: {
      split: "4x2",
      emphasis: "Hypertrophy",
      variability: "Low",
      scheme: "Linear"
    },
    createdAt: daysAgo(95),
    updatedAt: daysAgo(62),
    lastModification: daysAgo(63)
  };
  const block4_2 = {
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
      phase: "Pre-Season"
    },
    movement: {
      intensity: "Moderate",
      volume: "High"
    },
    lifting: {
      split: "4x2",
      emphasis: "Strength",
      variability: "Low",
      scheme: "Linear"
    },
    createdAt: daysAgo(65),
    updatedAt: daysAgo(1),
    lastModification: daysAgo(20)
  };
  const block4_3 = {
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
      phase: "Pre-Season"
    },
    movement: {
      intensity: "High",
      volume: "Moderate"
    },
    lifting: {
      split: "3x2",
      emphasis: "Power",
      variability: "Medium",
      scheme: "Undulating"
    },
    createdAt: daysAgo(5),
    updatedAt: daysAgo(1),
    lastModification: daysAgo(1)
  };
  athletes2.push({
    athlete: {
      id: "athlete-4",
      name: "Casey Davis",
      photo: void 0,
      status: null,
      currentPhaseId: phase4Id,
      phases: [
        {
          id: phase4Id,
          athleteId: "athlete-4",
          phaseNumber: 1,
          startDate: phase4StartDate,
          endDate: phase4EndDate,
          status: "active"
        }
      ]
    },
    currentPhase: {
      id: phase4Id,
      athleteId: "athlete-4",
      phaseNumber: 1,
      startDate: phase4StartDate,
      endDate: phase4EndDate,
      status: "active"
    },
    blocks: [block4_1, block4_2, block4_3]
  });
  const phase5Id = "phase-athlete-5";
  const phase5StartDate = daysAgo(80);
  const phase5EndDate = daysFromNow(20);
  const block5_1 = {
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
      phase: "In-Season"
    },
    movement: {
      intensity: "Moderate",
      volume: "Moderate"
    },
    lifting: {
      split: "3x2",
      emphasis: "Maintenance",
      variability: "Medium",
      scheme: "Undulating"
    },
    createdAt: daysAgo(85),
    updatedAt: daysAgo(52),
    lastModification: daysAgo(53)
  };
  const block5_2 = {
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
      volume: "Moderate"
    },
    lifting: {
      split: "3x2",
      emphasis: "Recovery",
      variability: "High",
      scheme: "Undulating"
    },
    createdAt: daysAgo(55),
    updatedAt: daysAgo(5),
    lastModification: daysAgo(5)
  };
  athletes2.push({
    athlete: {
      id: "athlete-5",
      name: "Alex Thompson",
      photo: void 0,
      status: null,
      currentPhaseId: phase5Id,
      phases: [
        {
          id: phase5Id,
          athleteId: "athlete-5",
          phaseNumber: 1,
          startDate: phase5StartDate,
          endDate: phase5EndDate,
          status: "active"
        }
      ]
    },
    currentPhase: {
      id: phase5Id,
      athleteId: "athlete-5",
      phaseNumber: 1,
      startDate: phase5StartDate,
      endDate: phase5EndDate,
      status: "active"
    },
    blocks: [block5_1, block5_2]
  });
  const phase6Id = "phase-athlete-6";
  const phase6StartDate = daysAgo(50);
  const phase6EndDate = daysFromNow(20);
  const block6_1 = {
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
      phase: "In-Season"
    },
    movement: {
      intensity: "Moderate",
      volume: "Moderate"
    },
    lifting: {
      split: "3x2",
      emphasis: "Power",
      variability: "Medium",
      scheme: "Undulating"
    },
    createdAt: daysAgo(55),
    updatedAt: daysAgo(1),
    lastModification: daysAgo(1)
  };
  athletes2.push({
    athlete: {
      id: "athlete-6",
      name: "Michael Lee",
      photo: void 0,
      status: null,
      currentPhaseId: phase6Id,
      phases: [
        {
          id: phase6Id,
          athleteId: "athlete-6",
          phaseNumber: 1,
          startDate: phase6StartDate,
          endDate: phase6EndDate,
          status: "active"
        }
      ]
    },
    currentPhase: {
      id: phase6Id,
      athleteId: "athlete-6",
      phaseNumber: 1,
      startDate: phase6StartDate,
      endDate: phase6EndDate,
      status: "active"
    },
    blocks: [block6_1]
  });
  const phase7Id = "phase-athlete-7";
  const phase7StartDate = daysAgo(40);
  const phase7EndDate = daysFromNow(30);
  const block7_1 = {
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
      phase: "In-Season"
    },
    movement: {
      intensity: "Low",
      volume: "Low"
    },
    lifting: {
      split: "2x2",
      emphasis: "Recovery",
      variability: "High",
      scheme: "Undulating"
    },
    createdAt: daysAgo(45),
    updatedAt: daysAgo(2),
    lastModification: daysAgo(2)
  };
  athletes2.push({
    athlete: {
      id: "athlete-7",
      name: "David Kim",
      photo: void 0,
      status: "injured",
      currentPhaseId: phase7Id,
      phases: [
        {
          id: phase7Id,
          athleteId: "athlete-7",
          phaseNumber: 1,
          startDate: phase7StartDate,
          endDate: phase7EndDate,
          status: "active"
        }
      ]
    },
    currentPhase: {
      id: phase7Id,
      athleteId: "athlete-7",
      phaseNumber: 1,
      startDate: phase7StartDate,
      endDate: phase7EndDate,
      status: "active"
    },
    blocks: [block7_1]
  });
  const phase8Id = "phase-athlete-8";
  const phase8StartDate = daysAgo(35);
  const phase8EndDate = daysFromNow(30);
  const block8_1 = {
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
      volume: "Moderate"
    },
    lifting: {
      split: "3x2",
      emphasis: "Recovery",
      variability: "High",
      scheme: "Undulating"
    },
    conditioning: {
      coreEmphasis: "Endurance",
      adaptation: "Aerobic",
      method: "Continuous"
    },
    createdAt: daysAgo(40),
    updatedAt: daysAgo(3),
    lastModification: daysAgo(3)
  };
  athletes2.push({
    athlete: {
      id: "athlete-8",
      name: "Jordan Williams",
      photo: void 0,
      status: "rehabbing",
      currentPhaseId: phase8Id,
      phases: [
        {
          id: phase8Id,
          athleteId: "athlete-8",
          phaseNumber: 1,
          startDate: phase8StartDate,
          endDate: phase8EndDate,
          status: "active"
        }
      ]
    },
    currentPhase: {
      id: phase8Id,
      athleteId: "athlete-8",
      phaseNumber: 1,
      startDate: phase8StartDate,
      endDate: phase8EndDate,
      status: "active"
    },
    blocks: [block8_1]
  });
  const phase9Id = "phase-athlete-9";
  const phase9StartDate = daysAgo(30);
  const phase9EndDate = daysFromNow(30);
  const block9_1 = {
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
      volume: "Moderate"
    },
    lifting: {
      split: "3x2",
      emphasis: "Hypertrophy",
      variability: "Medium",
      scheme: "Linear"
    },
    createdAt: daysAgo(35),
    updatedAt: daysAgo(4),
    lastModification: daysAgo(4)
  };
  athletes2.push({
    athlete: {
      id: "athlete-9",
      name: "Ethan Martinez",
      photo: void 0,
      status: null,
      currentPhaseId: phase9Id,
      phases: [
        {
          id: phase9Id,
          athleteId: "athlete-9",
          phaseNumber: 1,
          startDate: phase9StartDate,
          endDate: phase9EndDate,
          status: "active"
        }
      ]
    },
    currentPhase: {
      id: phase9Id,
      athleteId: "athlete-9",
      phaseNumber: 1,
      startDate: phase9StartDate,
      endDate: phase9EndDate,
      status: "active"
    },
    blocks: [block9_1]
  });
  const phase10Id = "phase-athlete-10";
  const phase10StartDate = daysAgo(200);
  const phase10EndDate = daysFromNow(30);
  const block10_1 = {
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
      phase: "Pre-Season"
    },
    movement: {
      intensity: "Low",
      volume: "High"
    },
    lifting: {
      split: "4x2",
      emphasis: "Hypertrophy",
      variability: "Low",
      scheme: "Linear"
    },
    createdAt: daysAgo(205),
    updatedAt: daysAgo(172),
    lastModification: daysAgo(173)
  };
  const block10_2 = {
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
      phase: "Pre-Season"
    },
    movement: {
      intensity: "Moderate",
      volume: "High"
    },
    lifting: {
      split: "4x2",
      emphasis: "Strength",
      variability: "Low",
      scheme: "Linear"
    },
    createdAt: daysAgo(175),
    updatedAt: daysAgo(144),
    lastModification: daysAgo(145)
  };
  const block10_3 = {
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
      phase: "Pre-Season"
    },
    movement: {
      intensity: "High",
      volume: "Moderate"
    },
    lifting: {
      split: "3x2",
      emphasis: "Power",
      variability: "Medium",
      scheme: "Undulating"
    },
    createdAt: daysAgo(147),
    updatedAt: daysAgo(1),
    lastModification: daysAgo(1)
  };
  const block10_4 = {
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
      phase: "In-Season"
    },
    movement: {
      intensity: "Moderate",
      volume: "Moderate"
    },
    lifting: {
      split: "3x2",
      emphasis: "Power",
      variability: "Medium",
      scheme: "Undulating"
    },
    createdAt: daysAgo(10),
    updatedAt: daysAgo(5),
    lastModification: daysAgo(5)
  };
  athletes2.push({
    athlete: {
      id: "athlete-10",
      name: "Tyler Brown",
      photo: void 0,
      status: null,
      currentPhaseId: phase10Id,
      phases: [
        {
          id: phase10Id,
          athleteId: "athlete-10",
          phaseNumber: 2,
          startDate: phase10StartDate,
          endDate: phase10EndDate,
          status: "active"
        }
      ]
    },
    currentPhase: {
      id: phase10Id,
      athleteId: "athlete-10",
      phaseNumber: 2,
      startDate: phase10StartDate,
      endDate: phase10EndDate,
      status: "active"
    },
    blocks: [block10_1, block10_2, block10_3, block10_4]
  });
  return athletes2;
}

// server/dbStorage.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var athletes = pgTable("athletes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  photo: text("photo"),
  status: varchar("status", { length: 50 }),
  // "injured" | "rehabbing" | "lingering-issues" | null
  currentPhaseId: varchar("current_phase_id")
});
var phases = pgTable("phases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  athleteId: varchar("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  phaseNumber: integer("phase_number").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: varchar("status", { length: 20 }).notNull()
  // "active" | "complete" | "future"
});
var blocks = pgTable("blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  athleteId: varchar("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  phaseId: varchar("phase_id").notNull().references(() => phases.id, { onDelete: "cascade" }),
  blockNumber: integer("block_number").notNull(),
  name: text("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  duration: integer("duration").notNull(),
  season: varchar("season", { length: 20 }).notNull(),
  // "Pre-Season" | "In-Season" | "Off-Season" | "Redshirt"
  subSeason: varchar("sub_season", { length: 50 }),
  // "Early" | "Mid" | "Late" | "General Off-Season (GOS)"
  status: varchar("status", { length: 20 }).notNull(),
  // "draft" | "pending-signoff" | "active" | "complete"
  currentDay: jsonb("current_day"),
  // { week: number, day: number }
  throwing: jsonb("throwing"),
  // { xRole: string, phase: string, exclusions?: string }
  movement: jsonb("movement"),
  // { intensity: string, volume: string }
  lifting: jsonb("lifting"),
  // { split: string, emphasis: string, variability: string, scheme: string }
  conditioning: jsonb("conditioning"),
  // { coreEmphasis: string, adaptation: string, method: string }
  lastModification: timestamp("last_modification"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var programs = pgTable("programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  programId: varchar("program_id").notNull().unique(),
  athleteId: varchar("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  athleteName: text("athlete_name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  routineTypes: jsonb("routine_types").notNull(),
  // string[]
  blockDuration: integer("block_duration").notNull(),
  status: varchar("status", { length: 50 }),
  // "injured" | "rehabbing" | "lingering-issues" | null
  season: varchar("season", { length: 50 }),
  subSeason: varchar("sub_season", { length: 50 }),
  lastModification: timestamp("last_modification"),
  lastSubmission: timestamp("last_submission"),
  currentDay: jsonb("current_day"),
  // { block: number, week: number, day: number }
  nextBlockDue: timestamp("next_block_due"),
  daysComplete: integer("days_complete"),
  daysAvailable: integer("days_available")
});

// server/dbStorage.ts
function generateProgramId() {
  const randomDigits = Math.floor(1e5 + Math.random() * 9e5);
  return `P${randomDigits}`;
}
var DbStorage = class {
  db;
  constructor(databaseUrl) {
    const sql2 = neon(databaseUrl);
    this.db = drizzle(sql2);
  }
  // User methods
  async getUser(id) {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  async getUserByUsername(username) {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const [user] = await this.db.insert(users).values({ id, ...insertUser }).returning();
    return user;
  }
  // Program methods
  async getPrograms() {
    const dbPrograms = await this.db.select().from(programs);
    return dbPrograms.map(this.mapDbProgramToProgram);
  }
  async getProgram(id) {
    const result = await this.db.select().from(programs).where(eq(programs.id, id)).limit(1);
    return result[0] ? this.mapDbProgramToProgram(result[0]) : void 0;
  }
  async createProgram(insertProgram) {
    const id = randomUUID();
    const programId = generateProgramId();
    const [dbProgram] = await this.db.insert(programs).values({
      id,
      programId,
      athleteId: insertProgram.athleteId,
      athleteName: insertProgram.athleteName,
      startDate: insertProgram.startDate,
      endDate: insertProgram.endDate,
      routineTypes: insertProgram.routineTypes,
      blockDuration: insertProgram.blockDuration,
      status: insertProgram.status ?? null,
      season: insertProgram.season ?? null,
      subSeason: insertProgram.subSeason ?? null,
      lastModification: insertProgram.lastModification ? new Date(insertProgram.lastModification) : null,
      lastSubmission: insertProgram.lastSubmission ? new Date(insertProgram.lastSubmission) : null,
      currentDay: insertProgram.currentDay ?? null,
      nextBlockDue: insertProgram.nextBlockDue ? new Date(insertProgram.nextBlockDue) : null,
      daysComplete: insertProgram.daysComplete ?? null,
      daysAvailable: insertProgram.daysAvailable ?? null
    }).returning();
    return this.mapDbProgramToProgram(dbProgram);
  }
  async deleteProgram(id) {
    const result = await this.db.delete(programs).where(eq(programs.id, id)).returning();
    return result.length > 0;
  }
  // Athlete methods
  async getAthletes() {
    const dbAthletes = await this.db.select().from(athletes);
    const dbPhases = await this.db.select().from(phases);
    const dbBlocks = await this.db.select().from(blocks);
    return dbAthletes.map((athlete) => {
      const athletePhases = dbPhases.filter((p) => p.athleteId === athlete.id).map(this.mapDbPhaseToPhase);
      const currentPhase = athlete.currentPhaseId ? athletePhases.find((p) => p.id === athlete.currentPhaseId) : void 0;
      const athleteBlocks = dbBlocks.filter((b) => b.athleteId === athlete.id).map(this.mapDbBlockToBlock);
      const phaseBlocks = currentPhase ? athleteBlocks.filter((b) => b.phaseId === currentPhase.id) : [];
      return {
        athlete: this.mapDbAthleteToAthlete(athlete, athletePhases),
        currentPhase: currentPhase ?? void 0,
        blocks: phaseBlocks
      };
    });
  }
  // Block methods
  async getBlocksByPhase(athleteId, phaseId) {
    const dbBlocks = await this.db.select().from(blocks).where(and(eq(blocks.athleteId, athleteId), eq(blocks.phaseId, phaseId)));
    return dbBlocks.map(this.mapDbBlockToBlock);
  }
  async createBlock(blockData) {
    const id = randomUUID();
    const now = /* @__PURE__ */ new Date();
    const [dbBlock] = await this.db.insert(blocks).values({
      id,
      athleteId: blockData.athleteId,
      phaseId: blockData.phaseId,
      blockNumber: blockData.blockNumber,
      name: blockData.name,
      startDate: blockData.startDate,
      endDate: blockData.endDate,
      duration: blockData.duration,
      season: blockData.season,
      subSeason: blockData.subSeason ?? null,
      status: blockData.status,
      currentDay: blockData.currentDay ?? null,
      throwing: blockData.throwing ?? null,
      movement: blockData.movement ?? null,
      lifting: blockData.lifting ?? null,
      conditioning: blockData.conditioning ?? null,
      lastModification: blockData.lastModification ? new Date(blockData.lastModification) : null,
      createdAt: now,
      updatedAt: now
    }).returning();
    return this.mapDbBlockToBlock(dbBlock);
  }
  async updateBlock(blockId, updates) {
    const updateData = {
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (updates.blockNumber !== void 0) updateData.blockNumber = updates.blockNumber;
    if (updates.name !== void 0) updateData.name = updates.name;
    if (updates.startDate !== void 0) updateData.startDate = updates.startDate;
    if (updates.endDate !== void 0) updateData.endDate = updates.endDate;
    if (updates.duration !== void 0) updateData.duration = updates.duration;
    if (updates.season !== void 0) updateData.season = updates.season;
    if (updates.subSeason !== void 0) updateData.subSeason = updates.subSeason;
    if (updates.status !== void 0) updateData.status = updates.status;
    if (updates.currentDay !== void 0) updateData.currentDay = updates.currentDay;
    if (updates.throwing !== void 0) updateData.throwing = updates.throwing;
    if (updates.movement !== void 0) updateData.movement = updates.movement;
    if (updates.lifting !== void 0) updateData.lifting = updates.lifting;
    if (updates.conditioning !== void 0) updateData.conditioning = updates.conditioning;
    if (updates.lastModification !== void 0)
      updateData.lastModification = updates.lastModification ? new Date(updates.lastModification) : null;
    const result = await this.db.update(blocks).set(updateData).where(eq(blocks.id, blockId)).returning();
    return result[0] ? this.mapDbBlockToBlock(result[0]) : void 0;
  }
  async deleteBlock(blockId) {
    const result = await this.db.delete(blocks).where(eq(blocks.id, blockId)).returning();
    return result.length > 0;
  }
  async signOffBlock(blockId) {
    const result = await this.db.update(blocks).set({
      status: "active",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(blocks.id, blockId)).returning();
    return result[0] ? this.mapDbBlockToBlock(result[0]) : void 0;
  }
  // Helper methods to map database types to TypeScript interfaces
  mapDbProgramToProgram(dbProgram) {
    return {
      id: dbProgram.id,
      programId: dbProgram.programId,
      athleteId: dbProgram.athleteId,
      athleteName: dbProgram.athleteName,
      startDate: dbProgram.startDate,
      endDate: dbProgram.endDate,
      routineTypes: dbProgram.routineTypes,
      blockDuration: dbProgram.blockDuration,
      status: dbProgram.status,
      season: dbProgram.season ?? void 0,
      subSeason: dbProgram.subSeason ?? void 0,
      lastModification: dbProgram.lastModification?.toISOString(),
      lastSubmission: dbProgram.lastSubmission?.toISOString(),
      currentDay: dbProgram.currentDay,
      nextBlockDue: dbProgram.nextBlockDue?.toISOString(),
      daysComplete: dbProgram.daysComplete ?? void 0,
      daysAvailable: dbProgram.daysAvailable ?? void 0
    };
  }
  mapDbAthleteToAthlete(dbAthlete, phasesList) {
    return {
      id: dbAthlete.id,
      name: dbAthlete.name,
      photo: dbAthlete.photo ?? void 0,
      status: dbAthlete.status,
      currentPhaseId: dbAthlete.currentPhaseId ?? void 0,
      phases: phasesList
    };
  }
  mapDbPhaseToPhase(dbPhase) {
    return {
      id: dbPhase.id,
      athleteId: dbPhase.athleteId,
      phaseNumber: dbPhase.phaseNumber,
      startDate: dbPhase.startDate,
      endDate: dbPhase.endDate,
      status: dbPhase.status
    };
  }
  mapDbBlockToBlock(dbBlock) {
    return {
      id: dbBlock.id,
      athleteId: dbBlock.athleteId,
      phaseId: dbBlock.phaseId,
      blockNumber: dbBlock.blockNumber,
      name: dbBlock.name,
      startDate: dbBlock.startDate,
      endDate: dbBlock.endDate,
      duration: dbBlock.duration,
      season: dbBlock.season,
      subSeason: dbBlock.subSeason,
      status: dbBlock.status,
      currentDay: dbBlock.currentDay,
      throwing: dbBlock.throwing,
      movement: dbBlock.movement,
      lifting: dbBlock.lifting,
      conditioning: dbBlock.conditioning,
      lastModification: dbBlock.lastModification?.toISOString(),
      createdAt: dbBlock.createdAt.toISOString(),
      updatedAt: dbBlock.updatedAt.toISOString()
    };
  }
};

// server/storage.ts
function generateProgramId2() {
  const randomDigits = Math.floor(1e5 + Math.random() * 9e5);
  return `P${randomDigits}`;
}
var MemStorage = class {
  users;
  programs;
  athletes;
  blocks;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.programs = /* @__PURE__ */ new Map();
    this.athletes = /* @__PURE__ */ new Map();
    this.blocks = /* @__PURE__ */ new Map();
    const seedAthletes = generateSeedAthletes();
    seedAthletes.forEach((athleteData) => {
      this.athletes.set(athleteData.athlete.id, athleteData);
      athleteData.blocks.forEach((block) => {
        this.blocks.set(block.id, block);
      });
    });
    const today2 = /* @__PURE__ */ new Date();
    const futureDate1 = new Date(today2);
    futureDate1.setMonth(today2.getMonth() + 2);
    const futureDate2 = new Date(today2);
    futureDate2.setMonth(today2.getMonth() + 3);
    const futureDate3 = new Date(today2);
    futureDate3.setMonth(today2.getMonth() + 4);
    const futureDate4 = new Date(today2);
    futureDate4.setMonth(today2.getMonth() + 5);
    const startDate1 = new Date(today2);
    startDate1.setMonth(today2.getMonth() - 1);
    const startDate2 = new Date(today2);
    startDate2.setMonth(today2.getMonth() - 2);
    const startDate3 = new Date(today2);
    startDate3.setMonth(today2.getMonth() - 1);
    const startDate4 = new Date(today2);
    startDate4.setMonth(today2.getMonth() - 2);
    const daysAgo2 = (days) => {
      const date2 = new Date(today2);
      date2.setDate(date2.getDate() - days);
      return date2.toISOString();
    };
    const daysFromNow2 = (days) => {
      const date2 = new Date(today2);
      date2.setDate(date2.getDate() + days);
      return date2.toISOString();
    };
    const startDate5 = new Date(today2);
    startDate5.setMonth(today2.getMonth() - 3);
    const startDate6 = new Date(today2);
    startDate6.setMonth(today2.getMonth() - 1);
    const startDate7 = new Date(today2);
    startDate7.setMonth(today2.getMonth() - 2);
    const startDate8 = new Date(today2);
    startDate8.setMonth(today2.getMonth() - 1);
    const startDate9 = new Date(today2);
    startDate9.setMonth(today2.getMonth() - 2);
    const startDate10 = new Date(today2);
    startDate10.setMonth(today2.getMonth() - 3);
    const futureDate5 = new Date(today2);
    futureDate5.setMonth(today2.getMonth() + 6);
    const futureDate6 = new Date(today2);
    futureDate6.setMonth(today2.getMonth() + 2);
    const futureDate7 = new Date(today2);
    futureDate7.setMonth(today2.getMonth() + 3);
    const futureDate8 = new Date(today2);
    futureDate8.setMonth(today2.getMonth() + 4);
    const futureDate9 = new Date(today2);
    futureDate9.setMonth(today2.getMonth() + 5);
    const futureDate10 = new Date(today2);
    futureDate10.setMonth(today2.getMonth() + 6);
    const initialPrograms = [
      // Active programs
      {
        id: "1",
        programId: "P123456",
        athleteId: "1",
        athleteName: "Marcus Johnson",
        startDate: startDate1.toISOString().split("T")[0],
        endDate: futureDate1.toISOString().split("T")[0],
        routineTypes: ["movement", "throwing"],
        blockDuration: 8,
        status: "injured",
        season: "Pre-Season",
        subSeason: "Early",
        lastModification: daysAgo2(3),
        lastSubmission: daysAgo2(1),
        currentDay: { block: 1, week: 2, day: 3 },
        nextBlockDue: daysFromNow2(5),
        daysComplete: 12,
        daysAvailable: 32
      },
      {
        id: "2",
        programId: "P789012",
        athleteId: "2",
        athleteName: "Michael Chen",
        startDate: startDate2.toISOString().split("T")[0],
        endDate: futureDate2.toISOString().split("T")[0],
        routineTypes: ["lifting", "nutrition"],
        blockDuration: 12,
        status: void 0,
        season: "In-Season",
        subSeason: "Mid",
        lastModification: daysAgo2(7),
        lastSubmission: daysAgo2(2),
        currentDay: { block: 2, week: 1, day: 2 },
        nextBlockDue: daysFromNow2(12),
        daysComplete: 24,
        daysAvailable: 48
      },
      {
        id: "3",
        programId: "P345678",
        athleteId: "3",
        athleteName: "Alexander Rodriguez",
        startDate: startDate3.toISOString().split("T")[0],
        endDate: futureDate3.toISOString().split("T")[0],
        routineTypes: ["movement", "throwing", "lifting", "nutrition"],
        blockDuration: 8,
        status: "rehabbing",
        season: "Off-Season",
        subSeason: "Late",
        lastModification: daysAgo2(1),
        lastSubmission: daysAgo2(0),
        currentDay: { block: 1, week: 3, day: 1 },
        nextBlockDue: daysFromNow2(8),
        daysComplete: 18,
        daysAvailable: 32
      },
      {
        id: "4",
        programId: "P901234",
        athleteId: "4",
        athleteName: "James Williams",
        startDate: startDate4.toISOString().split("T")[0],
        endDate: futureDate4.toISOString().split("T")[0],
        routineTypes: ["throwing", "lifting"],
        blockDuration: 12,
        status: "lingering-issues",
        season: "Pre-Season",
        subSeason: void 0,
        lastModification: daysAgo2(5),
        lastSubmission: daysAgo2(3),
        currentDay: { block: 2, week: 2, day: 4 },
        nextBlockDue: daysFromNow2(15),
        daysComplete: 30,
        daysAvailable: 48
      },
      {
        id: "5",
        programId: "P456789",
        athleteId: "5",
        athleteName: "Ryan Martinez",
        startDate: startDate5.toISOString().split("T")[0],
        endDate: futureDate5.toISOString().split("T")[0],
        routineTypes: ["movement", "lifting"],
        blockDuration: 10,
        status: void 0,
        season: "In-Season",
        subSeason: "Early",
        lastModification: daysAgo2(4),
        lastSubmission: daysAgo2(2),
        currentDay: { block: 3, week: 1, day: 1 },
        nextBlockDue: daysFromNow2(20),
        daysComplete: 28,
        daysAvailable: 40
      },
      {
        id: "6",
        programId: "P567890",
        athleteId: "6",
        athleteName: "Ethan Thompson",
        startDate: startDate6.toISOString().split("T")[0],
        endDate: futureDate6.toISOString().split("T")[0],
        routineTypes: ["throwing", "movement", "nutrition"],
        blockDuration: 8,
        status: void 0,
        season: "Pre-Season",
        subSeason: "Mid",
        lastModification: daysAgo2(2),
        lastSubmission: daysAgo2(1),
        currentDay: { block: 1, week: 4, day: 2 },
        nextBlockDue: daysFromNow2(3),
        daysComplete: 20,
        daysAvailable: 32
      },
      {
        id: "9",
        programId: "P234567",
        athleteId: "9",
        athleteName: "Noah Anderson",
        startDate: startDate7.toISOString().split("T")[0],
        endDate: futureDate7.toISOString().split("T")[0],
        routineTypes: ["lifting", "movement"],
        blockDuration: 12,
        status: "injured",
        season: "Off-Season",
        subSeason: "Mid",
        lastModification: daysAgo2(6),
        lastSubmission: daysAgo2(4),
        currentDay: { block: 2, week: 3, day: 1 },
        nextBlockDue: daysFromNow2(10),
        daysComplete: 22,
        daysAvailable: 48
      },
      {
        id: "10",
        programId: "P345123",
        athleteId: "10",
        athleteName: "Lucas Garcia",
        startDate: startDate8.toISOString().split("T")[0],
        endDate: futureDate8.toISOString().split("T")[0],
        routineTypes: ["throwing", "nutrition"],
        blockDuration: 8,
        status: void 0,
        season: "In-Season",
        subSeason: "Late",
        lastModification: daysAgo2(1),
        lastSubmission: daysAgo2(0),
        currentDay: { block: 1, week: 1, day: 4 },
        nextBlockDue: daysFromNow2(6),
        daysComplete: 8,
        daysAvailable: 32
      },
      {
        id: "11",
        programId: "P456234",
        athleteId: "11",
        athleteName: "Mason Taylor",
        startDate: startDate9.toISOString().split("T")[0],
        endDate: futureDate9.toISOString().split("T")[0],
        routineTypes: ["movement", "throwing", "lifting"],
        blockDuration: 10,
        status: "rehabbing",
        season: "Pre-Season",
        subSeason: "Early",
        lastModification: daysAgo2(8),
        lastSubmission: daysAgo2(5),
        currentDay: { block: 2, week: 2, day: 3 },
        nextBlockDue: daysFromNow2(18),
        daysComplete: 26,
        daysAvailable: 40
      },
      {
        id: "12",
        programId: "P567345",
        athleteId: "12",
        athleteName: "Aiden Wilson",
        startDate: startDate10.toISOString().split("T")[0],
        endDate: futureDate10.toISOString().split("T")[0],
        routineTypes: ["lifting", "nutrition"],
        blockDuration: 12,
        status: void 0,
        season: "Off-Season",
        subSeason: "Early",
        lastModification: daysAgo2(9),
        lastSubmission: daysAgo2(6),
        currentDay: { block: 3, week: 2, day: 2 },
        nextBlockDue: daysFromNow2(25),
        daysComplete: 32,
        daysAvailable: 48
      },
      // Completed programs (past end dates)
      {
        id: "7",
        programId: "P111111",
        athleteId: "7",
        athleteName: "David Lee",
        startDate: "2024-11-01",
        endDate: "2024-12-31",
        routineTypes: ["lifting"],
        blockDuration: 8,
        status: void 0,
        season: "Off-Season",
        subSeason: "Early",
        lastModification: "2024-12-15T00:00:00.000Z",
        lastSubmission: "2024-12-20T00:00:00.000Z",
        currentDay: { block: 4, week: 2, day: 3 },
        nextBlockDue: void 0,
        daysComplete: 32,
        daysAvailable: 32
      },
      {
        id: "8",
        programId: "P222222",
        athleteId: "8",
        athleteName: "Thomas Brown",
        startDate: "2024-10-15",
        endDate: "2024-12-15",
        routineTypes: ["movement", "throwing"],
        blockDuration: 8,
        status: void 0,
        season: "In-Season",
        subSeason: "Late",
        lastModification: "2024-12-10T00:00:00.000Z",
        lastSubmission: "2024-12-12T00:00:00.000Z",
        currentDay: { block: 3, week: 4, day: 2 },
        nextBlockDue: void 0,
        daysComplete: 28,
        daysAvailable: 32
      },
      {
        id: "13",
        programId: "P333333",
        athleteId: "13",
        athleteName: "Christopher Davis",
        startDate: "2024-09-01",
        endDate: "2024-11-30",
        routineTypes: ["throwing", "lifting", "movement"],
        blockDuration: 12,
        status: "lingering-issues",
        season: "Pre-Season",
        subSeason: "Mid",
        lastModification: "2024-11-25T00:00:00.000Z",
        lastSubmission: "2024-11-28T00:00:00.000Z",
        currentDay: { block: 4, week: 3, day: 1 },
        nextBlockDue: void 0,
        daysComplete: 45,
        daysAvailable: 48
      },
      {
        id: "14",
        programId: "P444444",
        athleteId: "14",
        athleteName: "Daniel Moore",
        startDate: "2024-08-15",
        endDate: "2024-10-15",
        routineTypes: ["movement", "nutrition"],
        blockDuration: 8,
        status: void 0,
        season: "Off-Season",
        subSeason: "Late",
        lastModification: "2024-10-10T00:00:00.000Z",
        lastSubmission: "2024-10-12T00:00:00.000Z",
        currentDay: { block: 3, week: 4, day: 4 },
        nextBlockDue: void 0,
        daysComplete: 30,
        daysAvailable: 32
      },
      {
        id: "15",
        programId: "P555555",
        athleteId: "15",
        athleteName: "Matthew Jackson",
        startDate: "2024-07-01",
        endDate: "2024-09-30",
        routineTypes: ["lifting", "throwing"],
        blockDuration: 12,
        status: void 0,
        season: "In-Season",
        subSeason: "Early",
        lastModification: "2024-09-20T00:00:00.000Z",
        lastSubmission: "2024-09-25T00:00:00.000Z",
        currentDay: { block: 4, week: 2, day: 2 },
        nextBlockDue: void 0,
        daysComplete: 46,
        daysAvailable: 48
      }
    ];
    initialPrograms.forEach((program) => {
      this.programs.set(program.id, program);
    });
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID2();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getPrograms() {
    return Array.from(this.programs.values());
  }
  async getProgram(id) {
    return this.programs.get(id);
  }
  async createProgram(insertProgram) {
    const id = randomUUID2();
    const programId = generateProgramId2();
    const program = { ...insertProgram, id, programId };
    this.programs.set(id, program);
    return program;
  }
  async deleteProgram(id) {
    return this.programs.delete(id);
  }
  // Get athlete-centric data from seed data
  async getAthletes() {
    return Array.from(this.athletes.values());
  }
  // Blocks CRUD methods
  async getBlocksByPhase(athleteId, phaseId) {
    return Array.from(this.blocks.values()).filter(
      (block) => block.athleteId === athleteId && block.phaseId === phaseId
    );
  }
  async createBlock(blockData) {
    const id = randomUUID2();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const block = {
      ...blockData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.blocks.set(id, block);
    return block;
  }
  async updateBlock(blockId, updates) {
    const block = this.blocks.get(blockId);
    if (!block) {
      return void 0;
    }
    const updatedBlock = {
      ...block,
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.blocks.set(blockId, updatedBlock);
    return updatedBlock;
  }
  async deleteBlock(blockId) {
    return this.blocks.delete(blockId);
  }
  async signOffBlock(blockId) {
    const block = this.blocks.get(blockId);
    if (!block) {
      return void 0;
    }
    const updatedBlock = {
      ...block,
      status: "active",
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.blocks.set(blockId, updatedBlock);
    return updatedBlock;
  }
  determineBlockStatus(program) {
    const today2 = /* @__PURE__ */ new Date();
    today2.setHours(0, 0, 0, 0);
    const endDate = new Date(program.endDate);
    endDate.setHours(0, 0, 0, 0);
    if (endDate < today2) {
      return "complete";
    }
    return "active";
  }
};
var storageInstance = null;
function getStorage() {
  if (!storageInstance) {
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      try {
        storageInstance = new DbStorage(databaseUrl);
      } catch (error) {
        console.error("Failed to initialize DbStorage, falling back to MemStorage:", error);
        storageInstance = new MemStorage();
      }
    } else {
      storageInstance = new MemStorage();
    }
  }
  return storageInstance;
}
var StorageProxy = class {
  getUser(id) {
    return getStorage().getUser(id);
  }
  getUserByUsername(username) {
    return getStorage().getUserByUsername(username);
  }
  createUser(user) {
    return getStorage().createUser(user);
  }
  getPrograms() {
    return getStorage().getPrograms();
  }
  getProgram(id) {
    return getStorage().getProgram(id);
  }
  createProgram(program) {
    return getStorage().createProgram(program);
  }
  deleteProgram(id) {
    return getStorage().deleteProgram(id);
  }
  getAthletes() {
    return getStorage().getAthletes();
  }
  getBlocksByPhase(athleteId, phaseId) {
    return getStorage().getBlocksByPhase(athleteId, phaseId);
  }
  createBlock(block) {
    return getStorage().createBlock(block);
  }
  updateBlock(blockId, updates) {
    return getStorage().updateBlock(blockId, updates);
  }
  deleteBlock(blockId) {
    return getStorage().deleteBlock(blockId);
  }
  signOffBlock(blockId) {
    return getStorage().signOffBlock(blockId);
  }
};
var storage = new StorageProxy();

// server/routes.ts
import { z } from "zod";
var insertProgramSchema = z.object({
  athleteId: z.string(),
  athleteName: z.string(),
  blockDuration: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  routineTypes: z.array(z.string())
});
var createBlockSchema = z.object({
  phaseId: z.string(),
  blockNumber: z.number(),
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  duration: z.number(),
  season: z.enum(["Pre-Season", "In-Season", "Off-Season", "Redshirt"]),
  subSeason: z.enum(["Early", "Mid", "Late", "General Off-Season (GOS)"]).optional(),
  status: z.enum(["draft", "pending-signoff", "active", "complete"]),
  currentDay: z.object({
    week: z.number(),
    day: z.number()
  }).optional(),
  throwing: z.object({
    xRole: z.string(),
    phase: z.string(),
    exclusions: z.string().optional()
  }).optional(),
  movement: z.object({
    intensity: z.string(),
    volume: z.string()
  }).optional(),
  lifting: z.object({
    split: z.string(),
    emphasis: z.string(),
    variability: z.string(),
    scheme: z.string()
  }).optional(),
  conditioning: z.object({
    coreEmphasis: z.string(),
    adaptation: z.string(),
    method: z.string()
  }).optional(),
  lastModification: z.string().optional()
});
async function registerRoutes(app2) {
  app2.get("/api/athletes", async (_req, res) => {
    try {
      const athletes2 = await storage.getAthletes();
      res.json(athletes2);
    } catch (error) {
      console.error("Error fetching athletes:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: "Failed to fetch athletes", details: errorMessage });
    }
  });
  app2.get("/api/programs", async (_req, res) => {
    try {
      const programs2 = await storage.getPrograms();
      res.json(programs2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch programs" });
    }
  });
  app2.post("/api/programs", async (req, res) => {
    try {
      const validatedData = insertProgramSchema.parse(req.body);
      const program = await storage.createProgram(validatedData);
      res.status(201).json(program);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create program" });
      }
    }
  });
  app2.delete("/api/programs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProgram(id);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Program not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete program" });
    }
  });
  app2.get("/api/athletes/:athleteId/phases/:phaseId/blocks", async (req, res) => {
    try {
      const { athleteId, phaseId } = req.params;
      const blocks2 = await storage.getBlocksByPhase(athleteId, phaseId);
      res.json(blocks2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blocks" });
    }
  });
  app2.post("/api/athletes/:athleteId/phases/:phaseId/blocks", async (req, res) => {
    try {
      const { athleteId, phaseId } = req.params;
      const validatedData = createBlockSchema.parse(req.body);
      const block = await storage.createBlock({
        ...validatedData,
        athleteId,
        phaseId
      });
      res.status(201).json(block);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create block" });
      }
    }
  });
  app2.put("/api/blocks/:blockId", async (req, res) => {
    try {
      const { blockId } = req.params;
      const updates = req.body;
      const updatedBlock = await storage.updateBlock(blockId, updates);
      if (updatedBlock) {
        res.json(updatedBlock);
      } else {
        res.status(404).json({ error: "Block not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update block" });
    }
  });
  app2.delete("/api/blocks/:blockId", async (req, res) => {
    try {
      const { blockId } = req.params;
      const deleted = await storage.deleteBlock(blockId);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Block not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete block" });
    }
  });
  app2.post("/api/blocks/:blockId/sign-off", async (req, res) => {
    try {
      const { blockId } = req.params;
      const signedOffBlock = await storage.signOffBlock(blockId);
      if (signedOffBlock) {
        res.json(signedOffBlock);
      } else {
        res.status(404).json({ error: "Block not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to sign off block" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-runtime-error-modal").then(
        (m) => m.default()
      ),
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// api/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
var appInitialized = false;
var initPromise = null;
async function initializeApp() {
  if (appInitialized) return;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    await registerRoutes(app);
    app.use((err, _req, res, _next) => {
      const status = err.status ?? err.statusCode ?? 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });
    appInitialized = true;
  })();
  return initPromise;
}
async function handler(req, res) {
  await initializeApp();
  app(req, res);
}
export {
  handler as default
};
