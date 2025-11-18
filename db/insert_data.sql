-- Insert Athletes
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

-- Insert Phases
INSERT INTO phases (id, athlete_id, phase_number, start_date, end_date, status) VALUES
('phase-athlete-1', 'athlete-1', 1, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '30 days', 'active'),
('phase-athlete-2', 'athlete-2', 1, CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE + INTERVAL '30 days', 'active'),
('phase-athlete-3', 'athlete-3', 1, CURRENT_DATE - INTERVAL '120 days', CURRENT_DATE + INTERVAL '30 days', 'active'),
('phase-athlete-4', 'athlete-4', 1, CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE + INTERVAL '30 days', 'active'),
('phase-athlete-5', 'athlete-5', 1, CURRENT_DATE - INTERVAL '80 days', CURRENT_DATE + INTERVAL '20 days', 'active'),
('phase-athlete-6', 'athlete-6', 1, CURRENT_DATE - INTERVAL '50 days', CURRENT_DATE + INTERVAL '20 days', 'active'),
('phase-athlete-7', 'athlete-7', 1, CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE + INTERVAL '30 days', 'active'),
('phase-athlete-8', 'athlete-8', 1, CURRENT_DATE - INTERVAL '35 days', CURRENT_DATE + INTERVAL '30 days', 'active'),
('phase-athlete-9', 'athlete-9', 1, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '30 days', 'active'),
('phase-athlete-10', 'athlete-10', 1, CURRENT_DATE - INTERVAL '200 days', CURRENT_DATE + INTERVAL '30 days', 'active'),
('phase-athlete-11', 'athlete-11', 1, CURRENT_DATE - INTERVAL '180 days', CURRENT_DATE - INTERVAL '30 days', 'complete'),
('phase-athlete-12', 'athlete-12', 1, CURRENT_DATE - INTERVAL '150 days', CURRENT_DATE - INTERVAL '20 days', 'complete')
ON CONFLICT (id) DO NOTHING;

-- Note: Due to the complexity of blocks data with JSON fields, 
-- you'll need to insert blocks and programs using the populate script
-- or I can generate individual INSERT statements if needed.

-- The populate script should work once the database connection is established.
-- Check Neon Console to ensure the database is not paused.

