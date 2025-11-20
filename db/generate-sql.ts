import { generateSeedAthletes } from "./seed";

// Helper functions for date manipulation
const today = new Date();
today.setHours(0, 0, 0, 0);

const daysAgo = (days: number): string => {
  const date = new Date(today);
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

const daysFromNow = (days: number): string => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const timestampAgo = (days: number): string => {
  const date = new Date(today);
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const timestampFromNow = (days: number): string => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

function escapeJson(json: any): string {
  if (json === null || json === undefined) return 'NULL';
  return `'${JSON.stringify(json).replace(/'/g, "''")}'`;
}

function escapeString(str: string | null | undefined): string {
  if (str === null || str === undefined) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

async function generateSQL() {
  console.log("Generating SQL INSERT statements...\n");

  let sql = "-- ============================================\n";
  sql += "-- AUTO-GENERATED SQL INSERT STATEMENTS\n";
  sql += "-- Generated: " + new Date().toISOString() + "\n";
  sql += "-- ============================================\n\n";

  // Generate athletes and phases from seed data
  const seedAthletes = generateSeedAthletes();

  // Insert Athletes
  sql += "-- Insert Athletes\n";
  sql += "INSERT INTO athletes (id, name, photo, status, current_phase_id) VALUES\n";
  const athleteValues = seedAthletes.map((a, idx) => {
    const athlete = a.athlete;
    return `('${athlete.id}', ${escapeString(athlete.name)}, ${athlete.photo ? escapeString(athlete.photo) : 'NULL'}, ${athlete.status ? escapeString(athlete.status) : 'NULL'}, ${athlete.currentPhaseId ? escapeString(athlete.currentPhaseId) : 'NULL'})`;
  });
  sql += athleteValues.join(',\n') + "\n";
  sql += "ON CONFLICT (id) DO NOTHING;\n\n";

  // Insert Phases
  sql += "-- Insert Phases\n";
  sql += "INSERT INTO phases (id, athlete_id, phase_number, start_date, end_date, status) VALUES\n";
  const phaseValues: string[] = [];
  seedAthletes.forEach(a => {
    if (a.currentPhase) {
      const phase = a.currentPhase;
      phaseValues.push(`('${phase.id}', '${phase.athleteId}', ${phase.phaseNumber}, '${phase.startDate}', '${phase.endDate}', '${phase.status}')`);
    }
  });
  sql += phaseValues.join(',\n') + "\n";
  sql += "ON CONFLICT (id) DO NOTHING;\n\n";

  // Insert Blocks
  sql += "-- Insert Blocks\n";
  sql += "INSERT INTO blocks (id, athlete_id, phase_id, block_number, name, start_date, end_date, duration, season, sub_season, status, current_day, throwing, movement, lifting, conditioning, last_modification, last_submission, next_block_due, created_at, updated_at) VALUES\n";
  const blockValues: string[] = [];
  seedAthletes.forEach(a => {
    a.blocks.forEach(block => {
      blockValues.push(`('${block.id}', '${block.athleteId}', '${block.phaseId}', ${block.blockNumber}, ${escapeString(block.name)}, '${block.startDate}', '${block.endDate}', ${block.duration}, '${block.season}', ${block.subSeason ? escapeString(block.subSeason) : 'NULL'}, '${block.status}', ${escapeJson(block.currentDay)}, ${escapeJson(block.throwing)}, ${escapeJson(block.movement)}, ${escapeJson(block.lifting)}, ${escapeJson(block.conditioning)}, ${block.lastModification ? `'${block.lastModification}'` : 'NULL'}, ${block.lastSubmission ? `'${block.lastSubmission}'` : 'NULL'}, ${block.nextBlockDue ? `'${block.nextBlockDue}'` : 'NULL'}, '${block.createdAt}', '${block.updatedAt}')`);
    });
  });
  sql += blockValues.join(',\n') + "\n";
  sql += "ON CONFLICT (id) DO NOTHING;\n\n";

  // Generate programs data
  const futureDate1 = new Date(today);
  futureDate1.setMonth(today.getMonth() + 2);
  const futureDate2 = new Date(today);
  futureDate2.setMonth(today.getMonth() + 3);
  const futureDate3 = new Date(today);
  futureDate3.setMonth(today.getMonth() + 4);
  const futureDate4 = new Date(today);
  futureDate4.setMonth(today.getMonth() + 5);
  const startDate1 = new Date(today);
  startDate1.setMonth(today.getMonth() - 1);
  const startDate2 = new Date(today);
  startDate2.setMonth(today.getMonth() - 2);
  const startDate3 = new Date(today);
  startDate3.setMonth(today.getMonth() - 1);
  const startDate4 = new Date(today);
  startDate4.setMonth(today.getMonth() - 2);
  const startDate5 = new Date(today);
  startDate5.setMonth(today.getMonth() - 3);
  const startDate6 = new Date(today);
  startDate6.setMonth(today.getMonth() - 1);
  const startDate7 = new Date(today);
  startDate7.setMonth(today.getMonth() - 2);
  const startDate8 = new Date(today);
  startDate8.setMonth(today.getMonth() - 1);
  const startDate9 = new Date(today);
  startDate9.setMonth(today.getMonth() - 2);
  const startDate10 = new Date(today);
  startDate10.setMonth(today.getMonth() - 3);
  const futureDate5 = new Date(today);
  futureDate5.setMonth(today.getMonth() + 6);
  const futureDate6 = new Date(today);
  futureDate6.setMonth(today.getMonth() + 2);
  const futureDate7 = new Date(today);
  futureDate7.setMonth(today.getMonth() + 3);
  const futureDate8 = new Date(today);
  futureDate8.setMonth(today.getMonth() + 4);
  const futureDate9 = new Date(today);
  futureDate9.setMonth(today.getMonth() + 5);
  const futureDate10 = new Date(today);
  futureDate10.setMonth(today.getMonth() + 6);

  const programs = [
    { id: "1", programId: "P123456", athleteId: "1", athleteName: "Marcus Johnson", startDate: startDate1.toISOString().split('T')[0], endDate: futureDate1.toISOString().split('T')[0], routineTypes: ["movement", "throwing"], blockDuration: 8, status: "injured", season: "Pre-Season", subSeason: "Early", lastModification: timestampAgo(3), lastSubmission: timestampAgo(1), currentDay: { block: 1, week: 2, day: 3 }, nextBlockDue: timestampFromNow(5), daysComplete: 12, daysAvailable: 32 },
    { id: "2", programId: "P789012", athleteId: "2", athleteName: "Michael Chen", startDate: startDate2.toISOString().split('T')[0], endDate: futureDate2.toISOString().split('T')[0], routineTypes: ["lifting", "nutrition"], blockDuration: 12, status: null, season: "In-Season", subSeason: "Mid", lastModification: timestampAgo(7), lastSubmission: timestampAgo(2), currentDay: { block: 2, week: 1, day: 2 }, nextBlockDue: timestampFromNow(12), daysComplete: 24, daysAvailable: 48 },
    { id: "3", programId: "P345678", athleteId: "3", athleteName: "Alexander Rodriguez", startDate: startDate3.toISOString().split('T')[0], endDate: futureDate3.toISOString().split('T')[0], routineTypes: ["movement", "throwing", "lifting", "nutrition"], blockDuration: 8, status: "rehabbing", season: "Off-Season", subSeason: "Late", lastModification: timestampAgo(1), lastSubmission: timestampAgo(0), currentDay: { block: 1, week: 3, day: 1 }, nextBlockDue: timestampFromNow(8), daysComplete: 18, daysAvailable: 32 },
    { id: "4", programId: "P901234", athleteId: "4", athleteName: "James Williams", startDate: startDate4.toISOString().split('T')[0], endDate: futureDate4.toISOString().split('T')[0], routineTypes: ["throwing", "lifting"], blockDuration: 12, status: "lingering-issues", season: "Pre-Season", subSeason: null, lastModification: timestampAgo(5), lastSubmission: timestampAgo(3), currentDay: { block: 2, week: 2, day: 4 }, nextBlockDue: timestampFromNow(15), daysComplete: 30, daysAvailable: 48 },
    { id: "5", programId: "P456789", athleteId: "5", athleteName: "Ryan Martinez", startDate: startDate5.toISOString().split('T')[0], endDate: futureDate5.toISOString().split('T')[0], routineTypes: ["movement", "lifting"], blockDuration: 10, status: null, season: "In-Season", subSeason: "Early", lastModification: timestampAgo(4), lastSubmission: timestampAgo(2), currentDay: { block: 3, week: 1, day: 1 }, nextBlockDue: timestampFromNow(20), daysComplete: 28, daysAvailable: 40 },
    { id: "6", programId: "P567890", athleteId: "6", athleteName: "Ethan Thompson", startDate: startDate6.toISOString().split('T')[0], endDate: futureDate6.toISOString().split('T')[0], routineTypes: ["throwing", "movement", "nutrition"], blockDuration: 8, status: null, season: "Pre-Season", subSeason: "Mid", lastModification: timestampAgo(2), lastSubmission: timestampAgo(1), currentDay: { block: 1, week: 4, day: 2 }, nextBlockDue: timestampFromNow(3), daysComplete: 20, daysAvailable: 32 },
    { id: "9", programId: "P234567", athleteId: "9", athleteName: "Noah Anderson", startDate: startDate7.toISOString().split('T')[0], endDate: futureDate7.toISOString().split('T')[0], routineTypes: ["lifting", "movement"], blockDuration: 12, status: "injured", season: "Off-Season", subSeason: "Mid", lastModification: timestampAgo(6), lastSubmission: timestampAgo(4), currentDay: { block: 2, week: 3, day: 1 }, nextBlockDue: timestampFromNow(10), daysComplete: 22, daysAvailable: 48 },
    { id: "10", programId: "P345123", athleteId: "10", athleteName: "Lucas Garcia", startDate: startDate8.toISOString().split('T')[0], endDate: futureDate8.toISOString().split('T')[0], routineTypes: ["throwing", "nutrition"], blockDuration: 8, status: null, season: "In-Season", subSeason: "Late", lastModification: timestampAgo(1), lastSubmission: timestampAgo(0), currentDay: { block: 1, week: 1, day: 4 }, nextBlockDue: timestampFromNow(6), daysComplete: 8, daysAvailable: 32 },
    { id: "11", programId: "P456234", athleteId: "11", athleteName: "Mason Taylor", startDate: startDate9.toISOString().split('T')[0], endDate: futureDate9.toISOString().split('T')[0], routineTypes: ["movement", "throwing", "lifting"], blockDuration: 10, status: "rehabbing", season: "Pre-Season", subSeason: "Early", lastModification: timestampAgo(8), lastSubmission: timestampAgo(5), currentDay: { block: 2, week: 2, day: 3 }, nextBlockDue: timestampFromNow(18), daysComplete: 26, daysAvailable: 40 },
    { id: "12", programId: "P567345", athleteId: "12", athleteName: "Aiden Wilson", startDate: startDate10.toISOString().split('T')[0], endDate: futureDate10.toISOString().split('T')[0], routineTypes: ["lifting", "nutrition"], blockDuration: 12, status: null, season: "Off-Season", subSeason: "Early", lastModification: timestampAgo(9), lastSubmission: timestampAgo(6), currentDay: { block: 3, week: 2, day: 2 }, nextBlockDue: timestampFromNow(25), daysComplete: 32, daysAvailable: 48 },
    { id: "7", programId: "P111111", athleteId: "7", athleteName: "David Lee", startDate: "2024-11-01", endDate: "2024-12-31", routineTypes: ["lifting"], blockDuration: 8, status: null, season: "Off-Season", subSeason: "Early", lastModification: "2024-12-15T00:00:00.000Z", lastSubmission: "2024-12-20T00:00:00.000Z", currentDay: { block: 4, week: 2, day: 3 }, nextBlockDue: null, daysComplete: 32, daysAvailable: 32 },
    { id: "8", programId: "P222222", athleteId: "8", athleteName: "Thomas Brown", startDate: "2024-10-15", endDate: "2024-12-15", routineTypes: ["movement", "throwing"], blockDuration: 8, status: null, season: "In-Season", subSeason: "Late", lastModification: "2024-12-10T00:00:00.000Z", lastSubmission: "2024-12-12T00:00:00.000Z", currentDay: { block: 3, week: 4, day: 2 }, nextBlockDue: null, daysComplete: 28, daysAvailable: 32 },
    { id: "13", programId: "P333333", athleteId: "13", athleteName: "Christopher Davis", startDate: "2024-09-01", endDate: "2024-11-30", routineTypes: ["throwing", "lifting", "movement"], blockDuration: 12, status: "lingering-issues", season: "Pre-Season", subSeason: "Mid", lastModification: "2024-11-25T00:00:00.000Z", lastSubmission: "2024-11-28T00:00:00.000Z", currentDay: { block: 4, week: 3, day: 1 }, nextBlockDue: null, daysComplete: 45, daysAvailable: 48 },
    { id: "14", programId: "P444444", athleteId: "14", athleteName: "Daniel Moore", startDate: "2024-08-15", endDate: "2024-10-15", routineTypes: ["movement", "nutrition"], blockDuration: 8, status: null, season: "Off-Season", subSeason: "Late", lastModification: "2024-10-10T00:00:00.000Z", lastSubmission: "2024-10-12T00:00:00.000Z", currentDay: { block: 3, week: 4, day: 4 }, nextBlockDue: null, daysComplete: 30, daysAvailable: 32 },
    { id: "15", programId: "P555555", athleteId: "15", athleteName: "Matthew Jackson", startDate: "2024-07-01", endDate: "2024-09-30", routineTypes: ["lifting", "throwing"], blockDuration: 12, status: null, season: "In-Season", subSeason: "Early", lastModification: "2024-09-20T00:00:00.000Z", lastSubmission: "2024-09-25T00:00:00.000Z", currentDay: { block: 4, week: 2, day: 2 }, nextBlockDue: null, daysComplete: 46, daysAvailable: 48 },
  ];

  // Insert Programs
  sql += "-- Insert Programs\n";
  sql += "INSERT INTO programs (id, program_id, athlete_id, athlete_name, start_date, end_date, routine_types, block_duration, status, season, sub_season, last_modification, last_submission, current_day, next_block_due, days_complete, days_available) VALUES\n";
  const programValues = programs.map(p => {
    return `('${p.id}', '${p.programId}', '${p.athleteId}', ${escapeString(p.athleteName)}, '${p.startDate}', '${p.endDate}', ${escapeJson(p.routineTypes)}, ${p.blockDuration}, ${p.status ? escapeString(p.status) : 'NULL'}, ${p.season ? escapeString(p.season) : 'NULL'}, ${p.subSeason ? escapeString(p.subSeason) : 'NULL'}, ${p.lastModification ? `'${p.lastModification}'` : 'NULL'}, ${p.lastSubmission ? `'${p.lastSubmission}'` : 'NULL'}, ${escapeJson(p.currentDay)}, ${p.nextBlockDue ? `'${p.nextBlockDue}'` : 'NULL'}, ${p.daysComplete ?? 'NULL'}, ${p.daysAvailable ?? 'NULL'})`;
  });
  sql += programValues.join(',\n') + "\n";
  sql += "ON CONFLICT (id) DO NOTHING;\n\n";

  sql += "-- Verify the data was inserted\n";
  sql += "SELECT 'Athletes inserted: ' || COUNT(*) FROM athletes;\n";
  sql += "SELECT 'Phases inserted: ' || COUNT(*) FROM phases;\n";
  sql += "SELECT 'Blocks inserted: ' || COUNT(*) FROM blocks;\n";
  sql += "SELECT 'Programs inserted: ' || COUNT(*) FROM programs;\n";

  // Write to file
  const fs = await import('fs');
  const path = await import('path');
  const outputPath = path.resolve(process.cwd(), 'db', 'generated_inserts.sql');
  fs.writeFileSync(outputPath, sql, 'utf-8');
  
  console.log(`✅ SQL file generated successfully!`);
  console.log(`📁 Location: ${outputPath}`);
  console.log(`\n📋 Next steps:`);
  console.log(`1. Open Neon SQL Editor`);
  console.log(`2. Copy contents of: db/generated_inserts.sql`);
  console.log(`3. Paste and run in SQL Editor`);
}

generateSQL().catch(console.error);

