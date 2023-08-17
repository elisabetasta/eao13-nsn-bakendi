-- First, create the enums and userTypes table
CREATE TYPE userType AS ENUM (
  'parent',
  'caregiver',
  'physical therapist',
  'speech therapist',
  'driver'
);

CREATE TYPE incidentFeedback AS ENUM (
  'good',
  'neutral',
  'bad'
);

CREATE TABLE public.userTypes (
  id SERIAL PRIMARY KEY,
  type userType
);

-- Next, create the users table which references userTypes
CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  username VARCHAR(64) UNIQUE NOT NULL,
  password VARCHAR(256) NOT NULL,
  admin BOOLEAN DEFAULT false,
  type userType,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp
);

-- Then, create the incident table which references children and users
CREATE TABLE public.incident (
  id SERIAL PRIMARY KEY,
  title VARCHAR(64) NOT NULL UNIQUE,
  slug VARCHAR(64) NOT NULL UNIQUE,
  description VARCHAR(1000) DEFAULT '',
  feedback incidentFeedback,
  child_id INTEGER,
  user_id INTEGER,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Next, create the children and userGroups tables
CREATE TABLE public.children (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  group_id INTEGER UNIQUE
);

CREATE TABLE public.userGroups (
  id SERIAL PRIMARY KEY,
  child_id INTEGER,
  user_id INTEGER,

  CONSTRAINT unique_child_user_pair UNIQUE (child_id, user_id)
);


-- Finally, add foreign key constraints
ALTER TABLE public.incident
  ADD CONSTRAINT fk_incident_child FOREIGN KEY (child_id) REFERENCES public.children(id);

ALTER TABLE public.incident
  ADD CONSTRAINT fk_incident_user FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE public.children
  ADD CONSTRAINT fk_child_group FOREIGN KEY (group_id) REFERENCES public.userGroups(id);

ALTER TABLE public.userGroups
  ADD CONSTRAINT fk_group_child FOREIGN KEY (child_id) REFERENCES public.children(id);

ALTER TABLE public.userGroups
  ADD CONSTRAINT fk_group_user FOREIGN KEY (user_id) REFERENCES public.users(id);




--------------------------------------------------------------------------

-- CREATE TABLE public.events (
--   id SERIAL PRIMARY KEY,
--   title VARCHAR(64) UNIQUE NOT NULL,
--   slug VARCHAR(64) UNIQUE NOT NULL,
--   description TEXT,
--   created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   creatorId INTEGER NOT NULL,
--   CONSTRAINT fk_creatorId FOREIGN KEY (creatorId) REFERENCES users (id)
-- );

-- CREATE TABLE public.registrations (
--   id SERIAL PRIMARY KEY,
--   eventid INTEGER NOT NULL,
--   userId INTEGER NOT NULL,
--   created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   CONSTRAINT fk_event FOREIGN KEY (eventid) REFERENCES events (id),
--   CONSTRAINT fk_userId FOREIGN KEY (userId) REFERENCES users (id),
--   UNIQUE (eventid, userId)
-- );

-- CREATE TABLE public.speaker (
--   id SERIAL PRIMARY KEY,
--   firstName VARCHAR(64) NOT NULL,
--   middleName VARCHAR(64),
--   lastName VARCHAR(64) NOT NULL,
--   imageUrl  VARCHAR(128) DEFAULT NULL,
--   eventId INTEGER NOT NULL,
--   created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   CONSTRAINT fk_eventId FOREIGN KEY (eventId) REFERENCES events (id)
-- )
