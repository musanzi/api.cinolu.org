import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import slugify from 'slugify';
import { Opportunity } from '../entities/opportunity.entity';

@EventSubscriber()
export class OpportunitySubscriber implements EntitySubscriberInterface<Opportunity> {
  listenTo() {
    return Opportunity;
  }

  async beforeInsert(event: InsertEvent<Opportunity>): Promise<void> {
    const { title } = event.entity;
    event.entity.slug = slugify(title, { lower: true });
  }

  async beforeUpdate(event: UpdateEvent<Opportunity>): Promise<void> {
    const { title } = event.entity;
    if (!title) return;
    event.entity.slug = slugify(title, { lower: true });
  }
}
