import { AbstractEntity } from '@/core/helpers/abstract.entity';
import { Venture } from '@/modules/ventures/entities/venture.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AiCoach } from './ai-coach.entity';
import { CoachMessage } from './coach-message.entity';

@Entity('coach_conversation')
export class CoachConversation extends AbstractEntity {
  @Column({ default: 'active' })
  status: string;

  @ManyToOne(() => AiCoach, (coach) => coach.conversations)
  @JoinColumn()
  coach: AiCoach;

  @ManyToOne(() => Venture)
  @JoinColumn()
  venture: Venture;

  @OneToMany(() => CoachMessage, (message) => message.conversation)
  messages: CoachMessage[];
}
