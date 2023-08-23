-- First, create the enums and userTypes table
-- CREATE TYPE userType AS ENUM (
--   'parent',
--   'caregiver',
--   'physical therapist',
--   'speech therapist',
--   'driver'
-- );

-- CREATE TYPE incidentFeedback AS ENUM (
--   'good',
--   'neutral',
--   'bad'
-- );

-- to select only the enums:
-- SELECT unnest(enum_range(NULL::incidentFeedback))::text;
-- til að setja inn nýtt:
-- ALTER TYPE incidentFeedback ADD VALUE 'neutral';

CREATE TABLE UserTypeReference (
  id SERIAL PRIMARY KEY,
  type_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE incidentFeedbackReference (
  id SERIAL PRIMARY KEY,
  feedback VARCHAR(50) UNIQUE NOT NULL
);

-- Next, create the users table which references userTypes
-- ef þarf að breyta userType, þá er það gert í UserTypeReference töflu
CREATE TABLE public.user (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  username VARCHAR(64) UNIQUE NOT NULL,
  password VARCHAR(256) NOT NULL,
  admin BOOLEAN DEFAULT false,
  user_type_id INTEGER REFERENCES UserTypeReference(id),
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp
);

-- Then, create the incident table which references child and users
-- til að selecta id, title, description og feedback með texta:
-- SELECT
--     i.id,
--     i.title,
--     i.description,
--     ifr.feedback
-- FROM
--     Incident i
-- JOIN
--     IncidentFeedbackReference ifr ON i.feedback_id = ifr.id;
CREATE TABLE public.incident (
  id SERIAL PRIMARY KEY,
  title VARCHAR(64) NOT NULL,
  slug VARCHAR(64) NOT NULL,
  description VARCHAR(1000) DEFAULT '',
  feedback_id INTEGER REFERENCES incidentFeedbackReference(id),
  child_id INTEGER,
  user_id INTEGER,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Next, create the child and userGroups tables
CREATE TABLE public.child (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  group_id INTEGER UNIQUE
);

CREATE TABLE public.userGroups (
  id SERIAL PRIMARY KEY,
  child_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL
);

CREATE UNIQUE INDEX unique_child_user_pair
    ON userGroups (child_id, user_id);


-- Finally, add foreign key constraints
ALTER TABLE public.incident
  ADD CONSTRAINT fk_incident_child FOREIGN KEY (child_id) REFERENCES public.child(id);

ALTER TABLE public.incident
  ADD CONSTRAINT fk_incident_user FOREIGN KEY (user_id) REFERENCES public.user(id);

ALTER TABLE public.child
  ADD CONSTRAINT fk_child_group FOREIGN KEY (group_id) REFERENCES public.userGroups(id);

ALTER TABLE public.userGroups
  ADD CONSTRAINT fk_group_child FOREIGN KEY (child_id) REFERENCES public.child(id);

ALTER TABLE public.userGroups
  ADD CONSTRAINT fk_group_user FOREIGN KEY (user_id) REFERENCES public.user(id);




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
