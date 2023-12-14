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
CREATE TRIGGER assume_offer
BEFORE INSERT ON items
BEFORE INSERT ON source_table
FOR EACH ROW
BEGIN
    -- Check the condition
    DECLARE task_num INT;
    CALL getTaskNum(NEW.username, task_num);

    IF task_num < 4 THEN
        -- Insert into target_table
        INSERT INTO target_table (column1, column2, column3)
        VALUES (NEW.column1, NEW.column2, NEW.column3);
    END IF;
END;
//
DELIMITER ;


DELIMITER //
CREATE TRIGGER assume_request
BEFORE INSERT ON items
FOR EACH ROW
BEGIN
    DELETE FROM details
    WHERE item_id = OLD.id;
END;
//
DELIMITER ;