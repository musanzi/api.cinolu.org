import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionAuthModule } from '@musanzi/nestjs-session-auth';
import { OpportunitiesController } from './controllers/opportunities.controller';
import { OpportunityMediaController } from './controllers/opportunity-media.controller';
import { Opportunity } from './entities/opportunity.entity';
import { OPPORTUNITIES_RBAC_POLICY } from './opportunities-rbac';
import { OpportunityMediaService } from './services/opportunity-media.service';
import { OpportunitiesService } from './services/opportunities.service';

@Module({
  imports: [TypeOrmModule.forFeature([Opportunity]), SessionAuthModule.forFeature([OPPORTUNITIES_RBAC_POLICY])],
  controllers: [OpportunitiesController, OpportunityMediaController],
  providers: [OpportunitiesService, OpportunityMediaService],
  exports: [OpportunitiesService]
})
export class OpportunitiesModule {}
