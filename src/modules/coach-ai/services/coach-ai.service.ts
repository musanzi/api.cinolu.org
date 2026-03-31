import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@/modules/users/entities/user.entity';
import { VenturesService } from '@/modules/ventures/services/ventures.service';
import { ChatWithCoachDto } from '../dto/chat-with-coach.dto';
import { CoachManagementService } from './coach-management.service';
import { CoachConversationsService } from './coach-conversations.service';
import { CoachMessagesService } from './coach-messages.service';
import { ConversationWorkflowService } from './conversation-workflow.service';
import { AiCoach } from '../entities/ai-coach.entity';
import { Venture } from '@/modules/ventures/entities/venture.entity';
import { CoachConversation } from '../entities/coach-conversation.entity';
import { CoachOutput } from '../types/coach-output.type';

@Injectable()
export class CoachAiService {
  constructor(
    private readonly venturesService: VenturesService,
    private readonly coachManagementService: CoachManagementService,
    private readonly conversationsService: CoachConversationsService,
    private readonly messagesService: CoachMessagesService,
    private readonly conversationWorkflow: ConversationWorkflowService
  ) {}

  async findCoachesForVenture(ventureId: string, user: User): Promise<AiCoach[]> {
    try {
      await this.findOwnedVenture(ventureId, user);
      return await this.coachManagementService.findAllActive();
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new BadRequestException('Coachs indisponibles');
    }
  }

  async findCoachForVenture(ventureId: string, coachId: string, user: User): Promise<AiCoach> {
    try {
      await this.findOwnedVenture(ventureId, user);
      return await this.coachManagementService.findByIdOrFail(coachId);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new BadRequestException('Coach indisponible');
    }
  }

  async findConversation(ventureId: string, coachId: string, user: User): Promise<CoachConversation> {
    try {
      await this.findCoachForVenture(ventureId, coachId, user);
      return await this.conversationsService.findByCoachAndVentureOrFail(coachId, ventureId);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new BadRequestException('Conversation indisponible');
    }
  }

  async chat(ventureId: string, coachId: string, user: User, dto: ChatWithCoachDto): Promise<CoachOutput> {
    try {
      const venture = await this.findOwnedVenture(ventureId, user);
      const coach = await this.findCoachForVenture(ventureId, coachId, user);
      const conversation = await this.findOrCreateConversation(coach.id, venture.id);
      const history = await this.messagesService.findByConversation(conversation.id);
      await this.messagesService.createUserMessage(conversation.id, dto.message);
      const response = await this.conversationWorkflow.run({
        coach,
        venture,
        message: dto.message,
        history: history.map((item) => ({
          role: item.role,
          content: item.content
        }))
      });
      await this.messagesService.createCoachMessage(conversation.id, response);
      return response;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new BadRequestException('Discussion avec le coach impossible');
    }
  }

  private async findOwnedVenture(ventureId: string, user: User): Promise<Venture> {
    try {
      const venture = await this.venturesService.findOne(ventureId);
      if (venture.owner?.id !== user.id) {
        throw new BadRequestException('Cette entreprise ne vous appartient pas');
      }
      return venture;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new BadRequestException('Entreprise indisponible');
    }
  }

  private async findOrCreateConversation(coachId: string, ventureId: string): Promise<CoachConversation> {
    const conversation = await this.conversationsService.findByCoachAndVenture(coachId, ventureId);
    if (conversation) return conversation;
    return await this.conversationsService.create(coachId, ventureId);
  }
}
