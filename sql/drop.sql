-- Drop userGroups table first since it's referenced by children and users
DROP TABLE IF EXISTS public.userGroups CASCADE;

DROP TABLE IF EXISTS public.groupMemberships CASCADE;

-- Drop children and users tables next since they reference other tables
DROP TABLE IF EXISTS public.child CASCADE;
DROP TABLE IF EXISTS public.user CASCADE;

-- Drop incident table
DROP TABLE IF EXISTS public.incident CASCADE;

DROP TABLE IF EXISTS UserTypeReference CASCADE;

DROP TABLE IF EXISTS public.incidentfeedbackreference CASCADE;
DROP TYPE IF EXISTS public.userType CASCADE;

DROP INDEX IF EXISTS unique_child_user_pair;
