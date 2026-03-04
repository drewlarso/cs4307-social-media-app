import sqlite3
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path

DB_PATH = Path("database.db")


app = FastAPI()


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@app.get("/users")
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM User")
    rows = cursor.fetchall()
    conn.close()

    return [{"id": row["id"], "email": row["email"]} for row in rows]


app.mount("/", StaticFiles(directory="static", html=True), name="static")
