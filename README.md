# Edge Study Buddy — Cloudflare AI Agent

This project is an AI-powered study assistant built using **Cloudflare Workers**, **Workers AI**, **Durable Objects**, and the **Agents SDK**.  
It is designed for the Cloudflare Software Engineering Internship assignment (cf_ai\_ prefix requirement).

The agent provides:

✅ Real-time chat using Workers & Durable Objects  
✅ Persistent memory (study profile + tasks)  
✅ AI-powered reasoning using **Llama 3.3 70B on Workers AI**  
✅ Tools for storing structured data  
✅ Scheduled reminders using agent scheduling  
✅ Fully serverless architecture running at the edge  

---

## 🚀 Features

### **1. Study Profile Memory**
The agent saves:
- name  
- long-term study goals  
- preferred study schedule  

Example:
My name is Marcus and I want to prepare for a Java internship.

### **2. Task Management**
The agent can:
- add study tasks  
- list tasks  
- store tasks persistently in the Agent’s state  

Example:
Add a study task: review Java OOP concepts tomorrow.
List my study tasks.

### **3. Scheduled Study Reminders**
Using `agent.schedule()` + Durable Objects, the chatbot can trigger future messages.

Example:
Schedule a study reminder in 20 seconds: "Start your Java practice!"
After 20 seconds, the agent automatically sends:
Running scheduled task: Reminder: Start your Java practice!


### **4. Edge-Optimized Real-Time UI**
The frontend (Vite + React):
- streams tokens live  
- renders tool calls  
- displays scheduling events  
- saves connection state  
---

## 🛠 Installation

### **1. Clone the repository**

### **2. Install dependencies**

### **3. Run Locally (npm start)**

- http://localhost:5173/
