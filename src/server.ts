import { routeAgentRequest, type Schedule } from "agents";
import { getSchedulePrompt } from "agents/schedule";

import { AIChatAgent } from "agents/ai-chat-agent";
import {
  generateId,
  streamText,
  type StreamTextOnFinishCallback,
  stepCountIs,
  createUIMessageStream,
  convertToModelMessages,
  createUIMessageStreamResponse,
  type ToolSet,
} from "ai";

import { createWorkersAI } from "workers-ai-provider";
import { processToolCalls, cleanupMessages } from "./utils";
import { tools, executions } from "./tools";

/**
 * Chat Agent implementation that handles real-time AI chat interactions
 */
export class Chat extends AIChatAgent<Env> {
  /**
   * Handles incoming chat messages and manages the response stream
   */
  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    _options?: { abortSignal?: AbortSignal }
  ) {
    // Create Workers AI client using the actual binding from this.env
    const workersai = createWorkersAI({
      // `AI` is the Workers AI binding configured in wrangler.jsonc
      binding: (this.env as any).AI,
    });

    // Main LLM model: Llama 3.3 on Workers AI
    const model = workersai("@cf/meta/llama-3.3-70b-instruct-fp8-fast");

    // const mcpConnection = await this.mcp.connect(
    //   "https://path-to-mcp-server/sse"
    // );

    // Collect all tools, including MCP tools (if any)
    const allTools = {
      ...tools,
      ...this.mcp.getAITools(),
    };

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        // Clean up incomplete tool calls to prevent API errors
        const cleanedMessages = cleanupMessages(this.messages);

        // Process any pending tool calls from previous messages
        // This handles human-in-the-loop confirmations for tools
        const processedMessages = await processToolCalls({
          messages: cleanedMessages,
          dataStream: writer,
          tools: allTools,
          executions,
        });

        const result = streamText({
          model,
          system: `You are Edge Study Buddy, an AI study coach running on Cloudflare Agents and Workers AI.

Your responsibilities:
- Help the user define and organize study goals.
- Create daily or weekly study plans.
- Register study tasks (for example: review a topic, solve exercises, watch a lecture).
- List pending and completed study tasks and suggest priorities.
- Suggest study techniques based on the stored profile and past tasks.
- Be practical, clear, and educational. Explain your reasoning when it helps learning.

You have tools for:
- Saving and updating the user's study profile.
- Adding and listing study tasks.
- Scheduling future reminders using the scheduling tool.

Always:
- Use tools whenever you need to persist state or schedule something.
- Ask for clarification when the study goal is too vague.

${getSchedulePrompt({ date: new Date() })}

If the user asks to schedule a task or a reminder, use the schedule tool to schedule the task.`,
          messages: convertToModelMessages(processedMessages),
          tools: allTools,
          toolChoice: "auto",
          maxTokens: 512,
          // Type boundary: streamText expects specific tool types, but base class uses ToolSet.
          // This is safe because our tools satisfy the ToolSet interface (via `satisfies` in tools.ts).
          onFinish: onFinish as unknown as StreamTextOnFinishCallback<
            typeof allTools
          >,
          stopWhen: stepCountIs(10),
        });

        writer.merge(result.toUIMessageStream());
      },
    });

    return createUIMessageStreamResponse({ stream });
  }

  /**
   * Called by scheduled tasks created via agent.schedule(..., "executeTask", description)
   */
  async executeTask(description: string, _task: Schedule<string>) {
    await this.saveMessages([
      ...this.messages,
      {
        id: generateId(),
        role: "user",
        parts: [
          {
            type: "text",
            text: `Running scheduled task: ${description}`,
          },
        ],
        metadata: {
          createdAt: new Date(),
        },
      },
    ]);
  }
}

/**
 * Worker entry point that routes incoming requests to the appropriate handler
 */
export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
    const url = new URL(request.url);

    // Simple health check endpoint
    if (url.pathname === "/health") {
      return Response.json({ ok: true });
    }

    return (
      // Route the request to our agent or return 404 if not found
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  },
} satisfies ExportedHandler<Env>;
