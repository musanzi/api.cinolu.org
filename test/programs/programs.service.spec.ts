import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProgramsService } from '@/modules/programs/services/programs.service';

const makeQueryBuilder = (result: [any[], number] = [[], 0]) => ({
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue(result)
});

describe('ProgramsService', () => {
  const setup = () => {
    const queryBuilder = makeQueryBuilder([[{ id: 'p1' }], 1]);
    const programRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneOrFail: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      softDelete: jest.fn()
    } as any;
    const service = new ProgramsService(programRepository);
    return { service, programRepository, queryBuilder };
  };

  it('creates program', async () => {
    const { service, programRepository } = setup();
    programRepository.create.mockReturnValue({ name: 'Program' });
    programRepository.save.mockResolvedValue({ id: 'p1' });
    await expect(service.create({ name: 'Program', category: 'c1', sector: 's1' } as any)).resolves.toEqual({ id: 'p1' });
    expect(programRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ category: { id: 'c1' }, sector: { id: 's1' } })
    );
  });

  it('throws on create failure', async () => {
    const { service, programRepository } = setup();
    programRepository.create.mockImplementation(() => {
      throw new Error('bad');
    });
    await expect(service.create({} as any)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('finds published programs', async () => {
    const { service, programRepository } = setup();
    programRepository.find.mockResolvedValue([{ id: 'p1' }]);
    await expect(service.findPublished()).resolves.toEqual([{ id: 'p1' }]);
  });

  it('throws when findPublished fails', async () => {
    const { service, programRepository } = setup();
    programRepository.find.mockRejectedValue(new Error('bad'));
    await expect(service.findPublished()).rejects.toBeInstanceOf(NotFoundException);
  });

  it('finds all published basic list', async () => {
    const { service, programRepository } = setup();
    programRepository.find.mockResolvedValue([{ id: 'p1' }]);
    await expect(service.findAll()).resolves.toEqual([{ id: 'p1' }]);
  });

  it('finds program by slug', async () => {
    const { service, programRepository } = setup();
    programRepository.findOneOrFail.mockResolvedValue({ id: 'p1', slug: 'slug' });
    await expect(service.findBySlug('slug')).resolves.toEqual({ id: 'p1', slug: 'slug' });
  });

  it('throws on findBySlug failure', async () => {
    const { service, programRepository } = setup();
    programRepository.findOneOrFail.mockRejectedValue(new Error('bad'));
    await expect(service.findBySlug('slug')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('toggles highlight', async () => {
    const { service, programRepository } = setup();
    jest.spyOn(service, 'findOne').mockResolvedValue({ id: 'p1', is_highlighted: false } as any);
    programRepository.save.mockResolvedValue({ id: 'p1', is_highlighted: true });
    await expect(service.highlight('p1')).resolves.toEqual({ id: 'p1', is_highlighted: true });
  });

  it('toggles publish', async () => {
    const { service, programRepository } = setup();
    jest.spyOn(service, 'findOne').mockResolvedValue({ id: 'p1', is_published: false } as any);
    programRepository.save.mockResolvedValue({ id: 'p1', is_published: true });
    await expect(service.togglePublish('p1')).resolves.toEqual({ id: 'p1', is_published: true });
  });

  it('finds filtered with all filter options', async () => {
    const { service, queryBuilder } = setup();
    await expect(service.findFiltered({ page: 2, q: 'abc', filter: 'published' } as any)).resolves.toEqual([
      [{ id: 'p1' }],
      1
    ]);
    await service.findFiltered({ filter: 'drafts' } as any);
    await service.findFiltered({ filter: 'highlighted' } as any);
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('p.is_published = :isPublished', { isPublished: true });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('p.is_published = :isPublished', { isPublished: false });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('p.is_highlighted = :isHighlighted', { isHighlighted: true });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('(p.name LIKE :q OR p.description LIKE :q)', { q: '%abc%' });
    expect(queryBuilder.skip).toHaveBeenCalledWith(10);
    expect(queryBuilder.take).toHaveBeenCalledWith(10);
  });

  it('throws on findFiltered failure', async () => {
    const { service, queryBuilder } = setup();
    queryBuilder.getManyAndCount.mockRejectedValue(new Error('bad'));
    await expect(service.findFiltered({} as any)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('sets logo', async () => {
    const { service, programRepository } = setup();
    jest.spyOn(service, 'findOne').mockResolvedValue({ id: 'p1' } as any);
    programRepository.save.mockResolvedValue({ id: 'p1', logo: 'logo.png' });
    await expect(service.setLogo('p1', 'logo.png')).resolves.toEqual({ id: 'p1', logo: 'logo.png' });
  });

  it('finds one by id', async () => {
    const { service, programRepository } = setup();
    programRepository.findOneOrFail.mockResolvedValue({ id: 'p1' });
    await expect(service.findOne('p1')).resolves.toEqual({ id: 'p1' });
  });

  it('throws on findOne failure', async () => {
    const { service, programRepository } = setup();
    programRepository.findOneOrFail.mockRejectedValue(new Error('bad'));
    await expect(service.findOne('p1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates program', async () => {
    const { service, programRepository } = setup();
    jest.spyOn(service, 'findOne').mockResolvedValue({ id: 'p1', category: { id: 'c1' }, sector: { id: 's1' } } as any);
    programRepository.save.mockResolvedValue({ id: 'p1', name: 'new' });
    await expect(service.update('p1', { name: 'new', category: 'c2', sector: 's2' } as any)).resolves.toEqual({
      id: 'p1',
      name: 'new'
    });
    expect(programRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ category: { id: 'c2' }, sector: { id: 's2' } })
    );
  });

  it('throws on update failure', async () => {
    const { service } = setup();
    jest.spyOn(service, 'findOne').mockRejectedValue(new Error('bad'));
    await expect(service.update('p1', {} as any)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('removes program', async () => {
    const { service, programRepository } = setup();
    jest.spyOn(service, 'findOne').mockResolvedValue({ id: 'p1' } as any);
    programRepository.softDelete.mockResolvedValue(undefined);
    await expect(service.remove('p1')).resolves.toBeUndefined();
  });
});
