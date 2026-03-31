import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiCoach } from '../entities/ai-coach.entity';
import { CreateCoachDto } from '../dto/create-coach.dto';
import { UpdateCoachDto } from '../dto/update-coach.dto';

@Injectable()
export class CoachManagementService {
  constructor(
    @InjectRepository(AiCoach)
    private readonly coachRepository: Repository<AiCoach>
  ) {}

  async create(dto: CreateCoachDto): Promise<AiCoach> {
    try {
      return await this.coachRepository.save(this.normalizePayload(dto));
    } catch {
      throw new BadRequestException('Création du coach impossible');
    }
  }

  async findAll(): Promise<AiCoach[]> {
    try {
      return await this.coachRepository.find({
        order: { updated_at: 'DESC' }
      });
    } catch {
      throw new BadRequestException('Coachs introuvables');
    }
  }

  async findAllActive(): Promise<AiCoach[]> {
    try {
      return await this.coachRepository.find({
        where: { status: 'active' },
        order: { updated_at: 'DESC' }
      });
    } catch {
      throw new BadRequestException('Coachs actifs introuvables');
    }
  }

  async findByIdOrFail(id: string): Promise<AiCoach> {
    try {
      return await this.coachRepository.findOneOrFail({
        where: { id }
      });
    } catch {
      throw new NotFoundException('Coach introuvable');
    }
  }

  async update(id: string, dto: UpdateCoachDto): Promise<AiCoach> {
    try {
      const coach = await this.findByIdOrFail(id);
      const payload = this.normalizePayload(dto);
      this.coachRepository.merge(coach, payload);
      return await this.coachRepository.save(coach);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Mise à jour du coach impossible');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const coach = await this.findByIdOrFail(id);
      await this.coachRepository.softDelete(coach.id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Suppression du coach impossible');
    }
  }

  private normalizePayload(dto: Partial<CreateCoachDto>): Partial<AiCoach> {
    return {
      ...dto,
      expected_outputs: dto.expected_outputs?.map((item) => item.trim()).filter(Boolean),
      model: dto.model || 'llama3.2:3b',
      status: dto.status || 'active'
    };
  }
}
