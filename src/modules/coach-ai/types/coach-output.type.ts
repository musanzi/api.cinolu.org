export type CoachOutputScopeCheck = {
  profile: string;
  role: string;
  grounded: boolean;
};

export type CoachOutput = {
  type: string;
  title: string;
  summary: string;
  bullets: string[];
  ventureFocus: string;
  scopeCheck: CoachOutputScopeCheck;
};

export type ConversationWorkflowInput = {
  coach: {
    id: string;
    name: string;
    profile: string;
    role: string;
    expected_outputs: string[];
    model?: string;
  };
  venture: {
    id: string;
    name: string;
    sector?: string;
    stage?: string;
    target_market?: string;
    problem_solved?: string;
    description?: string;
  };
  message: string;
  history: {
    role: string;
    content: string;
  }[];
};
