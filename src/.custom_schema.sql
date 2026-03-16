CREATE TABLE IF NOT EXISTS people (
    person_id INTEGER PRIMARY KEY,
    email TEXT,
    name TEXT,
    birthday DATE
);

CREATE TABLE IF NOT EXISTS accounts (
    account_id INTEGER PRIMARY KEY,
    person_id INTEGER,
    username TEXT,
    created_date DATETIME,
    FOREIGN KEY (person_id) REFERENCES people(person_id)
);

CREATE TABLE IF NOT EXISTS follows (
    follow_id INTEGER PRIMARY KEY,
    from_id INTEGER,
    to_id INTEGER,
    created_date DATETIME,
    FOREIGN KEY (from_id) REFERENCES accounts(account_id),
    FOREIGN KEY (to_id) REFERENCES accounts(account_id)
);

CREATE TABLE IF NOT EXISTS posts (
    post_id INTEGER PRIMARY KEY,
    account_id INTEGER,
    topic_id INTEGER,
    title TEXT,
    body TEXT,
    created_date DATETIME,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);

CREATE TABLE IF NOT EXISTS topics (
    topic_id INTEGER PRIMARY KEY,
    account_id INTEGER,
    topic_name TEXT,
    description TEXT,
    created_date DATETIME,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);

CREATE TABLE IF NOT EXISTS likes (
    like_id INTEGER PRIMARY KEY,
    post_id INTEGER,
    account_id INTEGER,
    like_type BOOLEAN,
    FOREIGN KEY (post_id) REFERENCES posts(post_id),
    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);

CREATE TABLE IF NOT EXISTS replies (
    reply_id INTEGER PRIMARY KEY,
    post_id INTEGER,
    account_id INTEGER,
    body TEXT,
    created_date DATETIME,
    FOREIGN KEY (post_id) REFERENCES posts(post_id),
    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);

CREATE TABLE IF NOT EXISTS blocks (
    block_id INTEGER PRIMARY KEY,
    from_id INTEGER,
    to_id INTEGER,
    FOREIGN KEY (from_id) REFERENCES accounts(account_id),
    FOREIGN KEY (to_id) REFERENCES accounts(account_id)
);

CREATE TABLE IF NOT EXISTS passwords (
    password_id INTEGER PRIMARY KEY,
    account_id INTEGER,
    secure_password TEXT,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);