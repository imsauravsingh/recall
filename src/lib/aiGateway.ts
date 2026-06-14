import type { AIProvider, AIProviderConfig, AIProviderKey } from './aiProvider';

export interface AIProviderState {
  providers: AIProviderConfig[];
  usage: Record<AIProviderKey, { requests: number; cost: number }>;
}

export class AIGateway {
  constructor(private providers: AIProvider[]) {}

  async generate(prompt: string): Promise<string> {
    for (const provider of this.sortedProviders()) {
      try {
        const healthy = await provider.healthCheck();
        if (!healthy) continue;
        const response = await provider.generate(prompt);
        return response;
      } catch (error) {
        console.warn(`Provider ${provider.providerName} failed, switching provider.`, error);
      }
    }
    throw new Error('All AI providers failed or are unavailable.');
  }

  async embeddings(text: string): Promise<number[]> {
    for (const provider of this.sortedProviders()) {
      try {
        const healthy = await provider.healthCheck();
        if (!healthy) continue;
        const embedding = await provider.embeddings(text);
        return embedding;
      } catch (error) {
        console.warn(`Provider ${provider.providerName} failed during embeddings, switching provider.`, error);
      }
    }
    throw new Error('All AI providers failed for embeddings.');
  }

  private sortedProviders(): AIProvider[] {
    return this.providers;
  }
}

export const defaultAIProviderConfigs: AIProviderConfig[] = [
  { key: 'claude', enabled: true, priority: 1, config: {} },
  { key: 'gemini', enabled: true, priority: 2, config: {} },
  { key: 'openai', enabled: true, priority: 3, config: {} },
  { key: 'deepseek', enabled: true, priority: 4, config: {} },
  { key: 'ollama', enabled: true, priority: 5, config: {} },
  { key: 'openrouter', enabled: true, priority: 6, config: {} },
];
