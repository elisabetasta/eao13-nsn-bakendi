CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  username VARCHAR(64) UNIQUE NOT NULL,
  password VARCHAR(256) NOT NULL,
  admin BOOLEAN DEFAULT false,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp
);

CREATE TABLE public.events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(64) UNIQUE NOT NULL,
  slug VARCHAR(64) UNIQUE NOT NULL,
  description TEXT,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  creatorId INTEGER NOT NULL,
  CONSTRAINT fk_creatorId FOREIGN KEY (creatorId) REFERENCES users (id)
);

CREATE TABLE public.registrations (
  id SERIAL PRIMARY KEY,
  eventid INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_event FOREIGN KEY (eventid) REFERENCES events (id),
  CONSTRAINT fk_userId FOREIGN KEY (userId) REFERENCES users (id),
  UNIQUE (eventid, userId)
);

CREATE TABLE public.speaker (
  id SERIAL PRIMARY KEY,
  firstName VARCHAR(64) NOT NULL,
  middleName VARCHAR(64),
  lastName VARCHAR(64) NOT NULL,
  imageUrl  VARCHAR(128) DEFAULT NULL,
  eventId INTEGER NOT NULL,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_eventId FOREIGN KEY (eventId) REFERENCES events (id)
)
