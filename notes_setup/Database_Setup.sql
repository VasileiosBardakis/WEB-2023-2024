cargoDeliveredALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
flush privileges;

DROP DATABASE IF EXISTS saviors;
CREATE DATABASE saviors;
USE saviors;

CREATE TABLE accounts (
    username VARCHAR(30) PRIMARY KEY,
    password VARCHAR(30) NOT NULL,
    type TINYINT NOT NULL,
    fullname VARCHAR(60),
    telephone VARCHAR(12)
);

INSERT INTO accounts VALUES
('admin','admin',0, null, null);
INSERT INTO accounts VALUES
('test_admin', 'zoowee', 0, null, null);
INSERT INTO accounts VALUES
('npc', 'npc', 1, null, null);
INSERT INTO accounts VALUES
('res', 'res', 2, null, null);
INSERT INTO accounts VALUES
('mister_helper', 'forfree', 2, null, null);


CREATE TABLE items (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    category VARCHAR(255)
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

CREATE TABLE announce (
    id INT PRIMARY KEY auto_increment,
    title VARCHAR(255),
    descr VARCHAR(255),
    items JSON
);


SELECT * from items;
select * from details;
select * from categories;
select * from accounts;
select * from announce;

CREATE TABLE requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(30) NOT NULL,
    item_id INT NOT NULL,
    num_people INT UNSIGNED NOT NULL,
    status INT UNSIGNED NOT NULL,
    date_requested DATETIME default now(),
    date_accepted DATETIME,
    date_completed DATETIME,
    FOREIGN KEY (username) REFERENCES accounts(username),
    FOREIGN KEY (item_id) REFERENCES items(id)
);

CREATE TABLE `cargo` (
  `vehicle` enum('A','B','C') NOT NULL,
  `item_id` int NOT NULL,
  `item_name` varchar(255) DEFAULT NULL,
  `item_category` int DEFAULT NULL,
  PRIMARY KEY (`vehicle`),
  KEY `VEHICLE_ITEMS` (`item_id`),
  CONSTRAINT `VEHICLE_ITEMS` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
); 

DROP PROCEDURE IF EXISTS cargoLoaded;

DELIMITER $$

CREATE PROCEDURE cargoLoaded(IN item_tl_id INT,IN vehicle_tl ENUM('A','B','C'))
BEGIN 
   
   DECLARE tempItem_name VARCHAR(255);
   DECLARE tempItem_category INT;

   SELECT name INTO tempItem_name
   FROM items WHERE id = item_tl_id; 

   SELECT category INTO tempItem_category
   FROM items WHERE id = item_tl_id;  
   
   IF(tempItem_name IS NULL OR tempItem_category IS NULL) THEN
   INSERT INTO cargo 
   VALUES (vehicle_tl, item_tl_id, tempItem_name, tempItem_category);
   
   DELETE FROM items where id=item_tl_id;
   ELSE 
   SIGNAL SQLSTATE VALUE '45000'
   SET MESSAGE_TEXT = 'Item is out of stock';
   END IF;

END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS cargoDelivered;

DELIMITER $$

CREATE PROCEDURE cargoDelivered(IN item_td_id INT,IN vehicle_td ENUM('A','B','C'))
BEGIN 
   
   DECLARE tempItem_name VARCHAR(255);
   DECLARE tempItem_category INT;

   SELECT item_name INTO tempItem_name
   FROM cargo WHERE item_id = item_td_id AND vehicle = vehicle_td; 

   SELECT item_category INTO tempItem_category
   FROM cargo WHERE item_id = item_td_id AND vehicle = vehicle_td;   
   
   IF(tempItem_name IS NULL OR tempItem_category IS NULL) THEN
   INSERT INTO items 
   VALUES (item_td_id, tempItem_name, tempItem_category);
   
   DELETE FROM cargo where id=item_tl_id AND vehicle = vehicle_td; 
   ELSE 
   SIGNAL SQLSTATE VALUE '45000'
   SET MESSAGE_TEXT = 'Cargo is missing';
   END IF;

END $$
DELIMITER ;

SELECT 'requests' AS '';
-- \! echo 'some text';
