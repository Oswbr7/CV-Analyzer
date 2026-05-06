# 🤖 AI CV Analyzer & Recruiting Dashboard

AI-powered recruiting platform that parses PDF resumes, ranks candidates against job descriptions, and generates intelligent hiring insights.

---

## 🚀 Features

* 📄 **PDF Resume Parsing** – Extracts text from CVs automatically
* 🧠 **AI Skill Detection** – Identifies candidate skills using embeddings
* 🎯 **Job Matching System** – Compares candidates vs job requirements
* 📊 **Candidate Ranking** – Scores and ranks applicants dynamically
* 💬 **AI Insights (GPT)** – Generates recruiter-friendly summaries
* ❓ **Interview Questions Generator** – Tailored questions per candidate
* 🖥️ **Modern Dashboard UI** – Built with React + Tailwind
* 📂 **Drag & Drop Upload** – Upload multiple CVs بسهولة

---

## 🏗️ Architecture

```
React Frontend
      ↓
.NET API (C#)
      ↓
Python AI Service (FastAPI)
      ↓
Embeddings + GPT (OpenAI)
```

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* TailwindCSS
* TypeScript

### Backend

* .NET 8 (Minimal API)
* HttpClient integration

### AI Service

* Python (FastAPI)
* OpenAI API (GPT + Embeddings)
* PDF Parsing (iText / Pdf libraries)

---

## ⚙️ How to Run Locally

### 1. Clone repository

```bash
git clone https://github.com/Oswbr7/CV-Analyzer.git
cd CV-Analyzer
```

---

### 2. Run AI Service (Python)

```bash
cd ai-service-python

python -m venv venv
source venv/Scripts/activate  # Windows

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Runs on:

```
http://localhost:8000
```

---

### 3. Run Backend (.NET)

```bash
cd backend-dotnet

dotnet restore
dotnet run
```

Runs on:

```
http://localhost:5000
```

---

### 4. Run Frontend (React)

```bash
cd frontend-react

npm install
npm run dev
```

Runs on:

```
http://localhost:5173
```

---

## 🔑 Environment Variables

Create `.env` in `ai-service-python`:

```
OPENAI_API_KEY=your_api_key_here
```

---

## 📸 Demo

> (Add screenshots or GIF here)

Suggested:

* Upload PDFs
* Ranking results
* Candidate modal
* AI insights

---

## 🧠 Key Concepts Implemented

* Embeddings & semantic similarity
* Cosine similarity ranking
* Explainable AI scoring
* Retrieval-based matching
* AI-generated insights (LLM)
* Fullstack system design

---

## 📈 Future Improvements

* Export candidate reports (PDF/Excel)
* Authentication & recruiter accounts
* Multi-job tracking (ATS system)
* Real-time collaboration
* Deployment as SaaS platform

---

## 💼 Use Case

Designed as a **Recruiting Assistant Tool** to:

* Reduce CV screening time
* Improve candidate-job matching
* Provide structured hiring insights
* Assist interview preparation

---

## 🧑‍💻 Author

**Oswaldo Rodríguez**

* GitHub: https://github.com/Oswbr7

---

## ⭐ Notes

This project is part of a personal portfolio focused on:

* AI integration in real-world applications
* Fullstack development
* System design & architecture

---
