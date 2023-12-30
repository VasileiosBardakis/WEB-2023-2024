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
DELIMITER //
CREATE TRIGGER assume_offer
BEFORE UPDATE ON offers
FOR EACH ROW
BEGIN
    DECLARE task_num INT;

    -- If update is on rescuer column
    IF !(NEW.rescuer <=> OLD.rescuer) THEN
        -- Check the condition
        CALL getTaskNum(NEW.username, task_num);

        IF !(task_num < 4) THEN
            SIGNAL SQLSTATE VALUE '45000'
            SET MESSAGE_TEXT = `Can't assume offer, max number of tasks reached.`;
        END IF;
    END IF;
END;
//
DELIMITER ;
-- res_username and triggers TODO:
DELIMITER //
CREATE TRIGGER assume_request
BEFORE UPDATE ON requests
FOR EACH ROW
BEGIN
    DECLARE task_num INT;
    -- If update is on rescuer column
    IF !(NEW.rescuer <=> OLD.rescuer) THEN
        -- Check the condition
        CALL getTaskNum(NEW.username, task_num);

        IF !(task_num < 4) THEN
            SIGNAL SQLSTATE VALUE '45000'
            SET MESSAGE_TEXT = `Can't assume request, max number of tasks reached.`;
        END IF;
    END IF;
END;
//
DELIMITER ;