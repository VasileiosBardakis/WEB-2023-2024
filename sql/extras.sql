-- TODO: prevent status 1 without res
INSERT INTO requests (username, item_id, num_people, status, date_requested, date_accepted, date_completed)
VALUES
('npc', 16, 3, 0, '2023-01-01 12:00:00', NULL, NULL),
('npc', 17, 2, 0, '2023-01-02 14:30:00', '2023-01-03 09:45:00', '2023-01-04 17:30:00'),
('npc', 18, 1, 0, '2023-01-05 08:15:00', '2023-01-06 10:30:00', '2023-01-07 12:45:00'),
('npc', 18, 4, 0, '2023-01-08 11:30:00', NULL, NULL),
('npc', 25, 2, 0, '2023-01-09 15:00:00', '2023-01-10 09:30:00', '2023-01-11 14:45:00');

INSERT INTO offers (username, date_offered, date_completed, status, rescuer, item_id)
VALUES
('npc', '2023-01-01 12:00:00', NULL, 0, 'res', 16),
('npc', '2023-01-02 14:30:00', '2023-01-03 09:45:00', 0, 'res', 18),
('npc', '2023-01-04 08:15:00', '2023-01-05 10:30:00', 2, 'res', 22),
('npc', '2023-01-06 11:30:00', NULL, 0, 'res', 22),
('npc', '2023-01-07 15:00:00', '2023-01-08 09:30:00', 2, 'res', 19);

DELETE FROM account_coordinates;
INSERT INTO account_coordinates (username, coordinate)
VALUES
('res', POINT(38.361527, 21.713058));
INSERT INTO account_coordinates (username, coordinate)
VALUES
('npc', POINT(38.364567, 21.713078));

INSERT INTO cargo (username, item_id, res_quantity)
VALUES
('res', 16, 5)
('res', 19, 5),
('res', 22, 5);