-- Remove item and quantity from base and add to cargo
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

   
   IF(tempItem_name IS NOT NULL) THEN

       IF(item_tl_quantity > tempQ) THEN
       SIGNAL SQLSTATE '45000'
       SET MESSAGE_TEXT = 'Not enough items';

       ELSE
       UPDATE items 
       SET quantity = quantity-item_tl_quantity 
       WHERE id = item_tl_id;
   
       INSERT INTO cargo 
       VALUES (res_username, item_tl_id, item_tl_quantity)
       ON duplicate key update
       res_quantity = res_quantity+item_tl_quantity;
       END IF;
   
   ELSE 
   SIGNAL SQLSTATE '45000'
   SET MESSAGE_TEXT = 'Item is out of stock';
   END IF;
END $$
DELIMITER ;

-- Spawn imaginary items in cargo vehicle
-- Happens when offer is completed
DROP PROCEDURE IF EXISTS completeOffer;
DELIMITER $$
CREATE PROCEDURE completeOffer(IN item_id INT,IN item_quantity INT, IN res_username VARCHAR(30), IN offer_id INT)
BEGIN
    DECLARE MESSAGE_TEXT VARCHAR(255);
    DECLARE success INT;

    INSERT INTO cargo
    VALUES (res_username, item_id, item_quantity)
    ON DUPLICATE KEY UPDATE res_quantity = res_quantity + item_quantity;

    -- Check if the last operation was successful
    SELECT ROW_COUNT() INTO success;

    IF success > 0 THEN
        -- mark offer as completed
        UPDATE offers
        SET date_completed = NOW(), status = 2
        WHERE id = offer_id;
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error during offer completion';
    END IF;

END $$
DELIMITER ;

-- Remove items from cargo vehicle
-- Happens when request is completed
DROP PROCEDURE IF EXISTS completeRequest;
DELIMITER $$
CREATE PROCEDURE completeRequest(IN item_id INT,IN item_quantity INT, IN res_username VARCHAR(30), IN request_id INT)
BEGIN
    DECLARE MESSAGE_TEXT VARCHAR(255);
    DECLARE success INT;
    DECLARE difference INT;

    SELECT res_quantity
    INTO difference
    FROM cargo
    WHERE username = res_username AND cargo.item_id = item_id;
    
    IF FOUND_ROWS() = 0 THEN
        SELECT FOUND_ROWS();
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Rescuer doesnt have that item.';
    ELSE
        -- check if enough items
        SET difference = difference - item_quantity;
        IF difference < 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Not enough items to complete request';
        ELSE
            -- hand over the items
            UPDATE cargo
            SET res_quantity = res_quantity - item_quantity
            WHERE username = res_username AND cargo.item_id = item_id;

            IF ROW_COUNT() > 0 THEN
                -- mark request as completed
                UPDATE requests
                SET status = 2, date_completed=NOW()
                WHERE id = request_id AND rescuer = res_username;
            ELSE
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Error during request completion';
            END IF;
        END IF;
    END IF;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS cargoDelivered;
DELIMITER $$
CREATE PROCEDURE cargoDelivered(IN res_username VARCHAR(30))
BEGIN 
    DECLARE MESSAGE_TEXT VARCHAR(255);

    IF EXISTS (SELECT 1 FROM cargo) THEN
        UPDATE items
        INNER JOIN cargo ON items.id = cargo.item_id
        SET items.quantity = items.quantity + cargo.res_quantity;

        -- unloads all, clear 0 values
        DELETE FROM cargo;
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cargo is missing';
    END IF;
END $$
DELIMITER ;

-- used by citizen
DROP PROCEDURE IF EXISTS cancelOffer;
DELIMITER $$
CREATE PROCEDURE cancelOffer(IN delete_offer_id INT)
BEGIN 

    DECLARE delete_offer_status INT UNSIGNED;

    SELECT status INTO delete_offer_status
    FROM offers WHERE id = delete_offer_id; 

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


-- TODO: PREPARE EXECUTE
DROP PROCEDURE IF EXISTS getTaskNum;
DELIMITER $$
CREATE PROCEDURE getTaskNum(IN res_username VARCHAR(30), OUT total_rows INT UNSIGNED)
BEGIN 
   DECLARE offer_num INT UNSIGNED;
   DECLARE request_num INT UNSIGNED;


   SELECT COUNT(*) INTO offer_num
   FROM offers WHERE rescuer = res_username AND status <> 2;
   -- status=2 means completed 

   SELECT COUNT(*) INTO request_num
   FROM requests WHERE rescuer = res_username AND status <> 2;
   
   SET total_rows = offer_num + request_num;
END $$
DELIMITER ;

/*
    SELECT COUNT(*)
   FROM offers WHERE rescuer = res_username AND status <> 2;
   
   SELECT COUNT(*)
    FROM requests WHERE rescuer = res_username AND status <> 2;
*/