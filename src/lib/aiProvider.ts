export interface AIProvider {
  providerName: string;
  generate(prompt: string): Promise<string>;
  embeddings(text: string): Promise<number[]>;
  healthCheck(): Promise<boolean>;
}

export type AIProviderKey = 'openai' | 'claude' | 'gemini' | 'deepseek' | 'openrouter' | 'ollama';

export interface AIProviderConfig {
  key: AIProviderKey;
  enabled: boolean;
  priority: number;
  config: Record<string, string>;
}
