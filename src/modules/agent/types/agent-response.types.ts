export interface AgentStreamChunkResponse {
  contentBlocks: {
    type: string;
    text: string;
  }[];
}

export interface AgentStreamMetadataResponse {
  tags: string[];
  name: string | undefined;
  langgraph_step: number;
  langgraph_node: string;
  langgraph_triggers: string[];
  langgraph_path: string[];
  langgraph_checkpoint_ns: string;
  __pregel_task_id: string;
  checkpoint_ns: string;
  ls_provider: string;
  ls_model_name: string;
  ls_model_type: string;
  ls_temperature: number;
  ls_max_tokens: number | undefined;
  ls_stop: string | undefined;
}
