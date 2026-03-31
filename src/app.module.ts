import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './core/auth/auth.module';
import { BlogModule } from './modules/blog/blog.module';
import { EventsModule } from './modules/events/events.module';
import { HighlightsModule } from './modules/highlights/highlights.module';
import { ProgramsModule } from './modules/programs/programs.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { StatsModule } from './modules/stats/stats.module';
import { SubprogramsModule } from './modules/subprograms/subprograms.module';
import { UsersModule } from './modules/users/users.module';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import { SessionAuthGuard, RbacGuard } from '@musanzi/nestjs-session-auth';
import { MentorsModule } from './modules/mentors/mentors.module';
import { VenturesModule } from './modules/ventures/ventures.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { GalleriesModule } from './shared/galleries/galleries.module';
import { DatabaseModule } from './shared/database/database.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EmailModule } from './shared/email/email.module';
import { JwtModule } from './shared/jwt/jwt.module';
import { StaticModule } from './shared/static/static.module';
import { ConfigModule } from './shared/config/config.module';
import { ResourcesModule } from './modules/projects/resources/resources.module';
import { CoachAiModule } from './modules/coach-ai/coach-ai.module';

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
    EmailModule,
    JwtModule,
    StaticModule,
    ResourcesModule,
    ConfigModule,
    CoachAiModule
  ],
  providers: [
    { provide: APP_GUARD, useClass: SessionAuthGuard },
    { provide: APP_GUARD, useClass: RbacGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor }
  ]
})
export class AppModule {}
