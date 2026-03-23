import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProgramSectorsService } from '@/modules/programs/sectors/services/sectors.service';

const makeQueryBuilder = (result: [any[], number] = [[], 0]) => ({
  orderBy: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue(result),
  getOneOrFail: jest.fn().mockResolvedValue({ id: 's1' })
});

describe('ProgramSectorsService', () => {
  const setup = () => {
    const queryBuilder = makeQueryBuilder([[{ id: 's1' }], 1]);
    const sectorRepository = {
      save: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      softDelete: jest.fn()
    } as any;
    const service = new ProgramSectorsService(sectorRepository);
    return { service, sectorRepository, queryBuilder };
  };

  it('creates a sector', async () => {
    const { service, sectorRepository } = setup();
    sectorRepository.save.mockResolvedValue({ id: 's1', name: 'Health' });
    await expect(service.create({ name: 'Health' })).resolves.toEqual({ id: 's1', name: 'Health' });
  });

  it('throws on create failure', async () => {
    const { service, sectorRepository } = setup();
    sectorRepository.save.mockRejectedValue(new Error('bad'));
    await expect(service.create({ name: 'Health' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('finds all sectors', async () => {
    const { service, sectorRepository } = setup();
    sectorRepository.find.mockResolvedValue([{ id: 's1' }]);
    await expect(service.findAll()).resolves.toEqual([{ id: 's1' }]);
  });

  it('finds paginated sectors', async () => {
    const { service, queryBuilder } = setup();
    await expect(service.findPaginated({ page: 2, q: 'hea' } as any)).resolves.toEqual([[{ id: 's1' }], 1]);
    expect(queryBuilder.where).toHaveBeenCalledWith('c.name LIKE :q', { q: '%hea%' });
    expect(queryBuilder.skip).toHaveBeenCalledWith(10);
    expect(queryBuilder.take).toHaveBeenCalledWith(10);
  });

  it('finds one sector', async () => {
    const { service } = setup();
    await expect(service.findOne('s1')).resolves.toEqual({ id: 's1' });
  });

  it('throws on missing sector', async () => {
    const { service, queryBuilder } = setup();
    queryBuilder.getOneOrFail.mockRejectedValue(new Error('bad'));
    await expect(service.findOne('s1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates a sector', async () => {
    const { service, sectorRepository } = setup();
    jest.spyOn(service, 'findOne').mockResolvedValue({ id: 's1', name: 'Old' } as any);
    sectorRepository.save.mockResolvedValue({ id: 's1', name: 'New' });
    await expect(service.update('s1', { name: 'New' })).resolves.toEqual({ id: 's1', name: 'New' });
  });

  it('removes a sector', async () => {
    const { service, sectorRepository } = setup();
    jest.spyOn(service, 'findOne').mockResolvedValue({ id: 's1' } as any);
    sectorRepository.softDelete.mockResolvedValue(undefined);
    await expect(service.remove('s1')).resolves.toBeUndefined();
  });
});
