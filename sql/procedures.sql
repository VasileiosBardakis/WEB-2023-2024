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
CREATE PROCEDURE cargoDelivered(IN res_username VARCHAR(30))
BEGIN 
    DECLARE MESSAGE_TEXT VARCHAR(255);

    IF EXISTS (SELECT 1 FROM cargo) THEN
        UPDATE items
        INNER JOIN cargo ON items.id = cargo.item_id
        SET items.quantity = items.quantity + cargo.res_quantity;

        DELETE FROM cargo;
    ELSE
        SIGNAL SQLSTATE VALUE '45000';
        SET MESSAGE_TEXT = 'Cargo is missing';
    END IF;
END $$
DELIMITER ;

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


-- TODO: PREPARE EXECUTE
DROP PROCEDURE IF EXISTS getTaskNum;
DELIMITER $$
CREATE PROCEDURE getTaskNum(IN res_username VARCHAR(30), OUT total_rows INT UNSIGNED)
BEGIN 
   DECLARE offer_num INT UNSIGNED;
   DECLARE request_num INT UNSIGNED;
   
   SELECT COUNT(*) INTO offer_num
   FROM offer_assumed_from WHERE rescuer = res_username; 

   SELECT COUNT(*) INTO request_num
   FROM request_assumed_from WHERE rescuer = res_username;
   
   SET total_rows = offer_num + request_num;
END $$
DELIMITER ;
