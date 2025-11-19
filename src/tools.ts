/**
 * Tools for the Study Buddy Agent (English version)
 * Implements persistent agent state for profile + study tasks.
 */

import { tool, type ToolSet } from "ai";
import { z } from "zod/v3";

import type { Chat } from "./server";
import { getCurrentAgent } from "agents";
import { scheduleSchema } from "agents/schedule";

/* ---------------------------------------------------------
 * Agent State Type
 * --------------------------------------------------------- */
export type StudyState = {
  profile?: {
    name?: string;
    goals?: string;
    preferredSchedule?: string;
  };
  tasks: {
    id: string;
    title: string;
    status: "pending" | "done";
    createdAt: string;
  }[];
};

/* Helper to ensure state */
async function getOrInitState(agent: Chat): Promise<StudyState> {
  const state =
    ((await agent.getState()) as StudyState | undefined) ?? { tasks: [] };
  if (!state.tasks) state.tasks = [];
  return state;
}

/* ---------------------------------------------------------
 * TOOL 1 — Save Study Profile
 * --------------------------------------------------------- */
const saveStudyProfile = tool({
  description: "Save or update the user's study profile.",
  inputSchema: z.object({
    name: z.string().optional(),
    goals: z.string().optional(),
    preferredSchedule: z.string().optional(),
  }),
  async execute(args) {
    const { agent } = getCurrentAgent<Chat>();

    const state = await getOrInitState(agent!);

    state.profile = {
      ...(state.profile ?? {}),
      ...args,
    };

    await agent!.setState(state);

    return `Study profile updated successfully.`;
  },
});

/* ---------------------------------------------------------
 * TOOL 2 — Add Study Task
 * --------------------------------------------------------- */
const addStudyTask = tool({
  description: "Add a new study task to the user's task list.",
  inputSchema: z.object({
    title: z.string().describe("Title of the study task."),
  }),
  async execute({ title }) {
    const { agent } = getCurrentAgent<Chat>();

    const state = await getOrInitState(agent!);

    const newTask = {
      id: crypto.randomUUID(),
      title,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
    };

    state.tasks.push(newTask);
    await agent!.setState(state);

    return `Task added: ${newTask.title}`;
  },
});

/* ---------------------------------------------------------
 * TOOL 3 — List Study Tasks
 * --------------------------------------------------------- */
const listStudyTasks = tool({
  description: "List the user's study tasks, optionally filtered by status.",
  inputSchema: z.object({
    status: z.enum(["pending", "done"]).optional(),
  }),
  async execute({ status }) {
    const { agent } = getCurrentAgent<Chat>();

    const state = await getOrInitState(agent!);

    const filtered = status
      ? state.tasks.filter((t) => t.status === status)
      : state.tasks;

    if (!filtered.length) {
      return "No tasks found.";
    }

    return filtered
      .map(
        (t) =>
          `- [${t.status === "done" ? "x" : " "}] ${t.title} (id: ${t.id})`
      )
      .join("\n");
  },
});

/* ---------------------------------------------------------
 * TOOL 4 — Schedule Reminder
 * --------------------------------------------------------- */
const scheduleStudyReminder = tool({
  description: "Schedule a study reminder to be executed in the future.",
  inputSchema: scheduleSchema.extend({
    message: z.string().describe("Reminder message."),
  }),
  async execute({ when, message }) {
    const { agent } = getCurrentAgent<Chat>();

    function error(msg: string): never {
      throw new Error(msg);
    }

    const scheduleInput =
      when.type === "scheduled"
        ? when.date
        : when.type === "delayed"
        ? when.delayInSeconds
        : when.type === "cron"
        ? when.cron
        : error("Invalid schedule input.");

    try {
      agent!.schedule(scheduleInput!, "executeTask", `Reminder: ${message}`);
      return `Reminder scheduled (${when.type}): ${scheduleInput}`;
    } catch (e) {
      console.error("Error scheduling reminder:", e);
      return `Failed to schedule reminder: ${e}`;
    }
  },
});

/* ---------------------------------------------------------
 * Export Tools
 * --------------------------------------------------------- */
export const tools = {
  saveStudyProfile,
  addStudyTask,
  listStudyTasks,
  scheduleStudyReminder,
} satisfies ToolSet;

/* No manual executions needed now */
export const executions = {};
