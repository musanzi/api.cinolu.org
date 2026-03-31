import { BadRequestException, Injectable } from '@nestjs/common';
import { CoachOutput } from '../types/coach-output.type';

@Injectable()
export class CoachOutputValidatorService {
  validate(raw: string, coach: { expected_outputs: string[]; profile?: string; role?: string }, venture: any): CoachOutput {
    try {
      const output = this.parse(raw);
      this.assertShape(output);
      this.assertType(output, coach.expected_outputs);
      this.assertScope(output, coach);
      this.assertGrounding(output, venture);
      return output;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Réponse du coach invalide');
    }
  }

  private parse(raw: string): CoachOutput {
    try {
      const json = this.extractJson(raw);
      return JSON.parse(json) as CoachOutput;
    } catch {
      throw new BadRequestException('Réponse du coach invalide');
    }
  }

  private extractJson(raw: string): string {
    const fenced = raw.match(/```json\s*([\s\S]*?)```/i);
    if (fenced?.[1]) return fenced[1].trim();
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) return raw.slice(start, end + 1);
    return raw;
  }

  private assertShape(output: CoachOutput): void {
    if (!output?.type || !output?.title || !output?.summary || !output?.ventureFocus) {
      throw new BadRequestException('Structure de réponse invalide');
    }
    if (!Array.isArray(output.bullets) || !output.bullets.length) {
      throw new BadRequestException('Structure de réponse invalide');
    }
    if (!output.scopeCheck || typeof output.scopeCheck.grounded !== 'boolean') {
      throw new BadRequestException('Structure de réponse invalide');
    }
  }

  private assertType(output: CoachOutput, expectedOutputs: string[]): void {
    if (!expectedOutputs?.includes(output.type)) {
      throw new BadRequestException('Type de sortie non autorisé');
    }
  }

  private assertScope(output: CoachOutput, coach: { profile?: string; role?: string }): void {
    if (coach.profile && output.scopeCheck.profile !== coach.profile) {
      throw new BadRequestException('Profil du coach invalide');
    }
    if (coach.role && output.scopeCheck.role !== coach.role) {
      throw new BadRequestException('Rôle du coach invalide');
    }
    if (!output.scopeCheck.grounded) {
      throw new BadRequestException('Réponse hors contexte');
    }
  }

  private assertGrounding(output: CoachOutput, venture: any): void {
    const haystack = this.normalize([
      output.summary,
      output.ventureFocus,
      ...output.bullets
    ].join(' '));
    const contexts = [
      venture?.name,
      venture?.sector,
      venture?.stage,
      venture?.target_market,
      venture?.problem_solved,
      venture?.description
    ]
      .filter(Boolean)
      .map((value) => this.normalize(String(value)))
      .filter(Boolean);
    const grounded = contexts.some((value) => haystack.includes(value));
    if (!grounded) {
      throw new BadRequestException('Réponse hors contexte');
    }
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
