-- Insert user types
-- INSERT INTO public.userTypes (type) VALUES
-- ('parent'),
-- ('caregiver'),
-- ('physical therapist'),
-- ('speech therapist'),
-- ('driver');

INSERT INTO UserTypeReference (type_name) VALUES ('parent');
INSERT INTO UserTypeReference (type_name) VALUES ('caregiver');
INSERT INTO UserTypeReference (type_name) VALUES ('physical therapist');
INSERT INTO UserTypeReference (type_name) VALUES ('speech therapist');
INSERT INTO UserTypeReference (type_name) VALUES ('therapist');
INSERT INTO UserTypeReference (type_name) VALUES ('driver');

INSERT INTO incidentFeedbackReference (feedback) VALUES ('good');
INSERT INTO incidentFeedbackReference (feedback) VALUES ('neutral');
INSERT INTO incidentFeedbackReference (feedback) VALUES ('bad');


-- Insert users
INSERT INTO public.user (name, username, password, admin, user_type_id)
VALUES
('John Doe', 'john@example.com', 'password123', true, 1),
('Jane Smith', 'jane@example.com', 'letmein', false, 2),
('Alex Johnson', 'alex@example.com', 'securepass', false, 3),
('Emma Brown', 'emma@example.com', '123456', false, 4),
('Michael Davis', 'michael@example.com', 'password', false, 5);

-- Insert child
INSERT INTO public.child (name) VALUES
('Child A'),
('Child B'),
('Child C');

-- Insert user groups
INSERT INTO public.userGroup (child_id, user_id) VALUES
(1, 2),
(1, 3),
(2, 2);

-- -- update user_id to add users to a group
-- UPDATE public.userGroup
-- SET user_id = 2 -- user_id of the user to add to a group
-- WHERE child_id = 1; -- child_id of the child in the group

-- Update group_id in child table based on userGroup
-- þetta þarf að keyra eftir að insert á userGroup er keyrt
UPDATE public.child AS c
SET group_id = ug.id
FROM public.userGroup AS ug
WHERE c.id = ug.child_id;

-- Insert incidents
INSERT INTO public.incident (title, slug, description, feedback_id, child_id, user_id)
VALUES
('Incident 1', 'incident-1', 'Description of incident 1', 3, 1, 2),
('Incident 2', 'incident-2', 'Description of incident 2', 2, 1, 1),
('Incident 3', 'incident-3', 'Description of incident 3', 1, 2, 3),
('Incident 4', 'incident-4', 'Description of incident 4', 3, 3, 2);



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
