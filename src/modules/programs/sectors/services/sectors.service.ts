import { Injectable } from '@nestjs/common';
import { ProgramSector } from '../entities/sector.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCategoryService } from '@/core/helpers/abstract-category.service';

@Injectable()
export class ProgramSectorsService extends BaseCategoryService<ProgramSector> {
  constructor(@InjectRepository(ProgramSector) sectorRepository: Repository<ProgramSector>) {
    super(sectorRepository);
  }
}
