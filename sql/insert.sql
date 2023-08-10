INSERT INTO users (name, username, password, admin) VALUES ('Óli admin', 'admin', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii', true);
INSERT INTO users (name, username, password) VALUES ('Forvitinn forritari', 'forritari', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');
INSERT INTO users (name, username, password) VALUES ('Jón Jónsson', 'jonjons', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');
INSERT INTO users (name, username, password) VALUES ('Guðrún Guðrúnar', 'gunnagunn', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');
INSERT INTO users (name, username, password) VALUES ('Ólafur Ragnar Grímsson', 'forseti', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');

INSERT INTO events (title, slug, description, creatorId) VALUES ('Forritarahittingur í febrúar', 'forritarahittingur-i-februar', 'Forritarar hittast í febrúar og forrita saman eitthvað frábært.', 1);
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
