# 🌐 Edge Study Buddy — Cloudflare AI Agent

**Edge Study Buddy** is an AI-powered study assistant built on  
**Cloudflare Workers**, **Workers AI**, **Durable Objects**, and the **Agents SDK**.

It demonstrates:

- LLM execution at the edge  
- Real-time WebSocket chat  
- AI tools for structured operations  
- Persistent memory powered by Durable Objects  
- Scheduling workflows  
- Full-stack Cloudflare development  

This project follows the internship assignment requirement (repo name prefixed with `cf_ai_`).

---

# ✨ Key Features

## 🧠 1. Persistent Study Profile Memory
The agent can remember:

- Your name  
- Your study goals  
- Your preferred study schedule  

**Example:**
My name is Marcus and I want to prepare for a Java internship.



## 📚 2. Study Task Management
The agent can manage your study tasks, including:

- Adding tasks

- Listing tasks

- Storing tasks persistently

- Marking them as done

**Example:**
Add a study task: review Java OOP concepts tomorrow.
List my study tasks.

## ⏰ 3. Scheduled Study Reminders
Using Cloudflare's Durable Object scheduling, the agent can trigger future messages.

**Example:**
Schedule a study reminder in 20 seconds: "Start your Java practice!"

---


# 🧱 Architecture Overview

Frontend (React + Vite + Agents SDK)
       │
       ▼
Cloudflare Worker (server.ts)
       │
       ├── LLM: Llama 3.3 70B (Workers AI)
       ├── Tools (tools.ts)
       │       ├── saveStudyProfile
       │       ├── addStudyTask
       │       ├── listStudyTasks
       │       └── scheduleStudyReminder
       │
       └── Durable Object (Agent)
                 ├── Persistent state storage
                 ├── Scheduling engine
                 └── Long-lived context

---

# 🛠️ Running

- Live Demo: https://cf-ai-edge-study-buddy.marcus-ideao.workers.dev
