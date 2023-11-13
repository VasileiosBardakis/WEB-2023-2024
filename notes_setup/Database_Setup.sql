ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
flush privileges;

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


CREATE TABLE items (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    category INT
);

CREATE TABLE details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT,
    detail_name VARCHAR(255),
    detail_value VARCHAR(255),
    FOREIGN KEY (item_id) REFERENCES items(id)
);

CREATE TABLE categories (
    id INT PRIMARY KEY,
    category_name VARCHAR(255)
);


SELECT * from items;
select * from details;
select * from categories;
select * from accounts;


