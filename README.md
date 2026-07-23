# Simple Task Management App

Aplikasi Task Management sederhana namun lengkap untuk mengelola tugas harian secara lebih terstruktur. Project ini dibuat sebagai bagian dari **Technical Test Fullstack Developer Intern** di **PT Moonlay Technologies**.

## Fitur utama

* **Login dengan JWT** — autentikasi aman menggunakan token JWT, dengan password yang di-hash menggunakan bcrypt.
* **CRUD task lengkap** — tambah, lihat, edit, dan hapus task yang langsung tersimpan di PostgreSQL.
* **Manajemen status** — ubah status task dengan mudah: **Todo**, **In Progress**, atau **Done**.
* **Assign task ke user lain** — pilih assignee dari data user yang tersedia di database.
* **AI Smart Assistant (bonus)** — chatbot berbasis Google Gemini AI yang dapat membantu menjawab pertanyaan terkait daftar task.
* **UI responsif** — tampilan modern dan ringan menggunakan Next.js App Router dan Tailwind CSS.

## Tech stack

| Bagian         | Teknologi                       |
| -------------- | ------------------------------- |
| Frontend       | Next.js 16, React, Tailwind CSS |
| Backend        | FastAPI, Python                 |
| Database       | PostgreSQL, SQLAlchemy          |
| Authentication | JWT, Passlib (bcrypt)           |
| AI Integration | Google Gemini AI                |

## Cara menjalankan project

Pastikan sudah terinstall:

* Node.js v18+
* Python v3.10+
* PostgreSQL

### Konfigurasi database

1. Buat database baru dengan nama **task_management**.
2. Sesuaikan koneksi database di file **backend/database.py** jika username, password, atau port PostgreSQL berbeda.

### Menjalankan backend

Masuk ke folder backend:

```bash
cd backend
```

Buat dan aktifkan virtual environment:

```bash
python -m venv venv
```

Windows:

```bash
.\venv\Scripts\activate
```

macOS/Linux:



```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Inisialisasi database dan akun default:

```bash
python init_db.py
```

Jalankan server FastAPI:

```bash
uvicorn main:app --reload
```

Backend akan berjalan di:

```text
http://localhost:8000
```

Dokumentasi API otomatis tersedia di:

```text
http://localhost:8000/docs
```

### Menjalankan frontend

Buka terminal baru, lalu masuk ke folder frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Build aplikasi:

```bash
npm run build
```

Jalankan production server:

```bash
npm run start
```

Frontend dapat diakses di:

```text
http://localhost:3000
```

## Akun default

Gunakan salah satu akun berikut untuk login:

| Username | Password    |
| -------- | ----------- |
| admin    | password123 |
| john     | password123 |
| jane     | password123 |

## Konfigurasi AI Chatbot

Untuk mengaktifkan fitur AI Smart Assistant:

1. Dapatkan API Key dari Google AI Studio.
2. Salin file **.env.example** menjadi **.env** di folder backend.
3. Tambahkan API Key berikut:

```env
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

4. Restart server backend.

File **.env** sudah diabaikan oleh Git melalui **.gitignore**, sehingga API Key tidak akan ikut ter-upload ke repository.

### Cara Kerja AI Chatbot

Chatbot ini dirancang secara spesifik menggunakan pendekatan **Context-Aware Prompting**. Ketika Anda mengetik pertanyaan:
1. **Ambil Data:** Backend (FastAPI) akan membaca seluruh daftar task terbaru Anda langsung dari database PostgreSQL.
2. **Injeksi Konteks:** Seluruh data task tersebut diformat dan disisipkan (injeksi) ke dalam *System Prompt* bersama dengan instruksi ketat untuk AI.
3. **Proses AI:** Prompt utuh tersebut dikirimkan ke API Google Gemini.
4. **Respon Akurat:** Gemini AI akan menjawab pertanyaan Anda dengan cerdas, akurat, dan sangat spesifik karena ia mengetahui secara *real-time* apa saja tugas Anda, statusnya, hingga siapa *assignee*-nya.

## Struktur project

```text
backend/
├── main.py          # Routing dan endpoint API
├── models.py        # Model database SQLAlchemy
├── schemas.py       # Validasi request/response
├── crud.py          # Operasi database
├── auth.py          # JWT dan password hashing
└── init_db.py       # Inisialisasi database

frontend/
├── app/             # Next.js App Router
├── components/      # Komponen UI
└── public/          # Asset statis

docs/
├── postman_collection.json
└── erd.png
```

## Dokumentasi tambahan

* **Postman Collection** tersedia di folder **docs/** untuk memudahkan pengujian API.
* **ERD (Entity Relationship Diagram)** juga tersedia di folder **docs/** untuk melihat struktur database.
