import sqlite3
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path

DB_PATH = Path("custom_database.db")
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


@app.get("/posts")
async def get_posts():
    query = """
        SELECT *
        FROM post p
        JOIN user u ON p.user_id = u.id
        ORDER BY p.created_at DESC
    """
    return run_query(query)


@app.get("/posts/{username}")
async def get_posts_by_user(username: str):
    query = """
        SELECT *
        FROM post p
        JOIN user u ON p.user_id = u.id
        WHERE u.display_name = ?
        ORDER BY p.created_at DESC
    """
    return run_query(query, (username,))


@app.post("/posts")
async def create_post(post: PostCreate):
    user_query = "SELECT id FROM user WHERE display_name = ?"
    user_result = run_query(user_query, (post.username,))
    
    if not user_result:
        insert_user_query = "INSERT INTO user (display_name) VALUES (?)"
        run_query(insert_user_query, (post.username,))
        
        user_result = run_query(user_query, (post.username,))
    
    user_id = user_result[0]["id"]
    
    insert_post_query = "INSERT INTO post (user_id, content) VALUES (?, ?)"
    run_query(insert_post_query, (user_id, post.content))
    
    return {
        "status": "success", 
        "message": f"Post created for {post.username}",
        "user_created": not user_result
    }


app.mount("/", StaticFiles(directory="static", html=True), name="static")
