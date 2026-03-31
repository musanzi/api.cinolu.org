import { ConversationWorkflowService } from '@/modules/coach-ai/services/conversation-workflow.service';

describe('ConversationWorkflowService', () => {
  const setup = () => {
    const coachLlmService = {
      generate: jest.fn()
    } as any;
    const coachOutputValidatorService = {
      validate: jest.fn()
    } as any;
    const service = new ConversationWorkflowService(coachLlmService, coachOutputValidatorService);
    return { service, coachLlmService, coachOutputValidatorService };
  };

  it('runs the langgraph flow and returns the validated output', async () => {
    const { service, coachLlmService, coachOutputValidatorService } = setup();
    const expected = {
      type: 'DIAGNOSTIC',
      title: 'Diagnostic',
      summary: 'Résumé venture',
      bullets: ['Point 1'],
      ventureFocus: 'AgriNova',
      scopeCheck: { profile: 'Profil', role: 'Role', grounded: true }
    };
    coachLlmService.generate.mockResolvedValue(JSON.stringify(expected));
    coachOutputValidatorService.validate.mockReturnValue(expected);

    await expect(
      service.run({
        coach: {
          id: 'c1',
          name: 'Coach',
          profile: 'Profil',
          role: 'Role',
          expected_outputs: ['DIAGNOSTIC'],
          model: 'llama3.2:3b'
        },
        venture: {
          id: 'v1',
          name: 'AgriNova',
          sector: 'agritech'
        },
        message: 'Analyse ma venture',
        history: [{ role: 'user', content: 'Bonjour' }]
      })
    ).resolves.toEqual(expected);

    expect(coachLlmService.generate).toHaveBeenCalledWith(expect.stringContaining('AgriNova'), 'llama3.2:3b');
    expect(coachOutputValidatorService.validate).toHaveBeenCalledWith(
      JSON.stringify(expected),
      expect.objectContaining({ id: 'c1' }),
      expect.objectContaining({ id: 'v1' })
    );
  });
});
