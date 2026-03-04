DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS mentions;
DROP TABLE IF EXISTS blocks;
DROP TABLE IF EXISTS replies;
DROP TABLE IF EXISTS follows;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE TABLE accounts (
    account_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    username TEXT UNIQUE NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_private BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE follows (
    follow_id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_account_id INTEGER NOT NULL,
    followee_account_id INTEGER NOT NULL,
    followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    FOREIGN KEY (followee_account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    UNIQUE(follower_account_id, followee_account_id)
);

CREATE TABLE posts (
    post_id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

CREATE TABLE replies (
    reply_id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

CREATE TABLE blocks (
    block_id INTEGER PRIMARY KEY AUTOINCREMENT,
    blocker_account_id INTEGER NOT NULL,
    blocked_account_id INTEGER NOT NULL,
    blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blocker_account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    UNIQUE(blocker_account_id, blocked_account_id)
);

CREATE TABLE likes (
    like_id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    UNIQUE(account_id, post_id)
);

CREATE TABLE mentions (
    mention_id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    mentioned_account_id INTEGER NOT NULL,
    notified BOOLEAN DEFAULT 0,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (mentioned_account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    UNIQUE(post_id, mentioned_account_id)
);

CREATE INDEX idx_posts_account ON posts(account_id, created_at);
CREATE INDEX idx_follows_follower ON follows(follower_account_id);
CREATE INDEX idx_follows_followee ON follows(followee_account_id);
CREATE INDEX idx_likes_post ON likes(post_id);
CREATE INDEX idx_likes_account ON likes(account_id);
CREATE INDEX idx_mentions_account ON mentions(mentioned_account_id);
CREATE INDEX idx_blocks_blocker ON blocks(blocker_account_id);
CREATE INDEX idx_blocks_blocked ON blocks(blocked_account_id);
CREATE INDEX idx_replies_post ON replies(post_id);
