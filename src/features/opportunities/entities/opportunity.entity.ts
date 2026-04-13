import { AbstractEntity } from '@/core/helpers/abstract.entity';
import { Column, Entity } from 'typeorm';

export enum OpportunityLanguage {
  FR = 'fr',
  EN = 'en'
}

@Entity()
export class Opportunity extends AbstractEntity {
  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'longtext' })
  description: string;

  @Column({ nullable: true })
  cover: string;

  @Column({ type: 'date' })
  due_date: Date;

  @Column()
  link: string;

  @Column({ type: 'enum', enum: OpportunityLanguage })
  language: OpportunityLanguage;
}
