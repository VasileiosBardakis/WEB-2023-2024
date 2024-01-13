CREATE INDEX username_index ON accounts(username);
CREATE INDEX username_cargo_index ON cargo(username);
CREATE INDEX offers_index ON offers(username, id);
CREATE INDEX requests_index ON requests(username,id, rescuer);