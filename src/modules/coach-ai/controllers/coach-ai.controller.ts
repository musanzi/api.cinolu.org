import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '@musanzi/nestjs-session-auth';
import { User } from '@/modules/users/entities/user.entity';
import { ChatWithCoachDto } from '../dto/chat-with-coach.dto';
import { CoachAiService } from '../services/coach-ai.service';
import { AiCoach } from '../entities/ai-coach.entity';
import { CoachConversation } from '../entities/coach-conversation.entity';
import { CoachOutput } from '../types/coach-output.type';

@Controller('coach-ai/ventures')
export class CoachAiController {
  constructor(private readonly coachAiService: CoachAiService) {}

  @Get(':ventureId/coaches')
  findCoaches(@Param('ventureId') ventureId: string, @CurrentUser() user: User): Promise<AiCoach[]> {
    return this.coachAiService.findCoachesForVenture(ventureId, user);
  }

  @Get(':ventureId/coaches/:coachId')
  findCoach(@Param('ventureId') ventureId: string, @Param('coachId') coachId: string, @CurrentUser() user: User) {
    return this.coachAiService.findCoachForVenture(ventureId, coachId, user);
  }

  @Get(':ventureId/coaches/:coachId/conversation')
  findConversation(
    @Param('ventureId') ventureId: string,
    @Param('coachId') coachId: string,
    @CurrentUser() user: User
  ): Promise<CoachConversation> {
    return this.coachAiService.findConversation(ventureId, coachId, user);
  }

  @Post(':ventureId/coaches/:coachId/chat')
  chat(
    @Param('ventureId') ventureId: string,
    @Param('coachId') coachId: string,
    @CurrentUser() user: User,
    @Body() dto: ChatWithCoachDto
  ): Promise<CoachOutput> {
    return this.coachAiService.chat(ventureId, coachId, user, dto);
  }
}
