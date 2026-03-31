import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class CoachLlmService {
  async generate(prompt: string, model = 'llama3.2:3b'): Promise<string> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          format: 'json'
        })
      });
      if (!response.ok) {
        throw new Error('llm_error');
      }
      const payload = (await response.json()) as { response?: string };
      if (!payload.response) {
        throw new Error('llm_empty');
      }
      return payload.response;
    } catch {
      throw new BadRequestException("Génération de la réponse impossible");
    }
  }

  private getBaseUrl(): string {
    return process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  }
}
