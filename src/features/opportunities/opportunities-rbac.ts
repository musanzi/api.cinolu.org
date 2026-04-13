import { Role } from '@/core/auth/enums/roles.enum';
import { ModuleRbacPolicy } from '@musanzi/nestjs-session-auth';

export const OPPORTUNITIES_RBAC_POLICY: ModuleRbacPolicy = {
  module: 'opportunities',
  grants: [
    {
      roles: [Role.STAFF],
      actions: ['read', 'create', 'update', 'delete'],
      resources: ['opportunities']
    }
  ]
};
