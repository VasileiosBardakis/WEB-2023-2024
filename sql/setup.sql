-- setup.sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
flush privileges;

DROP DATABASE IF EXISTS saviors;
CREATE DATABASE saviors;
USE saviors;

-- Tables
select 'tables';
SOURCE tables.sql;
-- Triggers
select 'triggers';
SOURCE triggers.sql;
-- Procedures
select 'procedures';
SOURCE procedures.sql;








