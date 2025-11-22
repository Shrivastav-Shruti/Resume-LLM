# 🎯 AI-Powered Resume Screening Tool

> Intelligent resume screening with RAG (Retrieval-Augmented Generation) for smart candidate matching and conversational Q&A

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Demo](#-demo)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

An AI-powered resume screening tool that helps recruiters and hiring managers efficiently evaluate candidates. Upload a resume and job description, get instant AI-powered match analysis, and chat with an intelligent assistant about the candidate.

### Why This Tool?

- **⚡ Fast**: Get match scores in 3-5 seconds
- **💰 Cost-Effective**: Free local embeddings, only pay for LLM usage
- **🎯 Accurate**: RAG-based context retrieval for relevant answers
- **💬 Interactive**: ChatGPT-like interface for follow-up questions
- **🔒 Private**: Data processed locally, no external API for embeddings

---

## ✨ Features

### 🎯 Smart Matching
- **AI-Powered Scoring**: Get 0-100% match score
- **Detailed Analysis**: View strengths, gaps, and key insights
- **Instant Results**: Analysis in 3-5 seconds

### 💬 Conversational AI
- **ChatGPT-like Interface**: Natural conversation flow
- **Context Preservation**: Ask follow-up questions
- **Session History**: All conversations saved
- **RAG-Powered**: Retrieves relevant resume sections

### 📄 Document Processing
- **PDF & TXT Support**: Upload any format
- **Automatic Parsing**: Extract skills, experience, education
- **Vector Storage**: Efficient similarity search

### 🎨 Modern UI
- **Single Page Upload**: Upload + results on one screen
- **Sidebar History**: View all conversations
- **Responsive Design**: Works on all devices
- **Clean Interface**: Professional, intuitive design

---

## 🎬 Demo

### Upload & Match
```
1. Upload resume (PDF/TXT)
2. Upload job description (PDF/TXT)
3. Click "Analyze Match"
4. View instant results with score, strengths, gaps, insights
```

### Chat Interface
```
1. Ask: "What are the candidate's key skills?"
2. AI: "The candidate has strong skills in React, Node.js..."
3. Ask: "How many years of experience?"
4. AI: "Based on the resume, they have 5 years..."
```

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **LLM**: Groq (llama-3.3-70b-versatile)
- **Embeddings**: Transformers.js (all-MiniLM-L6-v2) - **FREE & LOCAL**
- **Vector DB**: Pinecone
- **PDF Parser**: pdf-parse

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Router**: React Router v6
- **HTTP Client**: Axios
- **Styling**: CSS

### Key Libraries
```json
{
  "backend": {
    "@pinecone-database/pinecone": "^6.1.3",
    "@xenova/transformers": "^2.x.x",
    "groq-sdk": "^0.36.0",
    "express": "^4.18.2",
    "pdf-parse": "^1.1.1"
  },
  "frontend": {
    "react": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2"
  }
}
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  ┌──────────────┐         ┌──────────────┐             │
│  │  Home Page   │         │  Chat Page   │             │
│  │ Upload+Match │         │ ChatGPT UI   │             │
│  └──────────────┘         └──────────────┘             │
└────────────────────┬────────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────────┐
│                Express Backend                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Upload  │  │  Match   │  │   Chat   │             │
│  │  Routes  │  │  Routes  │  │  Routes  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   PDF    │  │Embedding │  │ VectorDB │             │
│  │ Service  │  │ Service  │  │ Service  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└────────────────────┬───────────────┬────────────────────┘
                     │               │
         ┌───────────▼──┐      ┌────▼──────────┐
         │   Groq API   │      │   Pinecone    │
         │  (LLM Chat)  │      │  (Vectors)    │
         └──────────────┘      └───────────────┘
                                       │
                               ┌───────▼────────┐
                               │Local Embeddings│
                               │ Transformers.js│
                               └────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Groq API key ([Get free key](https://console.groq.com))
- Pinecone account ([Sign up free](https://www.pinecone.io))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Shrivastav-Shruti/Resume-LLM.git
cd Resume-LLM
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
```

3. **Configure Environment Variables**

Edit `backend/.env`:
```env
PORT=3001
NODE_ENV=development

# Groq API (for chat completions)
GROQ_API_KEY=your_groq_api_key_here

# Pinecone (vector database)
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=project

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

4. **Setup Pinecone Index**
- Go to [Pinecone Console](https://app.pinecone.io)
- Create a new index:
  - **Name**: `project`
  - **Dimensions**: `1024`
  - **Metric**: `cosine`

5. **Setup Frontend**
```bash
cd ../frontend
npm install
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
```

6. **Start Development Servers**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

7. **Open Application**
```
http://localhost:3000
```

---

## 📖 Usage

### 1. Upload & Analyze

1. **Upload Resume**: Click "Choose File" and select a PDF or TXT resume
2. **Upload Job Description**: Click "Choose File" and select a PDF or TXT job description
3. **Analyze**: Click "Analyze Match" button
4. **View Results**: See match score, strengths, gaps, and insights

### 2. Chat with AI

1. **Navigate to Chat**: Click "Ask Questions About This Candidate"
2. **Ask Questions**: Type your question in the input box
3. **Get Answers**: AI responds with context from the resume
4. **Follow-up**: Ask follow-up questions naturally

### 3. Manage Data

**Clear All Data**:
- Home Page: Click "🗑️ Clear All Data" button
- Chat Page: Click "⚙️ Settings" → "🗑️ Clear All Vector Data"

**Start New Conversation**:
- Chat Page: Click "+ New Chat" button

---

## 📡 API Documentation

### Upload Endpoints

```bash
# Upload resume
POST /api/upload/resume
Content-Type: multipart/form-data
Body: file (PDF/TXT)

# Upload job description
POST /api/upload/job-description
Content-Type: multipart/form-data
Body: file (PDF/TXT)

# Get resume details
GET /api/upload/resume/:id

# Delete all data
DELETE /api/upload/all
```

### Match Endpoint

```bash
# Calculate match score
POST /api/match/score
Content-Type: application/json
Body: {
  "resumeText": "...",
  "jobDescriptionText": "...",
  "resumeId": "...",
  "jobDescriptionId": "..."
}
```

### Chat Endpoints

```bash
# Send message
POST /api/chat
Content-Type: application/json
Body: {
  "message": "What are the candidate's skills?",
  "sessionId": "session-123",
  "resumeId": "resume-id"
}

# Get chat history
GET /api/chat/history/:sessionId

# Get all sessions
GET /api/chat/sessions

# Delete session
DELETE /api/chat/session/:sessionId
```

For complete API documentation, see [ARCHITECTURE_FINAL.md](./ARCHITECTURE_FINAL.md)

---

## 🚢 Deployment

### Backend Deployment (Railway/Render)

1. **Connect GitHub Repository**
2. **Set Environment Variables**:
   ```
   GROQ_API_KEY=your_key
   PINECONE_API_KEY=your_key
   PINECONE_INDEX=project
   PORT=3001
   NODE_ENV=production
   ```
3. **Build Command**: `cd backend && npm install && npm run build`
4. **Start Command**: `cd backend && npm start`

### Frontend Deployment (Vercel/Netlify)

1. **Connect GitHub Repository**
2. **Set Build Settings**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Set Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```

---

## 💡 Key Features Explained

### 🆓 Free Local Embeddings

Unlike other solutions that use expensive OpenAI embeddings, this tool uses **Transformers.js** to generate embeddings locally:

- **Cost**: $0 (completely free)
- **Speed**: 2-5x faster than API calls
- **Privacy**: Data never leaves your server
- **Model**: all-MiniLM-L6-v2 (384 dims → padded to 1024)

### 🤖 Smart RAG Implementation

Retrieval-Augmented Generation ensures accurate responses:

1. **Query Embedding**: Convert question to vector
2. **Similarity Search**: Find top 3 relevant resume sections
3. **Context Building**: Combine with chat history
4. **LLM Generation**: Generate answer with context

### 💬 ChatGPT-like Experience

- **Sidebar**: View all conversations
- **Session Management**: Switch between chats
- **Context Preservation**: Follow-up questions work
- **Auto-generated Titles**: From first message
- **Message History**: Last 50 messages per session

---

## 📊 Performance

- **Upload + Match**: 3-5 seconds
- **Chat Response**: 1-2 seconds
- **Embedding Generation**: 50-100ms (local)
- **Vector Search**: 100-200ms (Pinecone)

---

## 🔒 Security

- ✅ File type validation (PDF/TXT only)
- ✅ File size limits (10MB max)
- ✅ Environment variables for secrets
- ✅ CORS configuration
- ✅ Error handling without info leakage
- ✅ Input sanitization

---

## 🗂️ Project Structure

```
Resume-LLM/
├── backend/                 # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   └── server.ts       # Entry point
│   └── package.json
│
├── frontend/                # React 18 + TypeScript
│   ├── src/
│   │   ├── pages/          # Route pages
│   │   ├── components/     # UI components
│   │   ├── api/            # API client
│   │   └── utils/          # Utilities
│   └── package.json
│
├── shared/                  # Shared TypeScript types
│   └── types.ts
│
├── README.md               # This file
├── ARCHITECTURE_FINAL.md   # Complete documentation
└── LICENSE                 # MIT License
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Groq](https://groq.com/) - Fast LLM inference
- [Pinecone](https://www.pinecone.io/) - Vector database
- [Transformers.js](https://huggingface.co/docs/transformers.js) - Local embeddings
- [React](https://react.dev/) - Frontend framework
- [Express.js](https://expressjs.com/) - Backend framework

---

## 📧 Contact

**Shruti Shrivastav**

- GitHub: [@Shrivastav-Shruti](https://github.com/Shrivastav-Shruti)
- Project Link: [https://github.com/Shrivastav-Shruti/Resume-LLM](https://github.com/Shrivastav-Shruti/Resume-LLM)

---

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

---

<div align="center">

**Made with ❤️ by Shruti Shrivastav**

[⬆ Back to Top](#-ai-powered-resume-screening-tool)

</div>
