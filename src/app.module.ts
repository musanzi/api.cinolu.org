import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './core/auth/auth.module';
import { BlogModule } from './features/blog/blog.module';
import { EventsModule } from './features/events/events.module';
import { HighlightsModule } from './features/highlights/highlights.module';
import { ProgramsModule } from './features/programs/programs.module';
import { ProjectsModule } from './features/projects/projects.module';
import { StatsModule } from './features/stats/stats.module';
import { SubprogramsModule } from './features/subprograms/subprograms.module';
import { UsersModule } from './features/users/users.module';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import { SessionAuthGuard, RbacGuard } from '@musanzi/nestjs-session-auth';
import { MentorsModule } from './features/mentors/mentors.module';
import { VenturesModule } from './features/ventures/ventures.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { GalleriesModule } from './shared/galleries/galleries.module';
import { DatabaseModule } from './shared/database/database.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EmailModule } from './shared/email/email.module';
import { JwtModule } from './shared/jwt/jwt.module';
import { StaticModule } from './shared/static/static.module';
import { ConfigModule } from './shared/config/config.module';
import { ResourcesModule } from './features/projects/resources/resources.module';
import { OpportunitiesModule } from './features/opportunities/opportunities.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    VenturesModule,
    BlogModule,
    StatsModule,
    HighlightsModule,
    GalleriesModule,
    ProgramsModule,
    SubprogramsModule,
    EventsModule,
    ProjectsModule,
    MentorsModule,
    NotificationsModule,
    OpportunitiesModule,
    EmailModule,
    JwtModule,
    StaticModule,
    ResourcesModule,
    ConfigModule
  ],
  providers: [
    { provide: APP_GUARD, useClass: SessionAuthGuard },
    { provide: APP_GUARD, useClass: RbacGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor }
  ]
})
export class AppModule {}
