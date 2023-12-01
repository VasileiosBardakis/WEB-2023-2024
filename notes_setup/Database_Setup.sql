ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
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
)ENGINE=InnoDB;

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

-- all possible items in the database
CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    category VARCHAR(255),
    quantity INT, -- current quantity in the central base
    CONSTRAINT ch_quantity CHECK (quantity > -1)
)ENGINE=InnoDB;

/* FOR TESTING */
UPDATE  items 
    SET quantity = 10 WHERE id>10; 
    
-- alternative versions of items (e.g. 125ml water)
CREATE TABLE details (
    detail_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT,
    detail_name VARCHAR(255),
    detail_value VARCHAR(255),

    FOREIGN KEY (item_id) REFERENCES items(id)
)ENGINE=InnoDB;

CREATE TABLE categories (
    id INT PRIMARY KEY,
    category_name VARCHAR(255)
)ENGINE=InnoDB;

-- admin announcements for 
CREATE TABLE announce (
    id INT PRIMARY KEY auto_increment,
    title VARCHAR(255),
    descr VARCHAR(255),
    items JSON
)ENGINE=InnoDB;


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
)ENGINE=InnoDB;

CREATE TABLE request_status_code (
    status INT UNSIGNED PRIMARY KEY,
    meaning VARCHAR(30) NOT NULL
);
INSERT INTO request_status_code VALUES
(0, 'Pending'),
(1, 'Accepted'),
(2, 'Completed');

CREATE TABLE cargo (
  username VARCHAR(30) NOT NULL,
  item_id int NOT NULL,
  item_name varchar(255) DEFAULT NULL,
  item_category int DEFAULT NULL,
  res_quantity int,
  
  CONSTRAINT ch_res_quantity CHECK (res_quantity > -1),

  FOREIGN KEY (username) REFERENCES accounts(username)
)ENGINE=InnoDB; 

-- offers are in response to announcements
CREATE TABLE offers (
    id INT PRIMARY KEY,
    username VARCHAR(30) NOT NULL,
    announcement INT,
    date_offered DATETIME default now(),
    date_completed DATETIME,
    status INT UNSIGNED NOT NULL,
    -- 0 for not picked up, 1 for picked up, 2 for completed
    -- TODO: if 1, cant delete 

    FOREIGN KEY (username) REFERENCES accounts(username),

    FOREIGN KEY (announcement) REFERENCES announce(id) 
);

CREATE TABLE offer_status_code (
    status INT UNSIGNED PRIMARY KEY,
    meaning VARCHAR(30) NOT NULL
);
INSERT INTO offer_status_code VALUES
(0, 'Pending'),
(1, 'Picked up'),
(2, 'Delivered');


-- joined with table offers to see every item from an offer (1 offer -> multiple items)
CREATE TABLE offers_items (
    id INT,
    item_id INT,

    PRIMARY KEY (id, item_id),

    FOREIGN KEY (id) REFERENCES offers(id),
    
    FOREIGN KEY (item_id) REFERENCES items(id)
);

-- vehicle: max 4 tasks
-- tasks: either offers or requests
/*
CREATE TABLE tasks (
    username VARCHAR(30),
)
*/

DROP PROCEDURE IF EXISTS cargoLoaded;

DELIMITER $$

CREATE PROCEDURE cargoLoaded(IN item_tl_id INT,IN item_tl_quantity INT, IN res_username VARCHAR(30))
BEGIN 
   
   DECLARE tempItem_name VARCHAR(255);
   DECLARE tempItem_category INT;
   DECLARE tempQ INT;
   
   SELECT quantity INTO tempQ
   FROM items WHERE id = item_tl_id; 

   SELECT name INTO tempItem_name
   FROM items WHERE id = item_tl_id; 

   SELECT category INTO tempItem_category
   FROM items WHERE id = item_tl_id;  
   
   IF(tempItem_name IS NOT NULL OR tempItem_category IS NOT NULL) THEN

       IF(item_tl_quantity > tempQ) THEN
       SIGNAL SQLSTATE VALUE '45000'
       SET MESSAGE_TEXT = 'Not enough items';

       ELSE
       UPDATE  items 
       SET quantity = quantity-item_tl_quantity 
       WHERE id = item_tl_id;
   
       INSERT INTO cargo 
       VALUES (res_username, item_tl_id, tempItem_name, tempItem_category,item_tl_quantity)
       ON duplicate key update
       res_quantity = res_quantity+item_tl_quantity;
       END IF;
   
   ELSE 
   SIGNAL SQLSTATE VALUE '45000'
   SET MESSAGE_TEXT = 'Item is out of stock';
   END IF;

END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS cargoDelivered;

DELIMITER $$

CREATE PROCEDURE cargoDelivered(IN item_td_id INT,IN item_td_quantity INT, IN res_username VARCHAR(30))
BEGIN 
   
   DECLARE tempItem_name VARCHAR(255);
   DECLARE tempItem_category INT;
   DECLARE tempQ INT;
   
   SELECT res_quantity INTO tempQ
   FROM cargo WHERE item_id = item_td_id AND username = res_username; 

   SELECT item_name INTO tempItem_name
   FROM cargo WHERE item_id = item_td_id AND username = res_username; 

   SELECT item_category INTO tempItem_category
   FROM cargo WHERE item_id = item_td_id AND username = res_username;   
   
   IF(tempItem_name IS NOT NULL OR tempItem_category IS NOT NULL) THEN
   
   IF(item_td_quantity > tempQ) THEN
   SIGNAL SQLSTATE VALUE '45000'
   SET MESSAGE_TEXT = 'Not enough items';
   
   ELSE
   UPDATE cargo 
   SET res_quantity = res_quantity - item_td_quantity 
   WHERE item_id = item_td_id;
   DELETE FROM cargo WHERE res_quantity =0;
   
   UPDATE items 
   SET quantity = quantity + item_td_quantity
   WHERE id = item_td_id;
   END IF;
   
   ELSE 
   SIGNAL SQLSTATE VALUE '45000'
   SET MESSAGE_TEXT = 'Cargo is missing';
   END IF;

END $$
DELIMITER ;

SELECT 'requests' AS '';
-- \! echo 'some text';




DELIMITER $$

CREATE PROCEDURE cancelOffer(IN delete_offer_id INT)
BEGIN 

    DECLARE delete_offer_status INT UNSIGNED;

    SELECT status INTO delete_offer_status
    FROM offers WHERE id = delete_offer_id; 

    -- TODO: = vs IS
    -- if not picked up or completed, can delete
    IF(delete_offer_status = 0) THEN
        DELETE FROM offers
        WHERE id = delete_offer_id;

    ELSE
        SIGNAL SQLSTATE VALUE '45000'
        SET MESSAGE_TEXT = `Can't delete a picked-up offer.`;
        
    END IF;

END $$
DELIMITER ;

DELIMITER //
CREATE TRIGGER before_delete_item
BEFORE DELETE ON items
FOR EACH ROW
BEGIN
    DELETE FROM details
    WHERE item_id = OLD.id;
END;
//
DELIMITER ;

