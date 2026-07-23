import sys
import os
from database import SessionLocal, engine
from models import Base
from crud import create_user
from schemas import UserCreate

# Buat tabel
Base.metadata.create_all(bind=engine)

db = SessionLocal()

def init():
    # Cek apakah user sudah ada
    from crud import get_user_by_username
    if get_user_by_username(db, "admin"):
        print("Database sudah diinisialisasi.")
        return

    print("Membuat data user awal...")
    users = [
        UserCreate(username="admin", name="Administrator", password="password123"),
        UserCreate(username="john", name="John Doe", password="password123"),
        UserCreate(username="jane", name="Jane Smith", password="password123"),
    ]

    for user in users:
        create_user(db, user)
        print(f"User {user.username} dibuat.")

    print("Inisialisasi selesai!")

if __name__ == "__main__":
    init()
