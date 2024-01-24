INSERT INTO accounts VALUES
-- admins
('admin','admin',0, 'all powerful', '2106962802'),
('test_admin', 'zoowee', 0, 'zowee admin', '2106962803'),
-- citizens
('npc', 'npc', 1, 'npc npc', '2106962805'),
('agent', 'redblue', 1, 'Agent Smith', '2103962805'),
('clark', 'krypton', 1, 'Clark Kent', '2103922805'),
('jack', 'jack', 1, 'jack jack', '2103925805'),
('ryan', 'drive', 1, 'ryan gosling', '2101922805'),
-- rescuers
('res', 'res', 2, 'res res', '2106962860'),
('mister_helper', 'forfree', 2, 'helper forfree', '2106962820'),
('12monkeys', '12monkeys', 2, 'Jeffrey Goines', '2106932824');


INSERT INTO account_coordinates VALUES
-- citizens
('npc', POINT(38.383920314455395, 21.699021012674233)),
('agent', POINT(38.346503013243364, 21.728209458971552)),
('clark', POINT(38.38876430564981, 21.74606592023577)),
('jack', POINT(38.36588705167384, 21.72202837622623)),
('ryan', POINT(38.3494647994142, 21.687002240669443)),
-- rescuers
('res', POINT(38.35888785866677, 21.697823733050146)),
('mister_helper', POINT(38.36494489203489, 21.7328498686069)),
('12monkeys', POINT(38.36487759444852, 21.710786784092022));

-- requests
INSERT INTO requests (username, item_id, num_people, status, date_requested)
VALUES
('ryan', 25, 3, 0, '2023-01-01 12:00:00'),
('ryan', 32, 2, 0, '2023-01-02 14:30:00'),
('clark', 26, 1, 0, '2023-01-05 08:15:00'),
('agent', 42, 4, 0, '2023-01-08 11:30:00');

-- offers
INSERT INTO offers (username, item_id, date_offered, status)
VALUES
('npc', 25, '2023-01-01 12:00:00', 0),
('npc', 32, '2023-01-02 14:30:00', 0),
('jack', 42, '2023-01-04 08:15:00', 0);

