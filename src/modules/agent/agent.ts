import { createAgent, ReactAgent } from "langchain";

import {
  AgentMessage,
  AgentModelConfig,
  AgentMessageRole,
  AgentMessageChunk,
  AgentStreamChunkResponse,
  AgentStreamMetadataResponse,
} from "./types";
import { ToolsManager } from "./tools";
import { AgentUtility } from "./utilities";
import { configSystemPrompt } from "./config";

export class Agent {
  private agent: ReactAgent;

  constructor(private modelConfig: AgentModelConfig) {
    const toolsManager = new ToolsManager();
    const tools = toolsManager.getTools();

    this.agent = createAgent({
      model: modelConfig.model,
      systemPrompt: configSystemPrompt,
      tools,
    });
  }

  async prompt(
    messages: AgentMessage[],
    userId?: string
  ): Promise<AgentMessage> {
    const result = await this.invoke(messages, userId);
    return AgentUtility.convertToAgentMessage(result.messages);
  }

  private invoke(inputMessages: AgentMessage[], userId: string | undefined) {
    const messages = AgentUtility.convertToLangchainFormat(inputMessages);

    return this.agent.invoke(
      { messages },
      {
        configurable: {
          userId,
        },
      }
    );
  }

  async streamPrompt(
    messages: AgentMessage[],
    userId: string | undefined,
    callback: (message: AgentMessageChunk[]) => void
  ): Promise<AgentMessage> {
    let chunk: AgentStreamChunkResponse;
    let metadata: AgentStreamMetadataResponse;

    let responseContent: string = "";
    for await ([chunk, metadata] of await this.stream(messages, userId)) {
      const type = metadata.langgraph_node;

      if (type === "model_request") {
        const chunks = AgentUtility.convertToAgentChunks(chunk);

        const text = chunks.map((chunk) => chunk.chunk).join("");
        responseContent += text;
        callback(chunks);
      }
    }

    return {
      content: [{ type: "text", text: responseContent }],
      date: new Date(),
      role: AgentMessageRole.ASSISTANT,
    };
  }

  private stream(inputMessages: AgentMessage[], userId: string | undefined) {
    const messages = AgentUtility.convertToLangchainFormat(inputMessages);

    return this.agent.stream(
      { messages },
      {
        streamMode: "messages",
        configurable: {
          userId,
        },
      }
    );
  }

  getDetails() {
    return {
      provider: this.modelConfig.provider,
      model: this.modelConfig.name,
    };
  }
}
