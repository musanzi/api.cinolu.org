import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateResourceDto } from '../dto/create-resource.dto';
import { FilterResourcesDto } from '../dto/filter-resources.dto';
import { UpdateResourceDto } from '../dto/update-resource.dto';
import { Resource } from '../entities/resource.entity';
import { ProjectsService } from '@/modules/projects/services/projects.service';
import { PhasesService } from '@/modules/projects/phases/services/phases.service';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    private readonly projectsService: ProjectsService,
    private readonly phasesService: PhasesService
  ) {}

  async create(dto: CreateResourceDto, file: Express.Multer.File): Promise<Resource> {
    try {
      const resource = this.resourceRepository.create({
        ...dto,
        file: file.filename,
        project: dto.project_id ? { id: dto.project_id } : null,
        phase: dto.phase_id ? { id: dto.phase_id } : null
      });
      return await this.resourceRepository.save(resource);
    } catch {
      throw new BadRequestException();
    }
  }

  async findByProject(projectId: string, queryParams: FilterResourcesDto): Promise<[Resource[], number]> {
    try {
      await this.projectsService.findOne(projectId);
      return await this.buildScopedQuery('resource.projectId = :scopeId', projectId, queryParams).getManyAndCount();
    } catch {
      throw new NotFoundException();
    }
  }

  async findByPhase(phaseId: string, queryParams: FilterResourcesDto): Promise<[Resource[], number]> {
    try {
      await this.phasesService.findOne(phaseId);
      return await this.buildScopedQuery('resource.phaseId = :scopeId', phaseId, queryParams).getManyAndCount();
    } catch {
      throw new NotFoundException();
    }
  }

  async findOne(id: string): Promise<Resource> {
    try {
      return await this.resourceRepository.findOneOrFail({
        where: { id },
        relations: ['project', 'phase']
      });
    } catch {
      throw new NotFoundException();
    }
  }

  async update(id: string, dto: UpdateResourceDto): Promise<Resource> {
    try {
      const resource = await this.findOne(id);
      return await this.resourceRepository.save({ ...resource, ...dto });
    } catch {
      throw new BadRequestException();
    }
  }

  async setFile(id: string, file: string): Promise<Resource> {
    try {
      const resource = await this.findOne(id);
      return await this.resourceRepository.save({ ...resource, file });
    } catch {
      throw new BadRequestException();
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.findOne(id);
      await this.resourceRepository.softDelete(id);
    } catch {
      throw new BadRequestException();
    }
  }

  private buildScopedQuery(
    scopeCondition: string,
    scopeId: string,
    queryParams: FilterResourcesDto
  ): SelectQueryBuilder<Resource> {
    const { page = 1, category } = queryParams;
    const skip = (+page - 1) * 20;
    const query = this.resourceRepository
      .createQueryBuilder('resource')
      .leftJoinAndSelect('resource.project', 'project')
      .leftJoinAndSelect('resource.phase', 'phase')
      .where(scopeCondition, { scopeId })
      .andWhere('resource.is_published = :isPublished', { isPublished: true });
    if (category) query.andWhere('resource.category = :category', { category });
    return query.orderBy('resource.updated_at', 'DESC').skip(skip).take(20);
  }
}
