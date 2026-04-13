import { Controller, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Rbac } from '@musanzi/nestjs-session-auth';
import { createDiskUploadOptions } from '@/core/helpers/upload.helper';
import { Opportunity } from '../entities/opportunity.entity';
import { OpportunityMediaService } from '../services/opportunity-media.service';

@Controller('opportunities')
export class OpportunityMediaController {
  constructor(private readonly opportunityMediaService: OpportunityMediaService) {}

  @Post('id/:opportunityId/cover')
  @Rbac({ resource: 'opportunities', action: 'update' })
  @UseInterceptors(FileInterceptor('cover', createDiskUploadOptions('./uploads/opportunities')))
  addCover(@Param('opportunityId') opportunityId: string, @UploadedFile() file: Express.Multer.File): Promise<Opportunity> {
    return this.opportunityMediaService.addCover(opportunityId, file);
  }

  @Patch('id/:opportunityId/cover')
  @Rbac({ resource: 'opportunities', action: 'update' })
  @UseInterceptors(FileInterceptor('cover', createDiskUploadOptions('./uploads/opportunities')))
  updateCover(
    @Param('opportunityId') opportunityId: string,
    @UploadedFile() file: Express.Multer.File
  ): Promise<Opportunity> {
    return this.opportunityMediaService.updateCover(opportunityId, file);
  }
}
