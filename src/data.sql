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
    FOREIGN KEY (person_id) REFERENCES people(person_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS follows (
    follow_id INTEGER PRIMARY KEY,
    from_id INTEGER,
    to_id INTEGER,
    created_date DATETIME,
    FOREIGN KEY (from_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    FOREIGN KEY (to_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS posts (
    post_id INTEGER PRIMARY KEY,
    account_id INTEGER,
    topic_id INTEGER,
    title TEXT,
    body TEXT,
    created_date DATETIME,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS topics (
    topic_id INTEGER PRIMARY KEY,
    account_id INTEGER,
    topic_name TEXT,
    description TEXT,
    created_date DATETIME,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS likes (
    like_id INTEGER PRIMARY KEY,
    post_id INTEGER,
    account_id INTEGER,
    like_type BOOLEAN,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS replies (
    reply_id INTEGER PRIMARY KEY,
    post_id INTEGER,
    account_id INTEGER,
    body TEXT,
    created_date DATETIME,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS blocks (
    block_id INTEGER PRIMARY KEY,
    from_id INTEGER,
    to_id INTEGER,
    FOREIGN KEY (from_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    FOREIGN KEY (to_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS passwords (
    password_id INTEGER PRIMARY KEY,
    account_id INTEGER,
    secure_password TEXT,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

-- ─── PEOPLE ───────────────────────────────────────────────────────────────────
INSERT INTO people (person_id, email, name, birthday) VALUES 
(1,  'alice@example.com',   'Alice Smith',    '1992-05-14'),
(2,  'bob@example.com',     'Bob Jones',      '1988-11-20'),
(3,  'charlie@example.com', 'Charlie Brown',  '2001-02-03'),
(4,  'diana@example.com',   'Diana Prince',   '1995-07-30'),
(5,  'ethan@example.com',   'Ethan Hunt',     '1990-03-12'),
(6,  'fiona@example.com',   'Fiona Green',    '1998-09-25'),
(7,  'george@example.com',  'George Park',    '1985-12-01'),
(8,  'hannah@example.com',  'Hannah Lee',     '2000-06-17'),
(9,  'ivan@example.com',    'Ivan Drago',     '1983-04-05'),
(10, 'julia@example.com',   'Julia Roberts',  '1993-08-22'),
(11, 'kevin@example.com',   'Kevin Bacon',    '1987-10-08'),
(12, 'laura@example.com',   'Laura Palmer',   '1999-01-16');

-- ─── ACCOUNTS ─────────────────────────────────────────────────────────────────
INSERT INTO accounts (account_id, person_id, username, created_date) VALUES 
(101, 1,  'alice_wonder',   '2023-01-01 10:00:00'),
(102, 2,  'bobby_tables',   '2023-01-05 11:30:00'),
(103, 3,  'chuck_rocks',    '2023-02-10 09:15:00'),
(104, 4,  'diana_codes',    '2023-02-14 08:00:00'),
(105, 5,  'ethan_runs',     '2023-03-01 12:00:00'),
(106, 6,  'fi_green',       '2023-03-10 14:30:00'),
(107, 7,  'geo_park',       '2023-03-15 07:45:00'),
(108, 8,  'hannah_beats',   '2023-04-01 09:00:00'),
(109, 9,  'ivan_the_great', '2023-04-10 16:00:00'),
(110, 10, 'julia_r',        '2023-04-20 11:00:00'),
(111, 11, 'six_degrees',    '2023-05-01 10:30:00'),
(112, 12, 'laura_p',        '2023-05-15 13:00:00');

-- ─── TOPICS ───────────────────────────────────────────────────────────────────
INSERT INTO topics (topic_id, account_id, topic_name, description, created_date) VALUES
(10, 101, 'General',      'A place for random thoughts and hellos.',          '2023-01-01 09:00:00'),
(20, 102, 'Tech Tips',    'Discussing SQL, coding, and best practices.',       '2023-01-05 10:00:00'),
(21, 102, 'Gaming',       'Video games, consoles, and gaming culture.',        '2023-01-05 10:00:00'),
(22, 102, 'Sports',       'Professional and amateur sports.',                  '2023-01-05 10:00:00'),
(23, 102, 'Music',        'Concerts, albums, and music discussions.',          '2023-01-05 10:00:00'),
(24, 102, 'Movies',       'Film, television, and streaming.',                  '2023-01-05 10:00:00'),
(25, 104, 'Science',      'Physics, biology, space, and everything else.',     '2023-02-15 09:30:00'),
(26, 105, 'Fitness',      'Workouts, nutrition, and healthy living.',          '2023-03-02 07:00:00'),
(27, 106, 'Food & Drink', 'Recipes, restaurants, and culinary adventures.',   '2023-03-11 12:00:00'),
(28, 107, 'Travel',       'Destinations, tips, and travel stories.',           '2023-03-16 08:00:00'),
(29, 108, 'Books',        'Reading lists, reviews, and literary discussion.',  '2023-04-02 10:00:00'),
(30, 110, 'Photography',  'Cameras, techniques, and stunning shots.',          '2023-04-21 11:30:00');

-- ─── POSTS ────────────────────────────────────────────────────────────────────
INSERT INTO posts (post_id, account_id, topic_id, title, body, created_date) VALUES 
(501, 101, 10, 'Hello World',                   'This is my first post! So excited to be here.',                                           '2023-01-01 12:00:00'),
(502, 102, 20, 'SQL Tips',                      'Always remember to order your columns correctly and index your foreign keys.',              '2023-01-10 14:30:00'),
(503, 103, 10, 'Random Thought',                'Why is the sky blue? Rayleigh scattering, apparently.',                                    '2023-02-20 16:45:00'),
(504, 104, 25, 'Black Holes Explained',         'A black hole is a region of spacetime where gravity is so strong nothing can escape.',     '2023-02-15 10:00:00'),
(505, 105, 26, 'Morning Run Tips',              'Run 10 mins easy before picking up pace. Consistency beats intensity every time.',         '2023-03-05 06:30:00'),
(506, 106, 27, 'Best Homemade Ramen',           'The secret is in the broth — simmer pork bones for at least 6 hours.',                    '2023-03-12 18:00:00'),
(507, 107, 28, 'Tokyo in 5 Days',               'Day 1: Shibuya. Day 2: Asakusa. Day 3: Akihabara. Day 4: Harajuku. Day 5: Shimokitazawa.','2023-03-18 09:00:00'),
(508, 108, 29, 'Reading List 2023',             'Currently reading: Project Hail Mary, Tomorrow and Tomorrow and Tomorrow, Piranesi.',       '2023-04-03 11:00:00'),
(509, 109, 22, 'Champions League Predictions',  'I have a feeling this is going to be a wild knockout stage. Fight me.',                    '2023-04-12 20:00:00'),
(510, 110, 30, 'Golden Hour Photography',       'Shoot 30 mins before sunset. Use a wide aperture, find a compelling foreground subject.',  '2023-04-22 17:00:00'),
(511, 111, 21, 'Best RPGs of the Decade',       'Elden Ring, BG3, Witcher 3, Disco Elysium — what am I missing?',                          '2023-05-02 14:00:00'),
(512, 112, 23, 'Albums That Changed My Life',   'Radiohead OK Computer. Kendrick TPAB. Sufjan Illinois. Drop yours below.',                 '2023-05-16 12:00:00'),
(513, 101, 24, 'Underrated Sci-Fi Films',       'Annihilation, Coherence, Primer — all cerebral, all brilliant.',                           '2023-05-20 10:00:00'),
(514, 102, 20, 'REST vs GraphQL',               'GraphQL gives clients flexibility but REST is simpler to cache. Depends on your use case.','2023-05-25 09:00:00'),
(515, 103, 26, 'My Gym Journey',                'Started with just bodyweight. Six months later I can deadlift 2x my bodyweight.',          '2023-06-01 08:00:00'),
(516, 104, 25, 'Is Dark Matter Real?',          'We have indirect evidence but have never directly detected a dark matter particle.',        '2023-06-10 11:00:00'),
(517, 105, 22, 'NBA Finals Take',               'Defense wins championships. Whoever has the better perimeter defense wins the series.',     '2023-06-15 21:00:00'),
(518, 106, 27, 'Perfect Sourdough Loaf',        'Autolyse 1 hour, stretch and fold every 30 mins, cold proof overnight. Worth it.',         '2023-06-20 07:00:00'),
(519, 107, 28, 'Hidden Gems in Portugal',       'Skip Lisbon for a day and head to Sintra. Unreal palaces, dramatic coastline.',            '2023-06-25 14:00:00'),
(520, 108, 29, 'Why You Should Read Stoics',    'Marcus Aurelius Meditations was written as a private journal. Read it that way.',          '2023-07-01 09:00:00'),
(521, 109, 21, 'Retro Gaming is Back',          'CRT monitors, cartridge collecting, and original hardware — the community is huge.',        '2023-07-05 15:00:00'),
(522, 110, 30, 'Film vs Digital Photography',   'Film forces you to be deliberate. Digital lets you experiment fast. Use both.',            '2023-07-10 11:00:00'),
(523, 111, 23, 'Live Music is Irreplaceable',   'Saw Phoebe Bridgers last night. No streaming mix captures that.',                         '2023-07-15 23:00:00'),
(524, 112, 24, 'The Prestige is Perfect',       'Every scene, every line matters. It rewards rewatching more than any film I know.',        '2023-07-20 16:00:00'),
(525, 101, 10, 'Six Months on This Platform',   'Met so many interesting people here. Thank you all. Here is to six more months.',          '2023-07-01 10:00:00');

-- ─── FOLLOWS ──────────────────────────────────────────────────────────────────
INSERT INTO follows (follow_id, from_id, to_id, created_date) VALUES 
(1,  101, 102, '2023-01-06 12:00:00'),
(2,  101, 104, '2023-02-16 09:00:00'),
(3,  101, 107, '2023-03-20 10:00:00'),
(4,  101, 110, '2023-04-25 11:00:00'),
(5,  102, 103, '2023-02-15 08:45:00'),
(6,  102, 101, '2023-01-08 10:00:00'),
(7,  102, 105, '2023-03-05 07:00:00'),
(8,  102, 111, '2023-05-03 14:30:00'),
(9,  103, 101, '2023-03-01 15:20:00'),
(10, 103, 106, '2023-03-15 12:00:00'),
(11, 103, 108, '2023-04-05 10:00:00'),
(12, 104, 101, '2023-02-20 08:00:00'),
(13, 104, 109, '2023-04-15 16:00:00'),
(14, 104, 112, '2023-05-20 13:00:00'),
(15, 105, 102, '2023-03-10 09:00:00'),
(16, 105, 107, '2023-03-20 11:00:00'),
(17, 105, 109, '2023-04-15 20:00:00'),
(18, 106, 101, '2023-03-15 14:00:00'),
(19, 106, 108, '2023-04-05 10:30:00'),
(20, 106, 110, '2023-04-25 12:00:00'),
(21, 107, 103, '2023-03-20 08:00:00'),
(22, 107, 105, '2023-03-20 08:01:00'),
(23, 107, 111, '2023-05-05 15:00:00'),
(24, 108, 106, '2023-04-05 11:00:00'),
(25, 108, 112, '2023-05-20 13:30:00'),
(26, 109, 104, '2023-04-18 17:00:00'),
(27, 109, 105, '2023-04-18 17:01:00'),
(28, 110, 101, '2023-04-25 11:30:00'),
(29, 110, 108, '2023-04-25 11:31:00'),
(30, 111, 102, '2023-05-05 14:00:00'),
(31, 111, 112, '2023-05-20 14:00:00'),
(32, 112, 108, '2023-05-20 13:45:00'),
(33, 112, 111, '2023-05-20 13:46:00');

-- ─── LIKES ────────────────────────────────────────────────────────────────────
INSERT INTO likes (like_id, post_id, account_id, like_type) VALUES
(1,  501, 102, 1),
(2,  501, 103, 1),
(3,  501, 104, 1),
(4,  501, 106, 1),
(5,  501, 110, 1),
(6,  502, 101, 1),
(7,  502, 103, 1),
(8,  502, 105, 1),
(9,  502, 111, 1),
(10, 503, 102, 1),
(11, 503, 107, 1),
(12, 504, 101, 1),
(13, 504, 103, 1),
(14, 504, 108, 1),
(15, 504, 112, 1),
(16, 505, 102, 1),
(17, 505, 107, 1),
(18, 505, 109, 1),
(19, 506, 103, 1),
(20, 506, 108, 1),
(21, 506, 110, 1),
(22, 506, 112, 1),
(23, 507, 101, 1),
(24, 507, 105, 1),
(25, 507, 106, 1),
(26, 508, 106, 1),
(27, 508, 110, 1),
(28, 509, 105, 1),
(29, 509, 107, 1),
(30, 510, 101, 1),
(31, 510, 106, 1),
(32, 510, 108, 1),
(33, 511, 102, 1),
(34, 511, 103, 1),
(35, 511, 109, 1),
(36, 511, 112, 1),
(37, 512, 101, 1),
(38, 512, 104, 1),
(39, 512, 110, 1),
(40, 513, 102, 1),
(41, 513, 108, 1),
(42, 514, 101, 1),
(43, 514, 104, 1),
(44, 514, 106, 1),
(45, 515, 102, 1),
(46, 515, 104, 1),
(47, 515, 107, 1),
(48, 516, 101, 1),
(49, 516, 103, 1),
(50, 517, 106, 1),
(51, 517, 108, 1),
(52, 518, 103, 1),
(53, 518, 107, 1),
(54, 518, 109, 1),
(55, 519, 101, 1),
(56, 519, 102, 1),
(57, 519, 110, 1),
(58, 520, 104, 1),
(59, 520, 109, 1),
(60, 521, 102, 1),
(61, 521, 104, 1),
(62, 522, 103, 1),
(63, 522, 111, 1),
(64, 523, 104, 1),
(65, 523, 108, 1),
(66, 523, 112, 1),
(67, 524, 101, 1),
(68, 524, 105, 1),
(69, 524, 109, 1),
(70, 525, 102, 1),
(71, 525, 104, 1),
(72, 525, 107, 1),
(73, 525, 111, 1);

-- ─── REPLIES ──────────────────────────────────────────────────────────────────
INSERT INTO replies (reply_id, post_id, account_id, body, created_date) VALUES
(1,  501, 102, 'Welcome to the platform, Alice!',                              '2023-01-01 13:00:00'),
(2,  501, 104, 'Great to have you here!',                                      '2023-01-01 14:00:00'),
(3,  502, 101, 'Great tip, very helpful.',                                     '2023-01-11 09:00:00'),
(4,  502, 104, 'Would add: always use parameterized queries to avoid SQLi.',   '2023-01-11 10:00:00'),
(5,  502, 105, 'GraphQL changes some of these assumptions too.',               '2023-01-11 11:00:00'),
(6,  503, 101, 'Because shorter wavelengths scatter more! Love this stuff.',   '2023-02-21 09:00:00'),
(7,  504, 101, 'This blew my mind when I first read about it.',                '2023-02-16 11:00:00'),
(8,  504, 103, 'Does time stop at the event horizon? Still confused on that.', '2023-02-16 12:00:00'),
(9,  504, 112, 'Technically time dilates massively, not stops. Great post!',   '2023-02-17 08:00:00'),
(10, 505, 109, 'Zone 2 cardio changed my running. Totally agree.',             '2023-03-06 07:30:00'),
(11, 506, 101, 'Trying this weekend. Any tonkotsu vs shoyu recommendation?',   '2023-03-13 19:00:00'),
(12, 506, 103, 'Add a soft boiled egg and some nori. Game changer.',           '2023-03-13 20:00:00'),
(13, 507, 101, 'Shimokitazawa is such a vibe. Good call ending there.',        '2023-03-19 10:00:00'),
(14, 507, 103, 'Which neighborhood had the best food?',                        '2023-03-19 11:00:00'),
(15, 508, 104, 'Project Hail Mary is incredible. Weir at his best.',           '2023-04-04 12:00:00'),
(16, 508, 112, 'Piranesi is so strange and beautiful. Hope you enjoy it.',     '2023-04-04 13:00:00'),
(17, 509, 105, 'Bold prediction. I like it.',                                  '2023-04-13 21:00:00'),
(18, 510, 103, 'Foreground subjects are so underrated. Great advice.',         '2023-04-23 18:00:00'),
(19, 511, 103, 'Disco Elysium is the greatest of all time, full stop.',        '2023-05-03 15:00:00'),
(20, 511, 108, 'Planescape Torment deserves a mention for legacy.',            '2023-05-03 16:00:00'),
(21, 512, 101, 'Illinois might be my most listened album ever.',               '2023-05-17 13:00:00'),
(22, 512, 105, 'Adding Bon Iver For Emma to this list.',                       '2023-05-17 14:00:00'),
(23, 513, 109, 'Coherence was shot in one night with no script. Insane.',      '2023-05-21 11:00:00'),
(24, 514, 103, 'tRPC is also worth looking at if you are TypeScript heavy.',   '2023-05-26 10:00:00'),
(25, 518, 101, 'Just attempted this. My starter is finally active enough!',    '2023-06-21 08:30:00'),
(26, 520, 101, 'Meditations alongside Epictetus Discourses is a great combo.', '2023-07-02 10:00:00'),
(27, 524, 102, 'The ending still hits me every single rewatch.',               '2023-07-21 17:00:00'),
(28, 525, 103, 'Happy six months! This place is better with you in it.',       '2023-07-01 11:00:00');

-- ─── BLOCKS ───────────────────────────────────────────────────────────────────
INSERT INTO blocks (block_id, from_id, to_id) VALUES
(1, 109, 112),
(2, 112, 109),
(3, 107, 111);

-- ─── PASSWORDS ────────────────────────────────────────────────────────────────
INSERT INTO passwords (password_id, account_id, secure_password) VALUES
(1,  101, '$2b$12$KIX1hashed_alice'),
(2,  102, '$2b$12$KIX1hashed_bobby'),
(3,  103, '$2b$12$KIX1hashed_chuck'),
(4,  104, '$2b$12$KIX1hashed_diana'),
(5,  105, '$2b$12$KIX1hashed_ethan'),
(6,  106, '$2b$12$KIX1hashed_fiona'),
(7,  107, '$2b$12$KIX1hashed_georg'),
(8,  108, '$2b$12$KIX1hashed_hanna'),
(9,  109, '$2b$12$KIX1hashed_ivan_'),
(10, 110, '$2b$12$KIX1hashed_julia'),
(11, 111, '$2b$12$KIX1hashed_kevin'),
(12, 112, '$2b$12$KIX1hashed_laura');