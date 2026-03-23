import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramSector } from './entities/sector.entity';
import { ProgramSectorsController } from './controllers/program-sectors.controller';
import { ProgramSectorsService } from './services/sectors.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProgramSector])],
  controllers: [ProgramSectorsController],
  providers: [ProgramSectorsService],
  exports: [ProgramSectorsService]
})
export class ProgramSectorsModule {}
