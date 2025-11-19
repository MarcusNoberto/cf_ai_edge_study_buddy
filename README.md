# cf_ai_edge_study_buddy

AI-powered **Study Buddy** built on top of **Cloudflare Agents**, **Workers AI** and **Durable Objects**.

The agent helps users:
- define and store their study profile (goals, preferred schedule),
- create and track study tasks,
- list and mark tasks as done,
- schedule future reminders using Cloudflare's scheduling capabilities.

This project was built for the Cloudflare AI internship optional assignment.

---

## Architecture

- **LLM**: `@cf/meta/llama-3.3-70b-instruct-fp8-fast` on Workers AI.
- **Agent Runtime**: Cloudflare Agents SDK running on Durable Objects.
- **Workflow / Coordination**:
  - Tools for adding/listing tasks and saving the study profile.
  - Scheduling tool to create future reminders (Agent `schedule` + `onTask`).
- **State / Memory**:
  - Study profile and tasks are stored in the Agent state (`setState` / `getState`).
- **User Input**:
  - React-based chat UI using WebSockets (from `agents-starter` template).

---

## Prerequisites

- Node.js (LTS)
- npm
- Git
- Cloudflare account with Workers & Workers AI enabled
- `wrangler` CLI

---

## Getting Started

### 1. Clone this repository

```bash
git clone https://github.com/SEU_USUARIO/cf_ai_edge_study_buddy.git
cd cf_ai_edge_study_buddy


How it works (high level)

The React front-end (from the agents-starter template) connects to the Agent via WebSockets.

Each message you send is forwarded to the StudyBuddyAgent on the server.

The Agent calls Workers AI using the workers-ai-provider and the Llama 3.3 model.

The Agent exposes tools (saveStudyProfile, addStudyTask, listStudyTasks, scheduleStudyReminder).

The model can call these tools to persist state in the Agent (study profile, tasks, reminders).

The Agent uses Cloudflare's scheduling to trigger reminders in the future, updating state again.