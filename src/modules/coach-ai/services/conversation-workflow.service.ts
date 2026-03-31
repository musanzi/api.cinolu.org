import { BadRequestException, Injectable } from '@nestjs/common';
import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { CoachOutputValidatorService } from './coach-output-validator.service';
import { CoachLlmService } from './coach-llm.service';
import { CoachOutput, ConversationWorkflowInput } from '../types/coach-output.type';

const ConversationWorkflowState = Annotation.Root({
  input: Annotation<ConversationWorkflowInput>(),
  prompt: Annotation<string>(),
  raw: Annotation<string>(),
  response: Annotation<CoachOutput>()
});

@Injectable()
export class ConversationWorkflowService {
  private readonly graph = new StateGraph(ConversationWorkflowState)
    .addNode('preparePrompt', async (state) => ({
      prompt: this.buildPrompt(state.input)
    }))
    .addNode('generateResponse', async (state) => ({
      raw: await this.coachLlmService.generate(state.prompt, state.input.coach.model)
    }))
    .addNode('validateResponse', async (state) => ({
      response: this.coachOutputValidatorService.validate(state.raw, state.input.coach, state.input.venture)
    }))
    .addEdge(START, 'preparePrompt')
    .addEdge('preparePrompt', 'generateResponse')
    .addEdge('generateResponse', 'validateResponse')
    .addEdge('validateResponse', END)
    .compile();

  constructor(
    private readonly coachLlmService: CoachLlmService,
    private readonly coachOutputValidatorService: CoachOutputValidatorService
  ) {}

  async run(input: ConversationWorkflowInput): Promise<CoachOutput> {
    try {
      const result = await this.graph.invoke({ input });
      if (!result.response) {
        throw new Error('missing_response');
      }
      return result.response;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Exécution du coach impossible');
    }
  }

  private buildPrompt(input: ConversationWorkflowInput): string {
    const history = input.history
      .slice(-8)
      .map((message) => `${message.role}: ${message.content}`)
      .join('\n');
    return [
      `Tu es ${input.coach.name}.`,
      'Tu dois rester strictement dans ton périmètre.',
      `Profil: ${input.coach.profile}`,
      `Rôle: ${input.coach.role}`,
      `Types autorisés: ${input.coach.expected_outputs.join(', ')}`,
      'Contexte venture:',
      `- Nom: ${input.venture.name}`,
      `- Secteur: ${input.venture.sector || 'non défini'}`,
      `- Stade: ${input.venture.stage || 'non défini'}`,
      `- Marché cible: ${input.venture.target_market || 'non défini'}`,
      `- Problème résolu: ${input.venture.problem_solved || 'non défini'}`,
      `- Description: ${input.venture.description || 'non définie'}`,
      history ? `Historique:\n${history}` : 'Historique: aucun',
      `Demande utilisateur: ${input.message}`,
      'Réponds uniquement en JSON valide.',
      'Schéma JSON attendu:',
      JSON.stringify(
        {
          type: input.coach.expected_outputs[0],
          title: 'Titre court',
          summary: 'Résumé précis fondé sur la venture',
          bullets: ['Point 1', 'Point 2'],
          ventureFocus: 'Élément venture explicitement cité',
          scopeCheck: {
            profile: input.coach.profile,
            role: input.coach.role,
            grounded: true
          }
        },
        null,
        2
      )
    ].join('\n');
  }
}
