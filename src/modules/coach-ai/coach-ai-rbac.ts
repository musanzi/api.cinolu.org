import { Role } from '@/core/auth/enums/roles.enum';
import { ModuleRbacPolicy } from '@musanzi/nestjs-session-auth';

export const COACH_AI_RBAC_POLICY: ModuleRbacPolicy = {
  module: 'coach-ai',
  grants: [
    {
      roles: [Role.STAFF, Role.ADMIN],
      actions: ['create', 'read', 'update', 'delete'],
      resources: ['coachAi']
    }
  ]
};
