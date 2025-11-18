-- ============================================
-- COMPLETE DATA INSERTION SCRIPT FOR NEON DB
-- Run this entire script in Neon SQL Editor
-- ============================================

-- Insert Athletes (12 athletes)
INSERT INTO athletes (id, name, photo, status, current_phase_id) VALUES
('athlete-1', 'Marcus Johnson', NULL, NULL, 'phase-athlete-1'),
('athlete-2', 'Samuel Chen', NULL, NULL, 'phase-athlete-2'),
('athlete-3', 'James Rodriguez', NULL, NULL, 'phase-athlete-3'),
('athlete-4', 'Casey Davis', NULL, NULL, 'phase-athlete-4'),
('athlete-5', 'Alex Thompson', NULL, NULL, 'phase-athlete-5'),
('athlete-6', 'Michael Lee', NULL, NULL, 'phase-athlete-6'),
('athlete-7', 'David Kim', NULL, 'injured', 'phase-athlete-7'),
('athlete-8', 'Jordan Williams', NULL, 'rehabbing', 'phase-athlete-8'),
('athlete-9', 'Ethan Martinez', NULL, NULL, 'phase-athlete-9'),
('athlete-10', 'Tyler Brown', NULL, NULL, 'phase-athlete-10'),
('athlete-11', 'Robert Martinez', NULL, NULL, 'phase-athlete-11'),
('athlete-12', 'Christopher Wilson', NULL, NULL, 'phase-athlete-12')
ON CONFLICT (id) DO NOTHING;

-- Insert Phases (12 phases)
INSERT INTO phases (id, athlete_id, phase_number, start_date, end_date, status) VALUES
('phase-athlete-1', 'athlete-1', 1, '2025-09-19', '2025-12-18', 'active'),
('phase-athlete-2', 'athlete-2', 1, '2025-08-20', '2025-12-18', 'active'),
('phase-athlete-3', 'athlete-3', 1, '2025-07-21', '2025-12-18', 'active'),
('phase-athlete-4', 'athlete-4', 1, '2025-08-20', '2025-12-18', 'active'),
('phase-athlete-5', 'athlete-5', 1, '2025-08-30', '2025-12-08', 'active'),
('phase-athlete-6', 'athlete-6', 1, '2025-09-29', '2025-12-08', 'active'),
('phase-athlete-7', 'athlete-7', 1, '2025-10-09', '2025-12-18', 'active'),
('phase-athlete-8', 'athlete-8', 1, '2025-10-14', '2025-12-18', 'active'),
('phase-athlete-9', 'athlete-9', 1, '2025-10-19', '2025-12-18', 'active'),
('phase-athlete-10', 'athlete-10', 1, '2025-05-02', '2025-12-18', 'active'),
('phase-athlete-11', 'athlete-11', 1, '2025-05-22', '2025-10-19', 'complete'),
('phase-athlete-12', 'athlete-12', 1, '2025-06-21', '2025-10-29', 'complete')
ON CONFLICT (id) DO NOTHING;

-- Insert Blocks for Athlete 1 (Marcus Johnson)
INSERT INTO blocks (id, athlete_id, phase_id, block_number, name, start_date, end_date, duration, season, sub_season, status, current_day, throwing, movement, lifting, conditioning, last_modification, created_at, updated_at) VALUES
('block-1-1', 'athlete-1', 'phase-athlete-1', 1, 'Pre-Season Block 1', '2025-09-19', '2025-10-17', 4, 'Pre-Season', 'Early', 'complete', '{"week":4,"day":7}', '{"xRole":"Starter","phase":"Pre-Season","exclusions":"None"}', '{"intensity":"Moderate","volume":"High"}', '{"split":"4x2","emphasis":"Strength","variability":"Low","scheme":"Linear"}', '{"coreEmphasis":"Stability","adaptation":"Aerobic","method":"Continuous"}', '2025-10-16 00:00:00', '2025-09-14 00:00:00', '2025-10-17 00:00:00'),
('block-1-2', 'athlete-1', 'phase-athlete-1', 2, 'Pre-Season Block 2', '2025-10-17', '2025-11-20', 5, 'Pre-Season', 'Mid', 'active', '{"week":4,"day":5}', '{"xRole":"Starter","phase":"Pre-Season"}', '{"intensity":"High","volume":"Moderate"}', '{"split":"3x2","emphasis":"Power","variability":"Medium","scheme":"Undulating"}', '{"coreEmphasis":"Power","adaptation":"Anaerobic","method":"Interval"}', '2025-11-16 00:00:00', '2025-10-14 00:00:00', '2025-11-17 00:00:00')
ON CONFLICT (id) DO NOTHING;

-- Insert Blocks for Athlete 2 (Samuel Chen)
INSERT INTO blocks (id, athlete_id, phase_id, block_number, name, start_date, end_date, duration, season, sub_season, status, current_day, throwing, movement, lifting, conditioning, last_modification, created_at, updated_at) VALUES
('block-2-1', 'athlete-2', 'phase-athlete-2', 1, 'Pre-Season Block 1', '2025-08-20', '2025-09-17', 4, 'Pre-Season', 'Early', 'complete', '{"week":4,"day":7}', NULL, NULL, '{"split":"4x2","emphasis":"Hypertrophy","variability":"Low","scheme":"Linear"}', NULL, '2025-09-16 00:00:00', '2025-08-15 00:00:00', '2025-09-17 00:00:00'),
('block-2-2', 'athlete-2', 'phase-athlete-2', 2, 'In-Season Block 1', '2025-09-17', '2025-10-15', 4, 'In-Season', 'Early', 'complete', '{"week":4,"day":7}', '{"xRole":"Reliever","phase":"In-Season"}', '{"intensity":"Moderate","volume":"Moderate"}', '{"split":"3x2","emphasis":"Maintenance","variability":"Medium","scheme":"Undulating"}', NULL, '2025-10-14 00:00:00', '2025-09-14 00:00:00', '2025-10-15 00:00:00'),
('block-2-3', 'athlete-2', 'phase-athlete-2', 3, 'In-Season Block 2', '2025-10-15', '2025-11-20', 5, 'In-Season', 'Mid', 'active', '{"week":4,"day":3}', '{"xRole":"Reliever","phase":"In-Season"}', '{"intensity":"Moderate","volume":"Low"}', '{"split":"2x2","emphasis":"Restorative","variability":"High","scheme":"Undulating"}', '{"coreEmphasis":"Endurance","adaptation":"Aerobic","method":"Continuous"}', '2025-11-16 00:00:00', '2025-10-12 00:00:00', '2025-11-17 00:00:00')
ON CONFLICT (id) DO NOTHING;

-- Insert Blocks for Athlete 3 (James Rodriguez)
INSERT INTO blocks (id, athlete_id, phase_id, block_number, name, start_date, end_date, duration, season, sub_season, status, current_day, throwing, movement, lifting, conditioning, last_modification, created_at, updated_at) VALUES
('block-3-1', 'athlete-3', 'phase-athlete-3', 1, 'Pre-Season Block 1', '2025-07-21', '2025-08-18', 4, 'Pre-Season', 'Early', 'complete', '{"week":4,"day":7}', '{"xRole":"Starter","phase":"Pre-Season"}', '{"intensity":"Low","volume":"High"}', '{"split":"4x2","emphasis":"Hypertrophy","variability":"Low","scheme":"Linear"}', '{"coreEmphasis":"Stability","adaptation":"Aerobic","method":"Continuous"}', '2025-08-17 00:00:00', '2025-07-16 00:00:00', '2025-08-18 00:00:00'),
('block-3-2', 'athlete-3', 'phase-athlete-3', 2, 'Pre-Season Block 2', '2025-08-18', '2025-09-15', 4, 'Pre-Season', 'Mid', 'complete', '{"week":4,"day":7}', '{"xRole":"Starter","phase":"Pre-Season"}', '{"intensity":"Moderate","volume":"High"}', '{"split":"4x2","emphasis":"Strength","variability":"Low","scheme":"Linear"}', NULL, '2025-09-14 00:00:00', '2025-08-15 00:00:00', '2025-09-15 00:00:00'),
('block-3-3', 'athlete-3', 'phase-athlete-3', 3, 'In-Season Block 1', '2025-09-15', '2025-10-13', 4, 'In-Season', 'Early', 'complete', '{"week":4,"day":7}', '{"xRole":"Starter","phase":"In-Season"}', '{"intensity":"Moderate","volume":"Moderate"}', '{"split":"3x2","emphasis":"Power","variability":"Medium","scheme":"Undulating"}', '{"coreEmphasis":"Power","adaptation":"Anaerobic","method":"Interval"}', '2025-10-12 00:00:00', '2025-09-12 00:00:00', '2025-10-13 00:00:00'),
('block-3-4', 'athlete-3', 'phase-athlete-3', 4, 'In-Season Block 2', '2025-10-13', '2025-11-20', 5, 'In-Season', 'Mid', 'draft', '{"week":3,"day":2}', '{"xRole":"Starter","phase":"In-Season"}', '{"intensity":"Moderate","volume":"Low"}', '{"split":"2x2","emphasis":"Maintenance","variability":"High","scheme":"Undulating"}', NULL, '2025-11-17 00:00:00', '2025-10-10 00:00:00', '2025-11-17 00:00:00')
ON CONFLICT (id) DO NOTHING;

-- Insert Blocks for Athlete 4 (Casey Davis)
INSERT INTO blocks (id, athlete_id, phase_id, block_number, name, start_date, end_date, duration, season, sub_season, status, current_day, throwing, movement, lifting, last_modification, created_at, updated_at) VALUES
('block-4-1', 'athlete-4', 'phase-athlete-4', 1, 'Pre-Season Block 1', '2025-08-20', '2025-09-17', 4, 'Pre-Season', 'Early', 'complete', '{"week":4,"day":7}', '{"xRole":"Starter","phase":"Pre-Season"}', '{"intensity":"Low","volume":"High"}', '{"split":"4x2","emphasis":"Hypertrophy","variability":"Low","scheme":"Linear"}', '2025-09-16 00:00:00', '2025-08-15 00:00:00', '2025-09-17 00:00:00'),
('block-4-2', 'athlete-4', 'phase-athlete-4', 2, 'Pre-Season Block 2', '2025-09-17', '2025-10-15', 4, 'Pre-Season', 'Mid', 'active', '{"week":3,"day":2}', '{"xRole":"Starter","phase":"Pre-Season"}', '{"intensity":"Moderate","volume":"High"}', '{"split":"4x2","emphasis":"Strength","variability":"Low","scheme":"Linear"}', '2025-10-29 00:00:00', '2025-09-14 00:00:00', '2025-11-17 00:00:00'),
('block-4-3', 'athlete-4', 'phase-athlete-4', 3, 'Pre-Season Block 3', '2025-11-26', '2025-12-24', 4, 'Pre-Season', 'Late', 'draft', '{"week":1,"day":1}', '{"xRole":"Starter","phase":"Pre-Season"}', '{"intensity":"High","volume":"Moderate"}', '{"split":"3x2","emphasis":"Power","variability":"Medium","scheme":"Undulating"}', '2025-11-17 00:00:00', '2025-11-13 00:00:00', '2025-11-17 00:00:00')
ON CONFLICT (id) DO NOTHING;

-- Insert Blocks for Athlete 5 (Alex Thompson)
INSERT INTO blocks (id, athlete_id, phase_id, block_number, name, start_date, end_date, duration, season, sub_season, status, current_day, throwing, movement, lifting, last_modification, created_at, updated_at) VALUES
('block-5-1', 'athlete-5', 'phase-athlete-5', 1, 'In-Season Block 1', '2025-08-30', '2025-09-27', 4, 'In-Season', 'Late', 'complete', '{"week":4,"day":7}', '{"xRole":"Reliever","phase":"In-Season"}', '{"intensity":"Moderate","volume":"Moderate"}', '{"split":"3x2","emphasis":"Maintenance","variability":"Medium","scheme":"Undulating"}', '2025-09-26 00:00:00', '2025-08-25 00:00:00', '2025-09-27 00:00:00'),
('block-5-2', 'athlete-5', 'phase-athlete-5', 2, 'Off-Season Block 2', '2025-09-27', '2025-11-18', 5, 'Off-Season', 'Mid', 'active', '{"week":4,"day":3}', NULL, '{"intensity":"Low","volume":"Moderate"}', '{"split":"3x2","emphasis":"Recovery","variability":"High","scheme":"Undulating"}', '2025-11-13 00:00:00', '2025-09-24 00:00:00', '2025-11-13 00:00:00')
ON CONFLICT (id) DO NOTHING;

-- Insert Blocks for Athlete 6 (Michael Lee)
INSERT INTO blocks (id, athlete_id, phase_id, block_number, name, start_date, end_date, duration, season, sub_season, status, current_day, throwing, movement, lifting, last_modification, created_at, updated_at) VALUES
('block-6-1', 'athlete-6', 'phase-athlete-6', 1, 'In-Season Block 1', '2025-09-29', '2025-11-18', 4, 'In-Season', 'Mid', 'active', '{"week":3,"day":4}', '{"xRole":"Starter","phase":"In-Season"}', '{"intensity":"Moderate","volume":"Moderate"}', '{"split":"3x2","emphasis":"Power","variability":"Medium","scheme":"Undulating"}', '2025-11-17 00:00:00', '2025-09-24 00:00:00', '2025-11-17 00:00:00')
ON CONFLICT (id) DO NOTHING;

-- Insert Blocks for Athlete 7 (David Kim)
INSERT INTO blocks (id, athlete_id, phase_id, block_number, name, start_date, end_date, duration, season, sub_season, status, current_day, throwing, movement, lifting, last_modification, created_at, updated_at) VALUES
('block-7-1', 'athlete-7', 'phase-athlete-7', 1, 'In-Season Block 1', '2025-10-09', '2025-11-23', 4, 'In-Season', 'Mid', 'active', '{"week":2,"day":3}', '{"xRole":"Reliever","phase":"In-Season"}', '{"intensity":"Low","volume":"Low"}', '{"split":"2x2","emphasis":"Recovery","variability":"High","scheme":"Undulating"}', '2025-11-16 00:00:00', '2025-10-04 00:00:00', '2025-11-16 00:00:00')
ON CONFLICT (id) DO NOTHING;

-- Insert Blocks for Athlete 8 (Jordan Williams)
INSERT INTO blocks (id, athlete_id, phase_id, block_number, name, start_date, end_date, duration, season, sub_season, status, current_day, movement, lifting, conditioning, last_modification, created_at, updated_at) VALUES
('block-8-1', 'athlete-8', 'phase-athlete-8', 1, 'Off-Season Block 1', '2025-10-14', '2025-12-02', 4, 'Off-Season', 'Early', 'active', '{"week":2,"day":5}', '{"intensity":"Low","volume":"Moderate"}', '{"split":"3x2","emphasis":"Recovery","variability":"High","scheme":"Undulating"}', '{"coreEmphasis":"Endurance","adaptation":"Aerobic","method":"Continuous"}', '2025-11-15 00:00:00', '2025-10-09 00:00:00', '2025-11-15 00:00:00')
ON CONFLICT (id) DO NOTHING;

-- Insert Blocks for Athlete 9 (Ethan Martinez)
INSERT INTO blocks (id, athlete_id, phase_id, block_number, name, start_date, end_date, duration, season, sub_season, status, current_day, movement, lifting, last_modification, created_at, updated_at) VALUES
('block-9-1', 'athlete-9', 'phase-athlete-9', 1, 'Off-Season Block 1', '2025-10-19', '2025-12-08', 4, 'Off-Season', 'Early', 'active', '{"week":2,"day":1}', '{"intensity":"Low","volume":"Moderate"}', '{"split":"3x2","emphasis":"Hypertrophy","variability":"Medium","scheme":"Linear"}', '2025-11-14 00:00:00', '2025-10-14 00:00:00', '2025-11-14 00:00:00')
ON CONFLICT (id) DO NOTHING;

-- Insert Blocks for Athlete 10 (Tyler Brown)
INSERT INTO blocks (id, athlete_id, phase_id, block_number, name, start_date, end_date, duration, season, sub_season, status, current_day, throwing, movement, lifting, last_modification, created_at, updated_at) VALUES
('block-10-1', 'athlete-10', 'phase-athlete-10', 1, 'Pre-Season Block 1', '2025-05-02', '2025-05-30', 4, 'Pre-Season', 'Early', 'complete', '{"week":4,"day":7}', '{"xRole":"Starter","phase":"Pre-Season"}', '{"intensity":"Low","volume":"High"}', '{"split":"4x2","emphasis":"Hypertrophy","variability":"Low","scheme":"Linear"}', '2025-05-29 00:00:00', '2025-04-27 00:00:00', '2025-05-30 00:00:00'),
('block-10-2', 'athlete-10', 'phase-athlete-10', 2, 'Pre-Season Block 2', '2025-05-30', '2025-06-27', 4, 'Pre-Season', 'Mid', 'complete', '{"week":4,"day":7}', '{"xRole":"Starter","phase":"Pre-Season"}', '{"intensity":"Moderate","volume":"High"}', '{"split":"4x2","emphasis":"Strength","variability":"Low","scheme":"Linear"}', '2025-06-26 00:00:00', '2025-05-27 00:00:00', '2025-06-27 00:00:00'),
('block-10-3', 'athlete-10', 'phase-athlete-10', 3, 'Pre-Season Block 3', '2025-06-27', '2025-12-10', 5, 'Pre-Season', 'Late', 'active', '{"week":3,"day":2}', '{"xRole":"Starter","phase":"Pre-Season"}', '{"intensity":"High","volume":"Moderate"}', '{"split":"3x2","emphasis":"Power","variability":"Medium","scheme":"Undulating"}', '2025-11-17 00:00:00', '2025-06-24 00:00:00', '2025-11-17 00:00:00'),
('block-10-4', 'athlete-10', 'phase-athlete-10', 4, 'In-Season Block 4', '2025-12-10', '2026-01-07', 4, 'In-Season', 'Early', 'draft', '{"week":1,"day":1}', '{"xRole":"Starter","phase":"In-Season"}', '{"intensity":"Moderate","volume":"Moderate"}', '{"split":"3x2","emphasis":"Power","variability":"Medium","scheme":"Undulating"}', '2025-11-13 00:00:00', '2025-11-08 00:00:00', '2025-11-13 00:00:00')
ON CONFLICT (id) DO NOTHING;

-- Insert Blocks for Athlete 11 (Robert Martinez) - Past athlete
INSERT INTO blocks (id, athlete_id, phase_id, block_number, name, start_date, end_date, duration, season, sub_season, status, current_day, throwing, movement, lifting, conditioning, last_modification, created_at, updated_at) VALUES
('block-11-1', 'athlete-11', 'phase-athlete-11', 1, 'Pre-Season Block 1', '2025-05-22', '2025-06-19', 4, 'Pre-Season', 'Early', 'complete', '{"week":4,"day":7}', '{"xRole":"Starter","phase":"Pre-Season"}', '{"intensity":"Low","volume":"High"}', '{"split":"4x2","emphasis":"Hypertrophy","variability":"Low","scheme":"Linear"}', '{"coreEmphasis":"Stability","adaptation":"Aerobic","method":"Continuous"}', '2025-06-18 00:00:00', '2025-05-17 00:00:00', '2025-06-19 00:00:00'),
('block-11-2', 'athlete-11', 'phase-athlete-11', 2, 'Pre-Season Block 2', '2025-06-19', '2025-07-17', 4, 'Pre-Season', 'Mid', 'complete', '{"week":4,"day":7}', '{"xRole":"Starter","phase":"Pre-Season"}', '{"intensity":"Moderate","volume":"High"}', '{"split":"4x2","emphasis":"Strength","variability":"Low","scheme":"Linear"}', NULL, '2025-07-16 00:00:00', '2025-06-16 00:00:00', '2025-07-17 00:00:00'),
('block-11-3', 'athlete-11', 'phase-athlete-11', 3, 'In-Season Block 1', '2025-07-17', '2025-08-14', 4, 'In-Season', 'Early', 'complete', '{"week":4,"day":7}', '{"xRole":"Starter","phase":"In-Season"}', '{"intensity":"Moderate","volume":"Moderate"}', '{"split":"3x2","emphasis":"Power","variability":"Medium","scheme":"Undulating"}', NULL, '2025-08-13 00:00:00', '2025-07-14 00:00:00', '2025-08-14 00:00:00')
ON CONFLICT (id) DO NOTHING;

-- Insert Blocks for Athlete 12 (Christopher Wilson) - Past athlete
INSERT INTO blocks (id, athlete_id, phase_id, block_number, name, start_date, end_date, duration, season, sub_season, status, current_day, movement, lifting, conditioning, last_modification, created_at, updated_at) VALUES
('block-12-1', 'athlete-12', 'phase-athlete-12', 1, 'Off-Season Block 1', '2025-06-21', '2025-07-19', 4, 'Off-Season', 'Early', 'complete', '{"week":4,"day":7}', '{"intensity":"Low","volume":"Moderate"}', '{"split":"3x2","emphasis":"Recovery","variability":"High","scheme":"Undulating"}', '{"coreEmphasis":"Endurance","adaptation":"Aerobic","method":"Continuous"}', '2025-07-18 00:00:00', '2025-06-16 00:00:00', '2025-07-19 00:00:00'),
('block-12-2', 'athlete-12', 'phase-athlete-12', 2, 'Off-Season Block 2', '2025-07-19', '2025-08-16', 4, 'Off-Season', 'Mid', 'complete', '{"week":4,"day":7}', '{"intensity":"Moderate","volume":"Moderate"}', '{"split":"3x2","emphasis":"Hypertrophy","variability":"Medium","scheme":"Linear"}', NULL, '2025-08-15 00:00:00', '2025-07-16 00:00:00', '2025-08-16 00:00:00')
ON CONFLICT (id) DO NOTHING;

-- Insert Programs (15 programs)
-- Note: Dates are calculated relative to today (2025-11-18)
INSERT INTO programs (id, program_id, athlete_id, athlete_name, start_date, end_date, routine_types, block_duration, status, season, sub_season, last_modification, last_submission, current_day, next_block_due, days_complete, days_available) VALUES
('1', 'P123456', '1', 'Marcus Johnson', '2025-10-19', '2026-01-18', '["movement","throwing"]', 8, 'injured', 'Pre-Season', 'Early', '2025-11-15 00:00:00', '2025-11-17 00:00:00', '{"block":1,"week":2,"day":3}', '2025-11-23 00:00:00', 12, 32),
('2', 'P789012', '2', 'Michael Chen', '2025-09-19', '2026-02-18', '["lifting","nutrition"]', 12, NULL, 'In-Season', 'Mid', '2025-11-11 00:00:00', '2025-11-16 00:00:00', '{"block":2,"week":1,"day":2}', '2025-11-30 00:00:00', 24, 48),
('3', 'P345678', '3', 'Alexander Rodriguez', '2025-10-19', '2026-03-18', '["movement","throwing","lifting","nutrition"]', 8, 'rehabbing', 'Off-Season', 'Late', '2025-11-17 00:00:00', '2025-11-18 00:00:00', '{"block":1,"week":3,"day":1}', '2025-11-26 00:00:00', 18, 32),
('4', 'P901234', '4', 'James Williams', '2025-09-19', '2026-04-18', '["throwing","lifting"]', 12, 'lingering-issues', 'Pre-Season', NULL, '2025-11-13 00:00:00', '2025-11-15 00:00:00', '{"block":2,"week":2,"day":4}', '2025-12-03 00:00:00', 30, 48),
('5', 'P456789', '5', 'Ryan Martinez', '2025-08-19', '2026-05-18', '["movement","lifting"]', 10, NULL, 'In-Season', 'Early', '2025-11-14 00:00:00', '2025-11-16 00:00:00', '{"block":3,"week":1,"day":1}', '2025-12-08 00:00:00', 28, 40),
('6', 'P567890', '6', 'Ethan Thompson', '2025-10-19', '2025-12-18', '["throwing","movement","nutrition"]', 8, NULL, 'Pre-Season', 'Mid', '2025-11-16 00:00:00', '2025-11-17 00:00:00', '{"block":1,"week":4,"day":2}', '2025-11-21 00:00:00', 20, 32),
('9', 'P234567', '9', 'Noah Anderson', '2025-09-19', '2026-02-18', '["lifting","movement"]', 12, 'injured', 'Off-Season', 'Mid', '2025-11-12 00:00:00', '2025-11-14 00:00:00', '{"block":2,"week":3,"day":1}', '2025-11-28 00:00:00', 22, 48),
('10', 'P345123', '10', 'Lucas Garcia', '2025-10-19', '2026-03-18', '["throwing","nutrition"]', 8, NULL, 'In-Season', 'Late', '2025-11-17 00:00:00', '2025-11-18 00:00:00', '{"block":1,"week":1,"day":4}', '2025-11-24 00:00:00', 8, 32),
('11', 'P456234', '11', 'Mason Taylor', '2025-09-19', '2026-04-18', '["movement","throwing","lifting"]', 10, 'rehabbing', 'Pre-Season', 'Early', '2025-11-10 00:00:00', '2025-11-13 00:00:00', '{"block":2,"week":2,"day":3}', '2025-12-06 00:00:00', 26, 40),
('12', 'P567345', '12', 'Aiden Wilson', '2025-08-19', '2026-05-18', '["lifting","nutrition"]', 12, NULL, 'Off-Season', 'Early', '2025-11-09 00:00:00', '2025-11-12 00:00:00', '{"block":3,"week":2,"day":2}', '2025-12-13 00:00:00', 32, 48),
('7', 'P111111', '7', 'David Lee', '2024-11-01', '2024-12-31', '["lifting"]', 8, NULL, 'Off-Season', 'Early', '2024-12-15 00:00:00', '2024-12-20 00:00:00', '{"block":4,"week":2,"day":3}', NULL, 32, 32),
('8', 'P222222', '8', 'Thomas Brown', '2024-10-15', '2024-12-15', '["movement","throwing"]', 8, NULL, 'In-Season', 'Late', '2024-12-10 00:00:00', '2024-12-12 00:00:00', '{"block":3,"week":4,"day":2}', NULL, 28, 32),
('13', 'P333333', '13', 'Christopher Davis', '2024-09-01', '2024-11-30', '["throwing","lifting","movement"]', 12, 'lingering-issues', 'Pre-Season', 'Mid', '2024-11-25 00:00:00', '2024-11-28 00:00:00', '{"block":4,"week":3,"day":1}', NULL, 45, 48),
('14', 'P444444', '14', 'Daniel Moore', '2024-08-15', '2024-10-15', '["movement","nutrition"]', 8, NULL, 'Off-Season', 'Late', '2024-10-10 00:00:00', '2024-10-12 00:00:00', '{"block":3,"week":4,"day":4}', NULL, 30, 32),
('15', 'P555555', '15', 'Matthew Jackson', '2024-07-01', '2024-09-30', '["lifting","throwing"]', 12, NULL, 'In-Season', 'Early', '2024-09-20 00:00:00', '2024-09-25 00:00:00', '{"block":4,"week":2,"day":2}', NULL, 46, 48)
ON CONFLICT (id) DO NOTHING;

-- Verify the data was inserted
SELECT 'Athletes inserted: ' || COUNT(*) FROM athletes;
SELECT 'Phases inserted: ' || COUNT(*) FROM phases;
SELECT 'Blocks inserted: ' || COUNT(*) FROM blocks;
SELECT 'Programs inserted: ' || COUNT(*) FROM programs;

