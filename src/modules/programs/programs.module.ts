import { Module } from '@nestjs/common';
import { ProgramMediaController } from './controllers/program-media.controller';
import { ProgramsController } from './controllers/programs.controller';
import { ProgramsService } from './services/programs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Program } from './entities/program.entity';
import { ProgramSubscriber } from './subscribers/program.subscriber';
import { ProgramCategoriesModule } from './categories/categories.module';
import { ProgramMediaService } from './services/program-media.service';
import { PROGRAMS_RBAC_POLICY } from './programs-rbac';
import { SessionAuthModule } from '@musanzi/nestjs-session-auth';
import { ProgramSectorsModule } from './sectors/sectors.module';

@Module({
  imports: [
    ProgramCategoriesModule,
    ProgramSectorsModule,
    TypeOrmModule.forFeature([Program]),
    SessionAuthModule.forFeature([PROGRAMS_RBAC_POLICY])
  ],
  controllers: [ProgramsController, ProgramMediaController],
  providers: [ProgramsService, ProgramMediaService, ProgramSubscriber],
  exports: [ProgramsService]
})
export class ProgramsModule {}
