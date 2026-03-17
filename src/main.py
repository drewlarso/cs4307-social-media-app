import sqlite3
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from pydantic import BaseModel

DB_PATH = Path("database.db")
app = FastAPI(title="Social Network API", version="1.0.0")


class PostCreate(BaseModel):
    username: str
    content: str


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
        SELECT 
            p.post_id as id,
            a.username as display_name,
            a.username,
            p.body as content,
            p.created_date as created_at
        FROM posts p
        JOIN accounts a ON p.account_id = a.account_id
        ORDER BY p.created_date DESC
    """
    return run_query(query)


@app.get("/posts/{username}")
async def get_posts_by_user(username: str):
    query = """
        SELECT 
            p.post_id as id,
            a.username as display_name,
            a.username,
            p.body as content,
            p.created_date as created_at
        FROM posts p
        JOIN accounts a ON p.account_id = a.account_id
        WHERE a.username = ?
        ORDER BY p.created_date DESC
    """
    return run_query(query, (username,))


@app.post("/posts")
async def create_post(post: PostCreate):
    account_query = "SELECT account_id FROM accounts WHERE username = ?"
    account_result = run_query(account_query, (post.username,))
    
    if not account_result:
        insert_person_query = "INSERT INTO people (name, email) VALUES (?, ?)"
        run_query(insert_person_query, (post.username, f"{post.username}@example.com"))
        
        person_query = "SELECT person_id FROM people WHERE name = ?"
        person_result = run_query(person_query, (post.username,))
        person_id = person_result[0]["person_id"]
        
        insert_account_query = """
            INSERT INTO accounts (person_id, username, created_date) 
            VALUES (?, ?, CURRENT_TIMESTAMP)
        """
        run_query(insert_account_query, (person_id, post.username))
        
        account_result = run_query(account_query, (post.username,))
    
    account_id = account_result[0]["account_id"]
    
    insert_post_query = """
        INSERT INTO posts (account_id, body, created_date, title) 
        VALUES (?, ?, CURRENT_TIMESTAMP, 'New Post')
    """
    run_query(insert_post_query, (account_id, post.content))
    
    return {
        "status": "success",
        "message": f"Post created for {post.username}"
    }


app.mount("/", StaticFiles(directory="static", html=True), name="static")
