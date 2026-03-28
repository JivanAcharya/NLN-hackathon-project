# Mental Health Chatbot - Backend

A FastAPI backend for the Mental Health Support Chatbot.

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**

```powershell
.\venv\Scripts\activate
```

**macOS/Linux:**

```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the backend directory with:

```env
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
HASHING_ALGORITHM=HS256
```

### 5. Run the Application

```bash
python start.py
```

The server will start at `http://localhost:8000`

## API Documentation

Once running, access the API docs at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
