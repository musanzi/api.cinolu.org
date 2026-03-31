import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoachMessage } from '../entities/coach-message.entity';
import { CoachOutput } from '../types/coach-output.type';

@Injectable()
export class CoachMessagesService {
  constructor(
    @InjectRepository(CoachMessage)
    private readonly messageRepository: Repository<CoachMessage>
  ) {}

  async findByConversation(conversationId: string): Promise<CoachMessage[]> {
    try {
      return await this.messageRepository.find({
        where: { conversation: { id: conversationId } },
        order: { created_at: 'ASC' }
      });
    } catch {
      throw new BadRequestException('Messages introuvables');
    }
  }

  async createUserMessage(conversationId: string, message: string): Promise<CoachMessage> {
    try {
      return await this.messageRepository.save({
        conversation: { id: conversationId },
        role: 'user',
        output_type: 'USER_MESSAGE',
        content: message,
        payload: { message }
      });
    } catch {
      throw new BadRequestException("Enregistrement du message impossible");
    }
  }

  async createCoachMessage(conversationId: string, payload: CoachOutput): Promise<CoachMessage> {
    try {
      return await this.messageRepository.save({
        conversation: { id: conversationId },
        role: 'assistant',
        output_type: payload.type,
        content: payload.summary,
        payload
      });
    } catch {
      throw new BadRequestException("Enregistrement de la réponse impossible");
    }
  }
}
