CREATE TABLE if not exists students (
   id INT PRIMARY KEY,
   first_name VARCHAR,
   last_name VARCHAR,
   gender VARCHAR(2),
   gpa REAL
);

INSERT INTO
   students (id, first_name, last_name, gender, gpa)
VALUES
   (1, "Jerry", "Garcia", 2.3, "M"),
   (2, "Penelope", "Cruz", 3.1, "F"),
   (3, "Bob", "Saget", 3.2, "M"),
   (4, "Caitlyn", "Jenner", 2.5, "?");
