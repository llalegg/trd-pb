-- ============================================
-- Migration: Remove Redshirt Season
-- Generated: 2025-11-27
-- ============================================
-- This migration replaces all "Redshirt" season values with randomly assigned
-- seasons: Pre-Season, In-Season, or Off-Season

-- Update blocks table
UPDATE blocks 
SET season = CASE 
  WHEN random() < 0.33 THEN 'Pre-Season'
  WHEN random() < 0.66 THEN 'In-Season'
  ELSE 'Off-Season'
END
WHERE season = 'Redshirt';

-- Update programs table if it has Redshirt values
UPDATE programs 
SET season = CASE 
  WHEN random() < 0.33 THEN 'Pre-Season'
  WHEN random() < 0.66 THEN 'In-Season'
  ELSE 'Off-Season'
END
WHERE season = 'Redshirt';

