import { BadRequestException, Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { Opportunity } from '../entities/opportunity.entity';
import { OpportunitiesService } from './opportunities.service';

@Injectable()
export class OpportunityMediaService {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  async addCover(id: string, file: Express.Multer.File): Promise<Opportunity> {
    try {
      return await this.replaceCover(id, file.filename);
    } catch {
      throw new BadRequestException('Ajout de couverture impossible');
    }
  }

  async updateCover(id: string, file: Express.Multer.File): Promise<Opportunity> {
    try {
      return await this.replaceCover(id, file.filename);
    } catch {
      throw new BadRequestException('Mise à jour de couverture impossible');
    }
  }

  private async replaceCover(id: string, filename: string): Promise<Opportunity> {
    const opportunity = await this.opportunitiesService.findOne(id);
    if (opportunity.cover) {
      await fs.unlink(`./uploads/opportunities/${opportunity.cover}`).catch(() => undefined);
    }
    return await this.opportunitiesService.setCover(id, filename);
  }
}
