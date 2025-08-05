-- Remove the team_members table that's causing infinite recursion
DROP TABLE IF EXISTS public.team_members CASCADE;