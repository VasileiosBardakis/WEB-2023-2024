-- TODO: prevent status 1 without res

CREATE TABLE accounts (
    username VARCHAR(30) PRIMARY KEY,
    password VARCHAR(30) NOT NULL,
    type TINYINT NOT NULL,
    fullname VARCHAR(60) NOT NULL,
    telephone VARCHAR(12) NOT NULL
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

CREATE TABLE categories (
    id INT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL
)ENGINE=InnoDB;

-- TODO: Testing values remove
-- all possible items in the database
CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category INT NOT NULL,
    quantity INT DEFAULT 1, -- current quantity in the central base !! SET TO 1 FOR TESTING !!
    
    FOREIGN KEY (category) REFERENCES categories(id),

    CONSTRAINT ch_quantity CHECK (quantity > -1)
)ENGINE=InnoDB;

/* FOR TESTING */
UPDATE items 
    SET quantity = 10 WHERE id>10; 

CREATE TABLE details (
    detail_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT,
    detail_name VARCHAR(255),
    detail_value VARCHAR(255),

    FOREIGN KEY (item_id) REFERENCES items(id)
    -- TODO: Composite
)ENGINE=InnoDB;


-- admin announcements for offers
CREATE TABLE announce (
    id INT PRIMARY KEY auto_increment,
    title VARCHAR(255) NOT NULL,
    descr VARCHAR(255) NOT NULL,
    items JSON NOT NULL
)ENGINE=InnoDB;

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
  res_quantity int NOT NULL,
  
  CONSTRAINT ch_res_quantity CHECK (res_quantity > -1),

  PRIMARY KEY (username, item_id),
  FOREIGN KEY (username) REFERENCES accounts(username)
)ENGINE=InnoDB; 

-- offers are in response to announcements
CREATE TABLE offers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(30) NOT NULL,
    item_id INT NOT NULL, /* 1 item per offer */
    status INT UNSIGNED NOT NULL default 0,
    rescuer VARCHAR(30),
    date_offered DATETIME default now(),
    date_accepted DATETIME,
    date_completed DATETIME,

    -- 0 for not picked up, 1 for picked up, 2 for completed

    FOREIGN KEY (username) REFERENCES accounts(username),
    FOREIGN KEY (item_id) REFERENCES items(id)
    -- FOREIGN KEY (announcement) REFERENCES announce(id) 
);

CREATE TABLE offer_status_code (
    status INT UNSIGNED PRIMARY KEY,
    meaning VARCHAR(30) NOT NULL
);
INSERT INTO offer_status_code VALUES
(0, 'Pending'),
(1, 'Picked up'),
(2, 'Delivered');
