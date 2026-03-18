import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ResourceCategory, Resource } from '@/modules/projects/resources/entities/resource.entity';
import { ResourcesService } from '@/modules/projects/resources/services/resources.service';

const makeQueryBuilder = (result: [Resource[], number] = [[{ id: 'r1' } as Resource], 1]) => ({
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue(result)
});

describe('ResourcesService', () => {
  const setup = () => {
    const queryBuilder = makeQueryBuilder();
    const resourceRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneOrFail: jest.fn(),
      softDelete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder)
    } as any;
    const projectsService = { findOne: jest.fn() } as any;
    const phasesService = { findOne: jest.fn() } as any;
    const service = new ResourcesService(resourceRepository, projectsService, phasesService);
    return { service, resourceRepository, projectsService, phasesService, queryBuilder };
  };

  it('creates a project-scoped resource', async () => {
    const { service, resourceRepository, projectsService } = setup();
    projectsService.findOne.mockResolvedValue({ id: 'project-1' });
    resourceRepository.create.mockReturnValue({ title: 'Guide' });
    resourceRepository.save.mockResolvedValue({ id: 'r1' });

    await expect(
      service.create(
        {
          title: 'Guide',
          description: 'desc',
          category: ResourceCategory.GUIDE,
          project_id: 'project-1'
        },
        { filename: 'guide.pdf' } as any
      )
    ).resolves.toEqual({ id: 'r1' });
    expect(resourceRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        file: 'guide.pdf',
        project: { id: 'project-1' },
        phase: null
      })
    );
  });

  it('creates a phase-scoped resource', async () => {
    const { service, resourceRepository, phasesService } = setup();
    phasesService.findOne.mockResolvedValue({ id: 'phase-1' });
    resourceRepository.create.mockReturnValue({ title: 'Template' });
    resourceRepository.save.mockResolvedValue({ id: 'r2' });

    await expect(
      service.create(
        {
          title: 'Template',
          description: 'desc',
          category: ResourceCategory.TEMPLATE,
          phase_id: 'phase-1'
        },
        { filename: 'template.docx' } as any
      )
    ).resolves.toEqual({ id: 'r2' });
  });

  it('finds published project resources', async () => {
    const { service, projectsService, queryBuilder } = setup();
    projectsService.findOne.mockResolvedValue({ id: 'project-1' });

    await expect(service.findByProject('project-1', { page: 2, category: ResourceCategory.GUIDE } as any)).resolves.toEqual([[{ id: 'r1' }], 1]);
    expect(queryBuilder.where).toHaveBeenCalledWith('resource.projectId = :scopeId', { scopeId: 'project-1' });
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(1, 'resource.is_published = :isPublished', {
      isPublished: true
    });
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(2, 'resource.category = :category', {
      category: ResourceCategory.GUIDE
    });
    expect(queryBuilder.skip).toHaveBeenCalledWith(20);
  });

  it('finds published phase resources', async () => {
    const { service, phasesService, queryBuilder } = setup();
    phasesService.findOne.mockResolvedValue({ id: 'phase-1' });

    await expect(service.findByPhase('phase-1', {} as any)).resolves.toEqual([[{ id: 'r1' }], 1]);
    expect(queryBuilder.where).toHaveBeenCalledWith('resource.phaseId = :scopeId', { scopeId: 'phase-1' });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('resource.is_published = :isPublished', {
      isPublished: true
    });
  });

  it('finds one resource', async () => {
    const { service, resourceRepository } = setup();
    resourceRepository.findOneOrFail.mockResolvedValue({ id: 'r1' });
    await expect(service.findOne('r1')).resolves.toEqual({ id: 'r1' });
  });

  it('throws not found for missing resource', async () => {
    const { service, resourceRepository } = setup();
    resourceRepository.findOneOrFail.mockRejectedValue(new Error('missing'));
    await expect(service.findOne('r1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates resource metadata', async () => {
    const { service, resourceRepository } = setup();
    jest.spyOn(service, 'findOne').mockResolvedValue({ id: 'r1', tags: ['old'] } as any);
    resourceRepository.save.mockResolvedValue({ id: 'r1', title: 'Updated' });
    await expect(service.update('r1', { title: 'Updated' } as any)).resolves.toEqual({ id: 'r1', title: 'Updated' });
  });

  it('updates resource file', async () => {
    const { service, resourceRepository } = setup();
    jest.spyOn(service, 'findOne').mockResolvedValue({ id: 'r1', file: 'old.pdf' } as any);
    resourceRepository.save.mockResolvedValue({ id: 'r1', file: 'new.pdf' });
    await expect(service.setFile('r1', 'new.pdf')).resolves.toEqual({ id: 'r1', file: 'new.pdf' });
  });

  it('soft deletes a resource', async () => {
    const { service, resourceRepository } = setup();
    jest.spyOn(service, 'findOne').mockResolvedValue({ id: 'r1' } as any);
    resourceRepository.softDelete.mockResolvedValue(undefined);
    await expect(service.remove('r1')).resolves.toBeUndefined();
    expect(resourceRepository.softDelete).toHaveBeenCalledWith('r1');
  });

  it('wraps unexpected failures in bad request', async () => {
    const { service, resourceRepository, projectsService, queryBuilder } = setup();
    projectsService.findOne.mockResolvedValue({ id: 'project-1' });
    queryBuilder.getManyAndCount.mockRejectedValue(new Error('bad'));
    await expect(service.findByProject('project-1', {} as any)).rejects.toBeInstanceOf(NotFoundException);

    jest.spyOn(service, 'findOne').mockRejectedValue(new Error('bad'));
    await expect(service.update('r1', {} as any)).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.remove('r1')).rejects.toBeInstanceOf(BadRequestException);
    resourceRepository.save.mockRejectedValue(new Error('bad'));
    await expect(service.create({ title: 'x', description: 'y', category: ResourceCategory.OTHER, project_id: 'p1' }, { filename: 'x.pdf' } as any)).rejects.toBeInstanceOf(BadRequestException);
  });
});
