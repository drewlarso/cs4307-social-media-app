INSERT INTO users (id, email, display_name, created_at) VALUES
    (1, 'alice@example.com', 'Alice Johnson', '2024-01-01 10:00:00'),
    (2, 'bob@example.com', 'Bob Smith', '2024-01-02 11:00:00'),
    (3, 'charlie@example.com', 'Charlie Brown', '2024-01-03 12:00:00'),
    (4, 'diana@example.com', 'Diana Prince', '2024-01-04 13:00:00'),
    (5, 'eve@example.com', 'Eve Adams', '2024-01-05 14:00:00');

INSERT INTO accounts (account_id, user_id, username, bio, created_at) VALUES
    (1, 1, 'alice_main', 'Tech enthusiast and blogger', '2024-01-01 10:30:00'),
    (2, 1, 'alice_gaming', 'Gaming channel', '2024-01-01 11:00:00'),
    (3, 2, 'bob_codes', 'Software developer', '2024-01-02 11:30:00'),
    (4, 3, 'charlie_art', 'Digital artist', '2024-01-03 12:30:00'),
    (5, 4, 'diana_writes', 'Writer and poet', '2024-01-04 13:30:00'),
    (6, 4, 'diana_photos', 'Photography', '2024-01-04 14:00:00'),
    (7, 5, 'eve_tech', 'Tech reviewer', '2024-01-05 14:30:00');

INSERT INTO follows (follower_account_id, followee_account_id, followed_at) VALUES
    (1, 3, '2024-01-06 10:00:00'),
    (1, 4, '2024-01-06 10:05:00'),
    (2, 5, '2024-01-06 11:00:00'),
    (3, 1, '2024-01-07 09:00:00'),
    (3, 4, '2024-01-07 09:10:00'),
    (4, 1, '2024-01-08 14:00:00'),
    (4, 3, '2024-01-08 14:15:00'),
    (5, 1, '2024-01-09 16:00:00'),
    (5, 3, '2024-01-09 16:20:00'),
    (6, 2, '2024-01-10 08:00:00');

INSERT INTO posts (post_id, account_id, content, created_at) VALUES
    (1, 1, 'Just launched my new blog! Check it out at alice.tech #coding', '2024-01-11 09:00:00'),
    (2, 3, 'Working on an exciting new project with @alice_main', '2024-01-11 10:30:00'),
    (3, 4, 'Finished my latest digital artwork! @diana_writes what do you think?', '2024-01-12 14:20:00'),
    (4, 5, 'The sunset today was absolutely breathtaking', '2024-01-12 18:45:00'),
    (5, 2, 'Streaming tonight at 8pm! Going to play some retro games', '2024-01-13 15:00:00'),
    (6, 6, 'Captured this amazing moment at the beach 🌅', '2024-01-13 19:30:00'),
    (7, 7, 'Just reviewed the new Python 3.13 features!', '2024-01-14 11:00:00'),
    (8, 1, 'Anyone going to the tech conference next week?', '2024-01-14 16:15:00');

INSERT INTO likes (account_id, post_id, liked_at) VALUES
    (1, 3, '2024-01-12 15:00:00'),
    (1, 4, '2024-01-12 19:00:00'),
    (3, 1, '2024-01-11 10:00:00'),
    (3, 4, '2024-01-12 19:30:00'),
    (4, 1, '2024-01-11 11:00:00'),
    (4, 2, '2024-01-11 12:00:00'),
    (5, 1, '2024-01-11 09:30:00'),
    (5, 2, '2024-01-11 11:30:00'),
    (6, 5, '2024-01-13 16:00:00'),
    (7, 1, '2024-01-11 10:15:00'),
    (7, 8, '2024-01-14 17:00:00');

INSERT INTO replies (reply_id, post_id, account_id, content, created_at) VALUES
    (1, 1, 3, 'Congrats on the launch!', '2024-01-11 09:30:00'),
    (2, 1, 5, 'Can''t wait to read it!', '2024-01-11 09:45:00'),
    (3, 4, 1, 'Beautiful shot!', '2024-01-12 19:15:00'),
    (4, 5, 6, 'What games are you playing?', '2024-01-13 15:30:00');

INSERT INTO blocks (blocker_account_id, blocked_account_id, blocked_at) VALUES
    (2, 7, '2024-01-14 20:00:00');

INSERT INTO mentions (post_id, mentioned_account_id, notified) VALUES
    (2, 1, 1),
    (3, 5, 1);
