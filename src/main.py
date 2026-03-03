import sqlite3
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional, List
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
   
