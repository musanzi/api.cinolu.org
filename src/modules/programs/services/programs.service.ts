import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from '../entities/program.entity';
import { CreateProgramDto } from '../dto/create-program.dto';
import { UpdateProgramDto } from '../dto/update-program.dto';
import { FilterProgramsDto } from '../dto/filter-programs.dto';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private programRepository: Repository<Program>
  ) {}

  async create(dto: CreateProgramDto): Promise<Program> {
    try {
      const program = this.programRepository.create({
        ...dto,
        category: { id: dto.category },
        sector: { id: dto.sector }
      });
      return await this.programRepository.save(program);
    } catch {
      throw new BadRequestException('Création du programme impossible');
    }
  }

  async findPublished(): Promise<Program[]> {
    try {
      return await this.programRepository.find({
        where: { is_published: true },
        order: { updated_at: 'DESC' },
        relations: ['category', 'sector', 'subprograms']
      });
    } catch {
      throw new NotFoundException('Programmes introuvables');
    }
  }

  async findAll(): Promise<Program[]> {
    try {
      return await this.programRepository.find({
        where: { is_published: true },
        order: { updated_at: 'DESC' },
        relations: ['category', 'sector']
      });
    } catch {
      throw new NotFoundException('Programmes introuvables');
    }
  }

  async findBySlug(slug: string): Promise<Program> {
    try {
      return await this.programRepository.findOneOrFail({
        where: { slug },
        relations: ['category', 'sector', 'subprograms']
      });
    } catch {
      throw new NotFoundException('Programme introuvable');
    }
  }

  async highlight(id: string): Promise<Program> {
    try {
      const program = await this.findOne(id);
      program.is_highlighted = !program.is_highlighted;
      return await this.programRepository.save(program);
    } catch {
      throw new BadRequestException('Mise en avant impossible');
    }
  }

  async togglePublish(id: string): Promise<Program> {
    try {
      const program = await this.findOne(id);
      program.is_published = !program.is_published;
      return await this.programRepository.save(program);
    } catch {
      throw new BadRequestException('Publication impossible');
    }
  }

  async findFiltered(queryParams: FilterProgramsDto): Promise<[Program[], number]> {
    try {
      const { page = 1, q, filter = 'all' } = queryParams;
      const query = this.programRepository
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.category', 'category')
        .leftJoinAndSelect('p.sector', 'sector')
        .orderBy('p.updated_at', 'DESC');
      if (filter === 'published') query.andWhere('p.is_published = :isPublished', { isPublished: true });
      if (filter === 'drafts') query.andWhere('p.is_published = :isPublished', { isPublished: false });
      if (filter === 'highlighted') query.andWhere('p.is_highlighted = :isHighlighted', { isHighlighted: true });
      if (q) query.andWhere('(p.name LIKE :q OR p.description LIKE :q)', { q: `%${q}%` });
      const skip = (+page - 1) * 10;
      return await query.skip(skip).take(10).getManyAndCount();
    } catch {
      throw new BadRequestException('Programmes introuvables');
    }
  }

  async setLogo(id: string, logo: string): Promise<Program> {
    try {
      const program = await this.findOne(id);
      program.logo = logo;
      return await this.programRepository.save(program);
    } catch {
      throw new BadRequestException('Ajout du logo impossible');
    }
  }

  async findOne(id: string): Promise<Program> {
    try {
      return await this.programRepository.findOneOrFail({
        where: { id },
        relations: ['category', 'sector']
      });
    } catch {
      throw new NotFoundException('Programme introuvable');
    }
  }

  async update(id: string, dto: UpdateProgramDto): Promise<Program> {
    try {
      const program = await this.findOne(id);
      return await this.programRepository.save({
        ...program,
        ...dto,
        category: dto.category ? { id: dto.category } : program.category,
        sector: dto.sector ? { id: dto.sector } : program.sector
      });
    } catch {
      throw new BadRequestException('Mise à jour impossible');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const program = await this.findOne(id);
      await this.programRepository.softDelete(program.id);
    } catch {
      throw new BadRequestException('Suppression impossible');
    }
  }
}
