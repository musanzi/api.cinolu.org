import { BadRequestException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { OpportunityMediaService } from '@/features/opportunities/services/opportunity-media.service';

describe('OpportunityMediaService', () => {
  let unlinkSpy: jest.SpiedFunction<typeof fs.unlink>;

  const setup = () => {
    const opportunitiesService = {
      findOne: jest.fn(),
      setCover: jest.fn()
    } as any;
    const service = new OpportunityMediaService(opportunitiesService);
    return { service, opportunitiesService };
  };

  beforeEach(() => {
    unlinkSpy = jest.spyOn(fs, 'unlink').mockResolvedValue(undefined);
  });

  afterEach(() => {
    unlinkSpy.mockRestore();
  });

  it('adds a cover', async () => {
    const { service, opportunitiesService } = setup();
    opportunitiesService.findOne.mockResolvedValue({ id: 'o1', cover: null });
    opportunitiesService.setCover.mockResolvedValue({ id: 'o1', cover: 'new.png' });
    await expect(service.addCover('o1', { filename: 'new.png' } as any)).resolves.toEqual({
      id: 'o1',
      cover: 'new.png'
    });
    expect(unlinkSpy).not.toHaveBeenCalled();
  });

  it('replaces the old cover during update', async () => {
    const { service, opportunitiesService } = setup();
    opportunitiesService.findOne.mockResolvedValue({ id: 'o1', cover: 'old.png' });
    opportunitiesService.setCover.mockResolvedValue({ id: 'o1', cover: 'new.png' });
    await expect(service.updateCover('o1', { filename: 'new.png' } as any)).resolves.toEqual({
      id: 'o1',
      cover: 'new.png'
    });
    expect(unlinkSpy).toHaveBeenCalledWith('./uploads/opportunities/old.png');
  });

  it('throws on add cover failure', async () => {
    const { service, opportunitiesService } = setup();
    opportunitiesService.findOne.mockRejectedValue(new Error('bad'));
    await expect(service.addCover('o1', { filename: 'new.png' } as any)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws on update cover failure', async () => {
    const { service, opportunitiesService } = setup();
    opportunitiesService.setCover.mockRejectedValue(new Error('bad'));
    opportunitiesService.findOne.mockResolvedValue({ id: 'o1', cover: null });
    await expect(service.updateCover('o1', { filename: 'new.png' } as any)).rejects.toBeInstanceOf(
      BadRequestException
    );
  });
});
