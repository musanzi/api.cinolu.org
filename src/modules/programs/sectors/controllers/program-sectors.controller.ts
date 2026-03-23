import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProgramSectorsService } from '../services/sectors.service';
import { CreateSectorDto } from '../dto/create-sector.dto';
import { UpdateSectorDto } from '../dto/update-sector.dto';
import { ProgramSector } from '../entities/sector.entity';
import { QueryParams } from '../utils/query-params.type';
import { Public, Rbac } from '@musanzi/nestjs-session-auth';

@Controller('program-sectors')
export class ProgramSectorsController {
  constructor(private readonly programSectorsService: ProgramSectorsService) {}

  @Get('')
  @Public()
  findAll(): Promise<ProgramSector[]> {
    return this.programSectorsService.findAll();
  }

  @Post()
  @Rbac({ resource: 'programSectors', action: 'create' })
  create(@Body() dto: CreateSectorDto): Promise<ProgramSector> {
    return this.programSectorsService.create(dto);
  }

  @Get('paginated')
  @Rbac({ resource: 'programSectors', action: 'read' })
  findPaginated(@Query() query: QueryParams): Promise<[ProgramSector[], number]> {
    return this.programSectorsService.findPaginated(query);
  }

  @Get('id/:id')
  @Rbac({ resource: 'programSectors', action: 'read' })
  findOne(@Param('id') id: string): Promise<ProgramSector> {
    return this.programSectorsService.findOne(id);
  }

  @Patch('id/:id')
  @Rbac({ resource: 'programSectors', action: 'update' })
  update(@Param('id') id: string, @Body() dto: UpdateSectorDto): Promise<ProgramSector> {
    return this.programSectorsService.update(id, dto);
  }

  @Delete('id/:id')
  @Rbac({ resource: 'programSectors', action: 'delete' })
  remove(@Param('id') id: string): Promise<void> {
    return this.programSectorsService.remove(id);
  }
}
