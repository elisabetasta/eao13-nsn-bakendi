-- Insert user types
INSERT INTO public.userTypes (type) VALUES
('parent'),
('caregiver'),
('physical therapist'),
('speech therapist'),
('driver');

-- Insert users
INSERT INTO public.users (name, username, password, admin, type)
VALUES
('John Doe', 'john@example.com', 'password123', true, 'parent'),
('Jane Smith', 'jane@example.com', 'letmein', false, 'caregiver'),
('Alex Johnson', 'alex@example.com', 'securepass', false, 'driver'),
('Emma Brown', 'emma@example.com', '123456', false, 'speech therapist'),
('Michael Davis', 'michael@example.com', 'password', false, 'physical therapist');

-- Insert children
INSERT INTO public.children (name) VALUES
('Child A'),
('Child B'),
('Child C');

-- Insert user groups
INSERT INTO public.userGroups (child_id, user_id) VALUES
(1, 2),
(1, 3),
(2, 2);

-- -- update user_id to add users to a group
-- UPDATE public.userGroups
-- SET user_id = 2 -- user_id of the user to add to a group
-- WHERE child_id = 1; -- child_id of the child in the group

-- Update group_id in children table based on userGroups
-- þetta þarf að keyra eftir að insert á userGroups er keyrt
UPDATE public.children AS c
SET group_id = ug.id
FROM public.userGroups AS ug
WHERE c.id = ug.child_id;

-- Insert incidents
INSERT INTO public.incident (title, slug, description, feedback, child_id, user_id)
VALUES
('Incident 1', 'incident-1', 'Description of incident 1', 'bad', 1, 2),
('Incident 2', 'incident-2', 'Description of incident 2', 'neutral', 1, 1),
('Incident 3', 'incident-3', 'Description of incident 3', 'good', 2, 3),
('Incident 4', 'incident-4', 'Description of incident 4', 'bad', 3, 2);



-- INSERT INTO users (name, username, password) VALUES ('Forvitinn forritari', 'forritari', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');
-- INSERT INTO users (name, username, password) VALUES ('Jón Jónsson', 'jonjons', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');
-- INSERT INTO users (name, username, password) VALUES ('Guðrún Guðrúnar', 'gunnagunn', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');
-- INSERT INTO users (name, username, password) VALUES ('Ólafur Ragnar Grímsson', 'forseti', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');

-- INSERT INTO events (title, slug, description, creatorId) VALUES ('Forritarahittingur í febrúar', 'forritarahittingur-i-februar', 'Forritarar hittast í febrúar og forrita saman eitthvað frábært.', 1);
-- INSERT INTO events (title, slug, description, creatorId) VALUES ('Hönnuðahittingur í mars', 'honnudahittingur-i-mars', 'Spennandi hittingur hönnuða í Hönnunarmars.', 1);
-- INSERT INTO events (title, slug, description, creatorId) VALUES ('Verkefnastjórahittingur í apríl', 'verkefnastjorahittingur-i-april', 'Virkilega vel verkefnastýrður hittingur.', 1);
-- INSERT INTO events (title, slug, description, creatorId) VALUES ('Kaffihittingur í Vesturbæ', 'kaffihittingur-i-vesturba', 'Hittingur verður haldinn í Kaffi Vest. Allir sem drekka kaffi eru velkomnir að mæta.', 1);
-- INSERT INTO events (title, slug, description, creatorId) VALUES ('Hjólatími', 'hjolatimi', 'Allir sem kunna að hjóla mæta og skemmta sér saman!', 1);
-- INSERT INTO events (title, slug, description, creatorId) VALUES ('Föndurstund', 'fondurstund', 'Föndrarar landsins athugið. Ykkar er vænst í þennan hitting.', 1);

-- INSERT INTO registrations (userId, eventid) VALUES (2, 1);
-- INSERT INTO registrations (userId, eventid) VALUES (3, 1);
-- INSERT INTO registrations (userId, eventid) VALUES (4, 1);
-- INSERT INTO registrations (userId, eventid) VALUES (5, 6);
-- INSERT INTO registrations (userId, eventid) VALUES (3, 6);
-- INSERT INTO registrations (userId, eventid) VALUES (4, 5);

-- INSERT INTO speaker (firstName, lastName, eventid) VALUES ('Fyrirlesari', 'Jónsson', 1);
