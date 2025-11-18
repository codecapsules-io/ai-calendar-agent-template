import { LanguageModelLike } from "@langchain/core/language_models/base";

export interface AgentModelConfig {
  provider: string;
  name: string;
  model: string | LanguageModelLike;
}
