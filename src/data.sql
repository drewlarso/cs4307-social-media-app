INSERT INTO people (person_id, email, name, birthday) VALUES 
(1, 'alice@example.com', 'Alice Smith', '1992-05-14'),
(2, 'bob@example.com', 'Bob Jones', '1988-11-20'),
(3, 'charlie@example.com', 'Charlie Brown', '2001-02-03');

INSERT INTO accounts (account_id, person_id, username, created_date) VALUES 
(101, 1, 'alice_wonder', '2023-01-01 10:00:00'),
(102, 2, 'bobby_tables', '2023-01-05 11:30:00'),
(103, 3, 'chuck_rocks', '2023-02-10 09:15:00');

INSERT INTO follows (follow_id, from_id, to_id, created_date) VALUES 
(1, 101, 102, '2023-01-06 12:00:00'),
(2, 102, 103, '2023-02-15 08:45:00'),
(3, 103, 101, '2023-03-01 15:20:00');

INSERT INTO posts (post_id, account_id, topic_id, title, body, created_date) VALUES 
(501, 101, 10, 'Hello World', 'This is my first post!', '2023-01-01 12:00:00'),
(502, 102, 20, 'SQL Tips', 'Always remember to order your columns correctly.', '2023-01-10 14:30:00'),
(503, 103, 10, 'Random Thought', 'Why is the sky blue?', '2023-02-20 16:45:00');

INSERT INTO topics (topic_id, account_id, topic_name, description, created_date) VALUES
(10, 101, 'General', 'A place for random thoughts and hellos.', '2023-01-01 09:00:00'),
(20, 102, 'Tech Tips', 'Discussing SQL, coding, and best practices.', '2023-01-05 10:00:00'),
(21, 102, 'Gaming', 'Video games, consoles, and gaming culture.', '2023-01-05 10:00:00'),
(22, 102, 'Sports', 'Professional and amateur sports.', '2023-01-05 10:00:00'),
(23, 102, 'Music', 'Concerts, albums, and music discussions.', '2023-01-05 10:00:00'),
(24, 102, 'Movies', 'Film, television, and streaming.', '2023-01-05 10:00:00');

INSERT INTO likes (like_id, post_id, account_id, like_type) VALUES
(1, 501, 102, 1),
(2, 502, 103, 1),
(3, 501, 103, 1);

INSERT INTO replies (reply_id, post_id, account_id, body, created_date) VALUES
(1, 501, 102, 'Welcome to the platform, Alice!', '2023-01-01 13:00:00'),
(2, 502, 101, 'Great tip, very helpful.', '2023-01-11 09:00:00');

INSERT INTO passwords (password_id, account_id, secure_password) VALUES
(1, 101, 'hashed_password_123'),
(2, 102, 'hashed_password_456'),
(3, 103, 'hashed_password_789');
