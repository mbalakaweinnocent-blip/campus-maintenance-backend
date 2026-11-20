CREATE TABLE IF NOT EXISTS records (
    id SERIAL PRIMARY KEY,
    title VARCHAR(80) NOT NULL CHECK (char_length(trim(title)) BETWEEN 3 AND 80),
    category VARCHAR(40) NOT NULL CHECK (char_length(trim(category)) BETWEEN 2 AND 40),
    description VARCHAR(300) NOT NULL CHECK (char_length(trim(description)) BETWEEN 5 AND 300),
    status VARCHAR(20) NOT NULL CHECK (status IN ('Pending', 'In progress', 'Completed'))
);