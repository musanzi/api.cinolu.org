import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Rbac } from '@musanzi/nestjs-session-auth';
import { CreateCoachDto } from '../dto/create-coach.dto';
import { UpdateCoachDto } from '../dto/update-coach.dto';
import { AiCoach } from '../entities/ai-coach.entity';
import { CoachManagementService } from '../services/coach-management.service';

@Controller('coach-ai')
@Rbac({ resource: 'coachAi', action: 'read' })
export class CoachManagementController {
  constructor(private readonly coachManagementService: CoachManagementService) {}

  @Post()
  @Rbac({ resource: 'coachAi', action: 'create' })
  create(@Body() dto: CreateCoachDto): Promise<AiCoach> {
    return this.coachManagementService.create(dto);
  }

  @Get()
  findAll(): Promise<AiCoach[]> {
    return this.coachManagementService.findAll();
  }

  @Get(':coachId')
  findOne(@Param('coachId') coachId: string): Promise<AiCoach> {
    return this.coachManagementService.findByIdOrFail(coachId);
  }

  @Patch(':coachId')
  @Rbac({ resource: 'coachAi', action: 'update' })
  update(@Param('coachId') coachId: string, @Body() dto: UpdateCoachDto): Promise<AiCoach> {
    return this.coachManagementService.update(coachId, dto);
  }

  @Delete(':coachId')
  @Rbac({ resource: 'coachAi', action: 'delete' })
  remove(@Param('coachId') coachId: string): Promise<void> {
    return this.coachManagementService.remove(coachId);
  }
}
