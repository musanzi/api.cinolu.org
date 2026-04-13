import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Public, Rbac } from '@musanzi/nestjs-session-auth';
import { CreateOpportunityDto } from '../dto/create-opportunity.dto';
import { FilterOpportunitiesDto } from '../dto/filter-opportunities.dto';
import { UpdateOpportunityDto } from '../dto/update-opportunity.dto';
import { Opportunity } from '../entities/opportunity.entity';
import { OpportunitiesService } from '../services/opportunities.service';

@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Post()
  @Rbac({ resource: 'opportunities', action: 'create' })
  create(@Body() dto: CreateOpportunityDto): Promise<Opportunity> {
    return this.opportunitiesService.create(dto);
  }

  @Get()
  @Public()
  findAll(@Query() query: FilterOpportunitiesDto): Promise<Opportunity[]> {
    return this.opportunitiesService.findAll(query);
  }

  @Get('by-slug/:slug')
  @Public()
  findOne(@Param('slug') slug: string): Promise<Opportunity> {
    return this.opportunitiesService.findOne(slug);
  }

  @Patch('id/:opportunityId')
  @Rbac({ resource: 'opportunities', action: 'update' })
  update(@Param('opportunityId') opportunityId: string, @Body() dto: UpdateOpportunityDto): Promise<Opportunity> {
    return this.opportunitiesService.update(opportunityId, dto);
  }

  @Delete('id/:opportunityId')
  @Rbac({ resource: 'opportunities', action: 'delete' })
  remove(@Param('opportunityId') opportunityId: string): Promise<void> {
    return this.opportunitiesService.remove(opportunityId);
  }
}
