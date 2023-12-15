CREATE TABLE accounts (
    username VARCHAR(30) PRIMARY KEY,
    password VARCHAR(30) NOT NULL,
    type TINYINT NOT NULL,
    fullname VARCHAR(60),
    telephone VARCHAR(12)
)ENGINE=InnoDB;

/* e.g.
INSERT INTO account_coordinates
VALUES
(aaaa, POINT(40.71727401 -74.00898606));

select username, ST_X(coordinate), ST_Y(coordinate) from account_coordinates;
*/
-- Coordinates are for rescuers (vehicles) and citizens.
CREATE TABLE account_coordinates (
    username VARCHAR(30) PRIMARY KEY,
    coordinate POINT NOT NULL,
    FOREIGN KEY (username) REFERENCES accounts(username)
)ENGINE=InnoDB;

/*
select ST_X(coordinate), ST_Y(coordinate) from base_coordinates;
*/
CREATE TABLE base_coordinates (
    id INT PRIMARY KEY,
    coordinate POINT NOT NULL
)ENGINE=InnoDB;
INSERT INTO base_coordinates VALUES (0, POINT(38.361427, 21.712058));

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
    quantity INT DEFAULT 1, -- current quantity in the central base !! SET TO 1 FOR TESTING !!
    CONSTRAINT ch_quantity CHECK (quantity > -1)
)ENGINE=InnoDB;

/* FOR TESTING */
UPDATE  items 
    SET quantity = 10 WHERE id>10; 

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


-- SELECT * from items;
-- select * from details;
-- select * from categories;
-- select * from accounts;
-- select * from announce;

CREATE TABLE requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(30) NOT NULL,
    item_id INT NOT NULL,
    num_people INT UNSIGNED NOT NULL,
    status INT UNSIGNED NOT NULL default 0,
    rescuer VARCHAR(30),
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
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(30) NOT NULL,
    -- announcement INT,
    date_offered DATETIME default now(),
    date_accepted DATETIME,
    date_completed DATETIME,
    status INT UNSIGNED NOT NULL default 0,
    rescuer VARCHAR(30),
    item_id INT NOT NULL, /* 1 item per offer */
    -- 0 for not picked up, 1 for picked up, 2 for completed
    -- TODO: if 1, cant delete 

    FOREIGN KEY (username) REFERENCES accounts(username),
    FOREIGN KEY (item_id) REFERENCES items(id)
    -- FOREIGN KEY (announcement) REFERENCES announce(id) 
);

-- TODO: Maybe add to table directly.
CREATE TABLE offer_status_code (
    status INT UNSIGNED PRIMARY KEY,
    meaning VARCHAR(30) NOT NULL
);
INSERT INTO offer_status_code VALUES
(0, 'Pending'),
(1, 'Picked up'),
(2, 'Delivered');

/*
CREATE TABLE offer_assumed_from (
    id INT,
    rescuer VARCHAR(30),

    PRIMARY KEY (id, rescuer),
    FOREIGN KEY (rescuer) REFERENCES accounts(username),
    FOREIGN KEY (id) REFERENCES offers(id)
)ENGINE=InnoDB; 

CREATE TABLE request_assumed_from (
    id INT,
    rescuer VARCHAR(30),

    PRIMARY KEY (id, rescuer),
    FOREIGN KEY (rescuer) REFERENCES accounts(username),
    FOREIGN KEY (id) REFERENCES requests(id)
)ENGINE=InnoDB;

-- vehicle: max 4 tasks
-- tasks: either offers or requests

CREATE TABLE tasks (
    id INT PRIMARY KEY,
    account_id INT,
    offer_id INT,
    request_id INT,

    FOREIGN KEY (account_id) REFERENCES accounts(account_id),
    FOREIGN KEY (offer_id) REFERENCES offers(offer_id),
    FOREIGN KEY (request_id) REFERENCES requests(request_id),
    CHECK (
        (offer_id IS NOT NULL AND request_id IS NULL) OR
        (offer_id IS NULL AND request_id IS NOT NULL)
    )
)
*/

