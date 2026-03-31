import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionAuthModule } from '@musanzi/nestjs-session-auth';
import { VenturesModule } from '@/modules/ventures/ventures.module';
import { AiCoach } from './entities/ai-coach.entity';
import { CoachConversation } from './entities/coach-conversation.entity';
import { CoachMessage } from './entities/coach-message.entity';
import { CoachAiController } from './controllers/coach-ai.controller';
import { CoachManagementController } from './controllers/coach-management.controller';
import { COACH_AI_RBAC_POLICY } from './coach-ai-rbac';
import { CoachAiService } from './services/coach-ai.service';
import { CoachConversationsService } from './services/coach-conversations.service';
import { CoachLlmService } from './services/coach-llm.service';
import { CoachManagementService } from './services/coach-management.service';
import { CoachMessagesService } from './services/coach-messages.service';
import { CoachOutputValidatorService } from './services/coach-output-validator.service';
import { ConversationWorkflowService } from './services/conversation-workflow.service';

@Module({
  imports: [
    VenturesModule,
    TypeOrmModule.forFeature([AiCoach, CoachConversation, CoachMessage]),
    SessionAuthModule.forFeature([COACH_AI_RBAC_POLICY])
  ],
  providers: [
    CoachAiService,
    CoachManagementService,
    CoachConversationsService,
    CoachMessagesService,
    CoachLlmService,
    CoachOutputValidatorService,
    ConversationWorkflowService
  ],
  controllers: [CoachManagementController, CoachAiController],
  exports: [CoachAiService, CoachManagementService]
})
export class CoachAiModule {}
