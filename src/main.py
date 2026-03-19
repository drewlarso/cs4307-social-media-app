import sqlite3
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from pathlib import Path


DB_PATH = Path("database.db")
app = FastAPI(title="Social Network API", version="1.0.0")


def run_query(query: str, params: tuple = ()) -> list:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(query, params)
    conn.commit()
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


##### START GETS #####


@app.get("/posts")
async def get_posts(viewer_id: int | None = None):
    query = """
        SELECT *
        FROM posts p
        JOIN accounts a ON p.account_id = a.account_id
        WHERE (? IS NULL OR p.account_id NOT IN (
            SELECT to_id FROM blocks WHERE from_id = ?
        ))
        ORDER BY p.created_date DESC
    """
    return run_query(query, (viewer_id, viewer_id))


@app.get("/posts/{username}")
async def get_posts_by_user(username: str, viewer_id: int | None = None):
    query = """
        SELECT *
        FROM posts p
        JOIN accounts a ON p.account_id = a.account_id
        WHERE a.username = ?
        AND (? IS NULL OR p.account_id NOT IN (
            SELECT to_id FROM blocks WHERE from_id = ?
        ))
        ORDER BY p.created_date DESC
    """
    return run_query(query, (username, viewer_id, viewer_id))


@app.get("/accounts/{account_id}/feed")
async def get_account_feed(account_id: int):
    query = """
        SELECT *
        FROM posts p
        JOIN accounts a ON p.account_id = a.account_id
        WHERE (p.account_id = ? 
           OR p.account_id IN (
               SELECT to_id 
               FROM follows 
               WHERE from_id = ?
           ))
           AND p.account_id NOT IN (
               SELECT to_id FROM blocks WHERE from_id = ?
           )
        ORDER BY p.created_date DESC
    """
    return run_query(query, (account_id, account_id, account_id))


@app.get("/accounts")
async def get_accounts():
    query = """
        SELECT *
        FROM accounts
    """
    return run_query(query)


@app.get("/people")
async def get_people():
    query = """
        SELECT *
        FROM people
    """
    return run_query(query)


@app.get("/follows/{account_id}")
async def get_follows(account_id: int):
    query = """
        SELECT a.account_id
        FROM follows f
        JOIN accounts a ON f.to_id = a.account_id
        WHERE f.from_id = ?
    """
    return run_query(query, (account_id,))  # the comma in the tuple is required for some reason...


@app.get("/accounts/{account_id}/followers")
async def get_followers(account_id: int):
    query = """
        SELECT a.account_id, a.username
        FROM follows f
        JOIN accounts a ON f.from_id = a.account_id
        WHERE f.to_id = ?
    """
    return run_query(query, (account_id,))


@app.get("/accounts/{account_id}/following")
async def get_following(account_id: int):
    query = """
        SELECT a.account_id, a.username
        FROM follows f
        JOIN accounts a ON f.to_id = a.account_id
        WHERE f.from_id = ?
    """
    return run_query(query, (account_id,))


@app.get("/accounts/{account_id}/is-following")
async def is_following(account_id: int, target_id: int):
    query = """
        SELECT COUNT(*) as count
        FROM follows
        WHERE from_id = ? AND to_id = ?
    """
    result = run_query(query, (account_id, target_id))
    return {"following": result[0]["count"] > 0}


@app.get("/accounts/{account_id}/is-blocking")
async def is_blocking(account_id: int, target_id: int):
    query = """
        SELECT COUNT(*) as count
        FROM blocks
        WHERE from_id = ? AND to_id = ?
    """
    result = run_query(query, (account_id, target_id))
    return {"blocking": result[0]["count"] > 0}


@app.get("/blocks/{account_id}")
async def get_blocked_users(account_id: int):
    query = """
        SELECT a.account_id, a.username
        FROM blocks b
        JOIN accounts a ON b.to_id = a.account_id
        WHERE b.from_id = ?
    """
    return run_query(query, (account_id,))


@app.get("/topics")
async def get_topics():
    query = """
        SELECT *
        FROM topics
        ORDER BY created_date DESC
    """
    return run_query(query)


@app.get("/topics/{topic_id}/posts")
async def get_posts_by_topic(topic_id: int, viewer_id: int | None = None):
    query = """
        SELECT *
        FROM posts p
        JOIN accounts a ON p.account_id = a.account_id
        WHERE p.topic_id = ?
        AND (? IS NULL OR p.account_id NOT IN (
            SELECT to_id FROM blocks WHERE from_id = ?
        ))
        ORDER BY p.created_date DESC
    """
    return run_query(query, (topic_id, viewer_id, viewer_id))


@app.get("/posts/{post_id}/likes")
async def get_likes_by_post(post_id: int):
    query = """
        SELECT *
        FROM likes
        WHERE post_id = ?
    """
    return run_query(query, (post_id,))


@app.get("/posts/{post_id}/replies")
async def get_replies_by_post(post_id: int, viewer_id: int | None = None):
    query = """
        SELECT r.*, a.username
        FROM replies r
        JOIN accounts a ON r.account_id = a.account_id
        WHERE r.post_id = ?
        AND (? IS NULL OR r.account_id NOT IN (
            SELECT to_id FROM blocks WHERE from_id = ?
        ))
        ORDER BY r.created_date ASC
    """
    return run_query(query, (post_id, viewer_id, viewer_id))


@app.get("/accounts/{account_id}/recommended-posts")
async def get_recommended_posts(account_id: int):
    query = """
        SELECT p.post_id AS reccomended_post_id, count() AS likes
        FROM follows AS f
        JOIN likes AS l ON f.to_id = l.account_id
        JOIN posts AS p ON l.post_id = p.post_id
        WHERE f.from_id = ?
        AND p.account_id != ?
        AND p.account_id NOT IN (SELECT to_id FROM follows WHERE from_id = ?)
        GROUP BY p.post_id
        ORDER BY likes desc;
    """
    return run_query(query, (account_id, account_id, account_id))


@app.get("/accounts/{account_id}/recommended-accounts")
async def get_recommended_posts(account_id: int):
    query = """
    SELECT p.account_id AS reccomended_accounts, count() AS likes
    FROM follows AS f
    JOIN likes AS l ON f.to_id = l.account_id
    JOIN posts AS p ON l.post_id = p.post_id
    WHERE f.from_id = ?
    AND p.account_id != ?
    AND p.account_id NOT IN(SELECT to_id FROM follows WHERE from_id=?)
    GROUP BY p.account_id
    ORDER BY likes desc;
    """
    return run_query(query, (account_id, account_id, account_id))


@app.get("/accounts/{account_id}/popular-follows")
async def get_popular_follows(account_id: int):
    query = """
        SELECT f.to_id AS followed_account, (count(DISTINCT l.like_id)*1.0)/(count(DISTINCT p.post_id)*1.0) AS ratio
        FROM follows AS f
        JOIN posts AS p on f.to_id = p.account_id
        LEFT JOIN likes AS l on p.post_id = l.post_id
        WHERE from_id = ?
        GROUP BY f.to_id
        ORDER BY ratio desc;
    """
    return run_query(query, (account_id,))


##### START INSERTS #####


@app.post("/people")
async def create_person(request: Request):
    body = await request.json()
    query = """
        INSERT INTO people (email, name, birthday)
        VALUES (?, ?, ?)
    """
    return run_query(query, (body["email"], body["name"], body["birthday"]))


@app.post("/accounts")
async def create_account(request: Request):
    body = await request.json()
    query = """
        INSERT INTO accounts (person_id, username, created_date)
        VALUES (?, ?, ?)
    """
    return run_query(query, (body["person_id"], body["username"], body["created_date"]))


@app.post("/follows")
async def create_follow_relationship(request: Request):
    body = await request.json()
    query = """
        INSERT INTO follows (from_id, to_id, created_date)
        VALUES (?, ?, ?)
    """
    return run_query(query, (body["from_id"], body["to_id"], body["created_date"]))


@app.post("/posts")
async def create_post(request: Request):
    body = await request.json()
    query = """
        INSERT INTO posts (account_id, topic_id, title, body, created_date)
        VALUES (?, ?, ?, ?, ?)
    """
    return run_query(query, (body["account_id"], body["topic_id"], body["title"], body["body"], body["created_date"]))


@app.post("/topics")
async def create_topic(request: Request):
    body = await request.json()
    query = """
        INSERT INTO topics (account_id, topic_name, description, created_date)
        VALUES (?, ?, ?, ?)
    """
    return run_query(query, (body["account_id"], body["topic_name"], body["description"], body["created_date"]))


@app.post("/likes")
async def create_like(request: Request):
    body = await request.json()
    query = """
        INSERT INTO likes (account_id, post_id, like_type)
        VALUES (?, ?, ?)
    """
    return run_query(query, (body["account_id"], body["post_id"], body["like_type"]))


@app.post("/replies")
async def create_reply(request: Request):
    body = await request.json()
    query = """
        INSERT INTO replies (account_id, post_id, body, created_date)
        VALUES (?, ?, ?, ?)
    """
    return run_query(query, (body["account_id"], body["post_id"], body["body"], body["created_date"]))


@app.post("/blocks")
async def create_block(request: Request):
    body = await request.json()
    query = """
        INSERT INTO blocks (from_id, to_id)
        VALUES (?, ?)
    """
    return run_query(query, (body["from_id"], body["to_id"]))


@app.get("/passwords")
async def get_passwords():
    query = """
        SELECT *
        FROM passwords
    """
    return run_query(query)


@app.post("/passwords")
async def create_password(request: Request):
    body = await request.json()
    query = """
        INSERT INTO passwords (account_id, secure_password)
        VALUES (?, ?)
    """
    return run_query(query, (body["account_id"], body["secure_password"]))


##### START DELETES #####

@app.delete("/people/{person_id}")
async def delete_person(person_id: int):
    return run_query("DELETE FROM people WHERE person_id = ?", (person_id,))


@app.delete("/accounts/{account_id}")
async def delete_account(account_id: int):
    return run_query("DELETE FROM accounts WHERE account_id = ?", (account_id,))


@app.delete("/follows")
async def delete_follow(request: Request):
    body = await request.json()
    return run_query("DELETE FROM follows WHERE from_id = ? AND to_id = ?", (body["from_id"], body["to_id"]))


@app.delete("/posts/{post_id}")
async def delete_post(post_id: int):
    return run_query("DELETE FROM posts WHERE post_id = ?", (post_id,))


@app.delete("/topics/{topic_id}")
async def delete_topic(topic_id: int):
    return run_query("DELETE FROM topics WHERE topic_id = ?", (topic_id,))


@app.delete("/likes")
async def delete_like(request: Request):
    body = await request.json()
    return run_query("DELETE FROM likes WHERE account_id = ? AND post_id = ?", (body["account_id"], body["post_id"]))


@app.delete("/replies/{reply_id}")
async def delete_reply(reply_id: int):
    return run_query("DELETE FROM replies WHERE reply_id = ?", (reply_id,))


@app.delete("/blocks")
async def delete_block(request: Request):
    body = await request.json()
    return run_query("DELETE FROM blocks WHERE from_id = ? AND to_id = ?", (body["from_id"], body["to_id"]))


@app.delete("/passwords/{password_id}")
async def delete_password(password_id: int):
    return run_query("DELETE FROM passwords WHERE password_id = ?", (password_id,))


##### ENABLE STATIC FOLDER #####


app.mount("/", StaticFiles(directory="static", html=True), name="static")
