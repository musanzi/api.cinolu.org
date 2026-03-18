import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createDiskUploadOptions } from '@/core/helpers/upload.helper';
import { createCsvUploadOptions } from '@/core/helpers/csv-upload.helper';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ParticipateProjectDto } from './dto/participate.dto';
import { Project } from './entities/project.entity';
import { ProjectsService } from './services/projects.service';
import { ProjectParticipationService } from './services/project-participations.service';
import { ProjectNotificationService } from './services/project-notifications.service';
import { ProjectMediaService } from './services/project-media.service';
import { FilterProjectsDto } from './dto/filter-projects.dto';
import { Rbac } from '@musanzi/nestjs-session-auth';
import { Public } from '@musanzi/nestjs-session-auth';
import { CurrentUser } from '@musanzi/nestjs-session-auth';
import { User } from '@/modules/users/entities/user.entity';
import { Notification } from '@/modules/notifications/entities/notification.entity';
import { CreateNotificationDto } from '@/modules/notifications/dto/create-notification.dto';
import { ProjectParticipation } from './entities/project-participation.entity';
import { MoveParticipantsDto } from './dto/move-participants.dto';
import { Gallery } from '@/shared/galleries/entities/gallery.entity';
import { FilterParticipationsDto } from './dto/filter-participations.dto';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly participationService: ProjectParticipationService,
    private readonly notificationService: ProjectNotificationService,
    private readonly mediaService: ProjectMediaService
  ) {}

  @Post()
  @Rbac({ resource: 'projects', action: 'create' })
  create(@Body() dto: CreateProjectDto): Promise<Project> {
    return this.projectsService.create(dto);
  }

  @Get()
  @Rbac({ resource: 'projects', action: 'read' })
  findAll(@Query() query: FilterProjectsDto): Promise<[Project[], number]> {
    return this.projectsService.findAll(query);
  }

  @Get('recent')
  @Public()
  findRecent(): Promise<Project[]> {
    return this.projectsService.findRecent();
  }

  @Get(':projectId/participations')
  @Public()
  findParticipations(
    @Param('projectId') projectId: string,
    @Query() query: FilterParticipationsDto
  ): Promise<[ProjectParticipation[], number]> {
    return this.participationService.findParticipations(projectId, query);
  }

  @Post('participants/move')
  @Rbac({ resource: 'projects', action: 'update' })
  moveParticipants(@Body() dto: MoveParticipantsDto): Promise<void> {
    return this.participationService.moveParticipants(dto);
  }

  @Post('participants/remove')
  @Rbac({ resource: 'projects', action: 'update' })
  removeParticipantsFromPhase(@Body() dto: MoveParticipantsDto): Promise<void> {
    return this.participationService.removeParticipantsFromPhase(dto);
  }

  @Post('participations/:participationId/upvote')
  async upvote(@Param('participationId') participationId: string, @CurrentUser() user: User) {
    return await this.participationService.upvote(participationId, user.id);
  }

  @Delete('participations/:participationId/upvote')
  async unvote(@Param('participationId') participationId: string, @CurrentUser() user: User) {
    return await this.participationService.unvote(participationId, user.id);
  }

  @Get('published')
  @Public()
  findPublished(@Query() query: FilterProjectsDto): Promise<[Project[], number]> {
    return this.projectsService.findPublished(query);
  }

  @Get('by-slug/:slug')
  @Public()
  findBySlug(@Param('slug') slug: string): Promise<Project> {
    return this.projectsService.findBySlug(slug);
  }

  @Post(':projectId/participate')
  participate(
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
    @Body() dto: ParticipateProjectDto
  ): Promise<void> {
    return this.participationService.participate(projectId, user, dto);
  }

  @Get('me/participations')
  findUserParticipations(@CurrentUser() user: User): Promise<ProjectParticipation[]> {
    return this.participationService.findUserParticipations(user.id);
  }

  @Get('me/mentored-projects')
  findMentorProjects(@CurrentUser() user: User): Promise<Project[]> {
    return this.projectsService.findMentorProjects(user.id);
  }

  @Get(':participationId/participations')
  findOneParticipation(@Param('participationId') participationId: string): Promise<ProjectParticipation> {
    return this.participationService.findOne(participationId);
  }

  @Get(':projectId')
  @Rbac({ resource: 'projects', action: 'read' })
  findOne(@Param('projectId') projectId: string): Promise<Project> {
    return this.projectsService.findOne(projectId);
  }

  @Post(':projectId/participants/import-csv')
  @Rbac({ resource: 'projects', action: 'update' })
  @UseInterceptors(FileInterceptor('file', createCsvUploadOptions()))
  addParticipantsFromCsv(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File
  ): Promise<void> {
    return this.participationService.importParticipants(projectId, file);
  }

  @Post(':projectId/notifications')
  @Rbac({ resource: 'projects', action: 'update' })
  createNotification(
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateNotificationDto
  ): Promise<Notification> {
    return this.notificationService.create(projectId, user, dto);
  }

  @Post('notifications/:notificationId/send')
  @Rbac({ resource: 'projects', action: 'update' })
  send(@Param('notificationId') notificationId: string): Promise<Notification> {
    return this.notificationService.send(notificationId);
  }

  @Post(':projectId/gallery')
  @Rbac({ resource: 'projects', action: 'update' })
  @UseInterceptors(FileInterceptor('image', createDiskUploadOptions('./uploads/galleries')))
  addImage(@Param('projectId') projectId: string, @UploadedFile() file: Express.Multer.File): Promise<void> {
    return this.mediaService.addImage(projectId, file);
  }

  @Delete('gallery/:galleryId')
  @Rbac({ resource: 'projects', action: 'update' })
  removeImage(@Param('galleryId') galleryId: string): Promise<void> {
    return this.mediaService.removeImage(galleryId);
  }

  @Get('by-slug/:slug/gallery')
  @Public()
  findGallery(@Param('slug') slug: string): Promise<Gallery[]> {
    return this.mediaService.findGallery(slug);
  }

  @Patch(':projectId/publish')
  @Rbac({ resource: 'projects', action: 'update' })
  togglePublish(@Param('projectId') projectId: string): Promise<Project> {
    return this.projectsService.togglePublish(projectId);
  }

  @Post(':projectId/cover')
  @Rbac({ resource: 'projects', action: 'update' })
  @UseInterceptors(FileInterceptor('cover', createDiskUploadOptions('./uploads/projects')))
  addCover(@Param('projectId') projectId: string, @UploadedFile() file: Express.Multer.File): Promise<Project> {
    return this.mediaService.addCover(projectId, file);
  }

  @Patch(':projectId/highlight')
  @Rbac({ resource: 'projects', action: 'update' })
  toggleHighlight(@Param('projectId') projectId: string): Promise<Project> {
    return this.projectsService.toggleHighlight(projectId);
  }

  @Patch(':projectId')
  @Rbac({ resource: 'projects', action: 'update' })
  update(@Param('projectId') projectId: string, @Body() dto: UpdateProjectDto): Promise<Project> {
    return this.projectsService.update(projectId, dto);
  }

  @Delete(':projectId')
  @Rbac({ resource: 'projects', action: 'delete' })
  remove(@Param('projectId') projectId: string): Promise<void> {
    return this.projectsService.remove(projectId);
  }
}
