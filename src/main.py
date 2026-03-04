import sqlite3
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from social_lib import SocialNetwork

DB_PATH = Path("database.db")
app = FastAPI(title="Social Network API", version="1.0.0")
sn = SocialNetwork(DB_PATH)


class UserCreate(BaseModel):
    email: EmailStr
    display_name: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    display_name: Optional[str]
    created_at: str
    last_login: Optional[str]
    account_count: int


class AccountCreate(BaseModel):
    user_id: int


@app.get("/posts")
async def get_posts():
    return sn.list_posts()


@app.get("/posts/{username}")
async def get_posts_by_username(username: str):
    account = sn.get_account_by_username(username)
    if not account:
        raise HTTPException(status_code=404, detail="User not found")
    return sn.list_posts(account_id=account['account_id'])


app.mount("/", StaticFiles(directory="static", html=True), name="static")
