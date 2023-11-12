DROP DATABASE IF EXISTS saviors;
CREATE DATABASE saviors;
USE saviors;

CREATE TABLE admin (
username VARCHAR(30) NOT NULL,
password VARCHAR(30) NOT NULL);


INSERT INTO admin VALUES
('admin','admin')