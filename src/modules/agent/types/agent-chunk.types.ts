import { AgentMessageRole } from "./agent-role.types";

export interface AgentMessageChunk {
  role: AgentMessageRole;
  chunk: string;
}
