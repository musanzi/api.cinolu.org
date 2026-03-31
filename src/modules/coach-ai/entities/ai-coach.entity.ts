import { AbstractEntity } from '@/core/helpers/abstract.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { CoachConversation } from './coach-conversation.entity';

@Entity('ai_coach')
export class AiCoach extends AbstractEntity {
  @Column()
  name: string;

  @Column({ type: 'text' })
  profile: string;

  @Column({ type: 'text' })
  role: string;

  @Column({ type: 'simple-json' })
  expected_outputs: string[];

  @Column({ default: 'llama3.2:3b' })
  model: string;

  @Column({ default: 'active' })
  status: string;

  @OneToMany(() => CoachConversation, (conversation) => conversation.coach)
  conversations: CoachConversation[];
}
