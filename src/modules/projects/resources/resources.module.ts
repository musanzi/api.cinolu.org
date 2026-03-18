import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from './entities/resource.entity';
import { SessionAuthModule } from '@musanzi/nestjs-session-auth';
import { RESOURCES_RBAC_POLICY } from './resources-rbac';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './services/resources.service';
import { ProjectsModule } from '../projects.module';
import { ResourceMediaService } from './services/resource-media.service';
import { PhasesModule } from '../phases/phases.module';

@Module({
  imports: [
    ProjectsModule,
    PhasesModule,
    TypeOrmModule.forFeature([Resource]),
    SessionAuthModule.forFeature([RESOURCES_RBAC_POLICY])
  ],
  providers: [ResourcesService, ResourceMediaService],
  controllers: [ResourcesController]
})
export class ResourcesModule {}
