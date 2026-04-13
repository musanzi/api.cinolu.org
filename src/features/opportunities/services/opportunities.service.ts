import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateOpportunityDto } from '../dto/create-opportunity.dto';
import { FilterOpportunitiesDto } from '../dto/filter-opportunities.dto';
import { UpdateOpportunityDto } from '../dto/update-opportunity.dto';
import { Opportunity } from '../entities/opportunity.entity';

@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunitiesRepository: Repository<Opportunity>
  ) {}

  async create(dto: CreateOpportunityDto): Promise<Opportunity> {
    try {
      return await this.opportunitiesRepository.save(dto);
    } catch {
      throw new BadRequestException("Création de l'opportunité impossible");
    }
  }

  async findAll(filters: FilterOpportunitiesDto): Promise<Opportunity[]> {
    try {
      return await this.opportunitiesRepository.find({
        where: this.buildWhere(filters),
        order: { due_date: 'ASC' }
      });
    } catch {
      throw new BadRequestException('Opportunités introuvables');
    }
  }

  async findOne(slug: string): Promise<Opportunity> {
    try {
      return await this.opportunitiesRepository.findOneOrFail({
        where: { slug }
      });
    } catch {
      throw new NotFoundException('Opportunité introuvable');
    }
  }

  async findOneById(id: string): Promise<Opportunity> {
    try {
      return await this.opportunitiesRepository.findOneOrFail({
        where: { id }
      });
    } catch {
      throw new NotFoundException('Opportunité introuvable');
    }
  }

  async update(id: string, dto: UpdateOpportunityDto): Promise<Opportunity> {
    try {
      const opportunity = await this.findOneById(id);
      return await this.opportunitiesRepository.save({
        ...opportunity,
        ...dto
      });
    } catch {
      throw new BadRequestException('Mise à jour impossible');
    }
  }

  async setCover(id: string, cover: string): Promise<Opportunity> {
    try {
      const opportunity = await this.findOneById(id);
      return await this.opportunitiesRepository.save({
        ...opportunity,
        cover
      });
    } catch {
      throw new BadRequestException('Ajout de couverture impossible');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.findOneById(id);
      await this.opportunitiesRepository.delete(id);
    } catch {
      throw new BadRequestException('Suppression impossible');
    }
  }

  private buildWhere(filters: FilterOpportunitiesDto): FindOptionsWhere<Opportunity> {
    const where: FindOptionsWhere<Opportunity> = {};
    if (filters.language) where.language = filters.language;
    if (filters.from && filters.to) where.due_date = Between(filters.from, filters.to) as never;
    if (filters.from && !filters.to) where.due_date = MoreThanOrEqual(filters.from) as never;
    if (!filters.from && filters.to) where.due_date = LessThanOrEqual(filters.to) as never;
    return where;
  }
}
