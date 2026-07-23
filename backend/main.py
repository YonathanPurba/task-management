from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
import os
import google.generativeai as genai

import models, schemas, crud, auth, database

# Inisialisasi DB (bisa juga pakai alembic di produksi)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Task Management API")

# Konfigurasi CORS agar Next.js bisa call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # di produksi harus spesifik domain Next.js
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency injection DB
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except auth.JWTError:
        raise credentials_exception
    user = crud.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

@app.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, form_data.username)
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Users endpoint
@app.get("/users", response_model=list[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

# Tasks endpoints
@app.get("/tasks", response_model=list[schemas.Task])
def read_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tasks = crud.get_tasks(db, skip=skip, limit=limit)
    return tasks

@app.post("/tasks", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_task(db=db, task=task)

@app.put("/tasks/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, task: schemas.TaskUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_task = crud.update_task(db, task_id, task)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_task = crud.delete_task(db, task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}

from dotenv import load_dotenv
import os

# Memastikan dotenv selalu membaca dari folder yang sama dengan main.py
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)

@app.post("/chat", response_model=schemas.ChatResponse)
def chat_with_bot(req: schemas.ChatRequest, db: Session = Depends(get_db)):
    if not GEMINI_API_KEY:
        return schemas.ChatResponse(reply="Sistem: GEMINI_API_KEY belum dikonfigurasi di environment.")
    
    # Ambil semua task untuk konteks
    tasks = crud.get_tasks(db, skip=0, limit=100)
    
    # Format data task menjadi string untuk prompt context
    task_context = "Data Task Saat Ini:\n"
    for t in tasks:
        assignee_name = t.assignee.name if t.assignee else "Tidak ada"
        task_context += f"- ID: {t.id}, Judul: '{t.title}', Status: '{t.status}', Deadline: '{t.deadline}', Assignee: '{assignee_name}'\n"
    
    prompt = f"""
Kamu adalah asisten AI untuk aplikasi Task Management.
Tugas kamu adalah menjawab pertanyaan user terkait data task berikut.
Jawab dengan ramah, singkat, dan jelas. Jika pertanyaan di luar konteks data, berikan jawaban sopan bahwa kamu hanya bisa menjawab soal task.

{task_context}

Pertanyaan User: {req.message}
"""
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content(prompt)
        return schemas.ChatResponse(reply=response.text)
    except Exception as e:
        return schemas.ChatResponse(reply=f"Maaf, terjadi kesalahan saat menghubungi AI: {str(e)}")
