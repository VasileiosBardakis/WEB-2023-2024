DROP DATABASE IF EXISTS saviors;
CREATE DATABASE saviors;
USE saviors;

CREATE TABLE accounts (
username VARCHAR(30) NOT NULL,
password VARCHAR(30) NOT NULL,
type TINYINT NOT NULL);

INSERT INTO accounts VALUES
('admin','admin',0);
INSERT INTO accounts VALUES
('test_admin', 'zoowee', 0);
INSERT INTO accounts VALUES
('npc', 'npc', 1);
