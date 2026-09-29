import { config } from '../config.js';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class LLMService {
  /**
   * Complete chat prompt using configured provider or smart fallback
   */
  public async complete(messages: ChatMessage[], temperature: number = 0.2): Promise<string> {
    // 1. Try Groq if configured
    if (config.groqApiKey) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.groqApiKey}`,
          },
          body: JSON.stringify({
            model: config.llmModel || 'llama-3.3-70b-versatile',
            messages,
            temperature,
          }),
        });

        if (response.ok) {
          const data: any = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) return text;
        }
      } catch (err: any) {
        console.warn(`[LLM] Groq request failed (${err.message}), falling back.`);
      }
    }

    // 2. Try OpenAI if configured
    if (config.openaiApiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
            temperature,
          }),
        });

        if (response.ok) {
          const data: any = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) return text;
        }
      } catch (err: any) {
        console.warn(`[LLM] OpenAI request failed (${err.message}), falling back.`);
      }
    }

    return '';
  }
}

export const llmService = new LLMService();
