import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoachConversation } from '../entities/coach-conversation.entity';

@Injectable()
export class CoachConversationsService {
  constructor(
    @InjectRepository(CoachConversation)
    private readonly conversationRepository: Repository<CoachConversation>
  ) {}

  async findByCoachAndVenture(coachId: string, ventureId: string): Promise<CoachConversation | null> {
    try {
      return await this.conversationRepository.findOne({
        where: {
          coach: { id: coachId },
          venture: { id: ventureId }
        }
      });
    } catch {
      throw new BadRequestException('Conversation introuvable');
    }
  }

  async findByCoachAndVentureOrFail(coachId: string, ventureId: string): Promise<CoachConversation> {
    try {
      return await this.conversationRepository.findOneOrFail({
        where: {
          coach: { id: coachId },
          venture: { id: ventureId }
        }
      });
    } catch {
      throw new NotFoundException('Conversation introuvable');
    }
  }

  async create(coachId: string, ventureId: string): Promise<CoachConversation> {
    try {
      return await this.conversationRepository.save({
        coach: { id: coachId },
        venture: { id: ventureId },
        status: 'active'
      });
    } catch {
      throw new BadRequestException('Création de la conversation impossible');
    }
  }
}
