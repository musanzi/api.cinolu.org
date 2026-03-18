import { AbstractEntity } from '@/core/helpers/abstract.entity';
import { Project } from '@/modules/projects/entities/project.entity';
import { Phase } from '@/modules/projects/phases/entities/phase.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

export enum ResourceCategory {
  GUIDE = 'guide',
  TEMPLATE = 'template',
  LEGAL = 'legal',
  PITCH = 'pitch',
  FINANCIAL = 'financial',
  REPORT = 'report',
  OTHER = 'other'
}

@Entity()
export class Resource extends AbstractEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  file: string;

  @Column({ type: 'enum', enum: ResourceCategory })
  category: ResourceCategory;

  @ManyToOne(() => Project, (project) => project.resources, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  project?: Project;

  @ManyToOne(() => Phase, (phase) => phase.resources, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  phase?: Phase;
}
