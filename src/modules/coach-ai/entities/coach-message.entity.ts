import { AbstractEntity } from '@/core/helpers/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CoachConversation } from './coach-conversation.entity';

@Entity('coach_message')
export class CoachMessage extends AbstractEntity {
  @Column()
  role: string;

  @Column({ default: 'USER_MESSAGE' })
  output_type: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'simple-json' })
  payload: Record<string, unknown>;

  @ManyToOne(() => CoachConversation, (conversation) => conversation.messages)
  @JoinColumn()
  conversation: CoachConversation;
}
