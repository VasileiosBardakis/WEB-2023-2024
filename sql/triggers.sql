DROP TRIGGER IF EXISTS before_delete_item;
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

DROP TRIGGER IF EXISTS before_delete_categories;
DELIMITER //
CREATE TRIGGER before_delete_categories
BEFORE DELETE ON categories
FOR EACH ROW
BEGIN
    DELETE FROM items
    WHERE category = OLD.id;
END;
//
DELIMITER ;

-- https://stackoverflow.com/questions/19152974/fire-a-trigger-after-the-update-of-specific-columns-in-mysql
DROP TRIGGER IF EXISTS assume_offer;
DELIMITER //
CREATE TRIGGER assume_offer
BEFORE UPDATE ON offers
FOR EACH ROW
BEGIN
    DECLARE task_num INT;
    DECLARE MESSAGE_TEXT VARCHAR(255);

    -- If update is on rescuer column
    IF NOT(NEW.rescuer <=> OLD.rescuer) THEN
        -- Check the condition
        CALL getTaskNum(NEW.rescuer, task_num);

        IF NOT(task_num < 4) THEN
            SIGNAL SQLSTATE VALUE '45000'
            SET MESSAGE_TEXT = 'Can''t assume offer, max number of tasks reached.';
        END IF;
    END IF;
END;
//
DELIMITER ;

DROP TRIGGER IF EXISTS assume_request;
DELIMITER //
CREATE TRIGGER assume_request
BEFORE UPDATE ON requests
FOR EACH ROW
BEGIN
    DECLARE task_num INT;
    DECLARE MESSAGE_TEXT VARCHAR(255);
    
    -- If update is on rescuer column
    IF NOT(NEW.rescuer <=> OLD.rescuer) THEN
        -- Check the condition
        CALL getTaskNum(NEW.rescuer, task_num);

        IF NOT(task_num < 4) THEN
            SIGNAL SQLSTATE VALUE '45000'
            SET MESSAGE_TEXT = 'Can''t assume request, max number of tasks reached.';
        END IF;
    END IF;
END;
//
DELIMITER ;