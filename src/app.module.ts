import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProfileModule } from './use-cases/profile/profile.module';
import { auth } from 'express-oauth2-jwt-bearer';
import { ProfileController } from './use-cases/profile/profile.controller';
import { TherapistModule } from './use-cases/therapist/therapist.module';
import { TherapistController } from './use-cases/therapist/therapist.controller';
import { ClientModule } from './use-cases/client/client.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/role.guard';
import { IdentityModule } from './modules/indentity/identity.module';
import { UserModule } from './modules/user/user.module';
import { ClientController } from './use-cases/client/client.controller';
import { AudioModule } from './use-cases/audio/audio.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { HooksModule } from './use-cases/hooks/hooks.module';
import { SeederModule } from './modules/seeder/seeder.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          uri: config.get<string>('DATABASE_URL'), // Loaded from .ENV
        };
      },
    }),
    ProfileModule,
    TherapistModule,
    ClientModule,
    IdentityModule,
    UserModule,
    AudioModule,
    TasksModule,
    HooksModule,
    SeederModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        auth({
          audience: process.env.AUTH0_AUDIENCE,
          issuerBaseURL: process.env.AUTH0_DOMAIN,
        }) as any,
      )
      .forRoutes(ProfileController, TherapistController, ClientController);
  }
}
