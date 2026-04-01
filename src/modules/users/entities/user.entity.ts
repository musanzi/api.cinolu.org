import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { Venture } from '@/modules/ventures/entities/venture.entity';
import { AbstractEntity } from '@/core/helpers/abstract.entity';
import { Article } from '@/modules/blog/articles/entities/article.entity';
import { Comment } from '@/modules/blog/comments/entities/comment.entity';
import { Project } from '@/modules/projects/entities/project.entity';
import { ProjectParticipation } from '@/modules/projects/entities/project-participation.entity';
import { ProjectParticipationUpvote } from '@/modules/projects/entities/participation-upvote.entity';
import { Event } from '@/modules/events/entities/event.entity';
import { EventParticipation } from '@/modules/events/entities/event-participation.entity';
import { MentorProfile } from '@/modules/mentors/entities/mentor.entity';
import { Notification } from '@/modules/notifications/entities/notification.entity';
import { UserStatus } from '../types/user-status.enum';

@Entity()
export class User extends AbstractEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({ type: 'text', nullable: true })
  biography: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  birth_date: Date;

  @Column({ nullable: true })
  google_image: string;

  @Column({ nullable: true })
  profile: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.OTHER
  })
  status: UserStatus;

  @Column({ unique: true, nullable: true })
  referral_code: string;

  @ManyToOne(() => User, (user) => user.referrals, { nullable: true })
  referred_by: User;

  @OneToMany(() => User, (user) => user.referred_by, { nullable: true })
  referrals: User[];

  @OneToMany(() => Venture, (venture) => venture.owner)
  ventures: Venture[];

  @ManyToMany(() => Role)
  @JoinTable()
  roles: Role[];

  @OneToMany(() => ProjectParticipation, (participation) => participation.user)
  project_participations: ProjectParticipation[];

  @OneToMany(() => ProjectParticipationUpvote, (upvote) => upvote.user)
  project_participation_upvotes: ProjectParticipationUpvote[];

  @OneToMany(() => EventParticipation, (participation) => participation.user)
  event_participations: EventParticipation[];

  @OneToMany(() => Project, (project) => project.project_manager)
  managed_projects: Project[];

  @OneToMany(() => Event, (event) => event.event_manager)
  managed_events: Event[];

  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @OneToOne(() => MentorProfile, (mp) => mp.owner)
  mentor_profile: MentorProfile;

  @OneToMany(() => Notification, (notification) => notification.sender)
  sent_notifications: Notification[];
}
