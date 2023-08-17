-- Drop userGroups table first since it's referenced by children and users
DROP TABLE IF EXISTS public.userGroups CASCADE;

DROP TABLE IF EXISTS public.groupMemberships CASCADE;

-- Drop children and users tables next since they reference other tables
DROP TABLE IF EXISTS public.children CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop incident table
DROP TABLE IF EXISTS public.incident CASCADE;

DROP TABLE IF EXISTS public.usertypes CASCADE;

-- Drop enums
DROP TYPE IF EXISTS public.incidentFeedback CASCADE;
DROP TYPE IF EXISTS public.userType CASCADE;
