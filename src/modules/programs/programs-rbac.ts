import { Role } from '@/core/auth/enums/roles.enum';
import { ModuleRbacPolicy } from '@musanzi/nestjs-session-auth';

export const PROGRAMS_RBAC_POLICY: ModuleRbacPolicy = {
  module: 'programs',
  grants: [
    {
      roles: [Role.STAFF],
      actions: ['manage'],
      resources: ['programs', 'programCategories', 'programSectors']
    }
  ]
};
