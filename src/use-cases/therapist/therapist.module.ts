import { Module } from '@nestjs/common';
import { TherapistService } from './therapist.service';
import { TherapistController } from './therapist.controller';
import { Auth0Module } from 'src/modules/auth0/auth0.module';
import { MailModule } from 'src/modules/mail/mail.module';
import { IdentityModule } from 'src/modules/indentity/identity.module';
import { UserModule } from 'src/modules/user/user.module';
import { InvitationModule } from 'src/modules/invitation/invitation.module';
import { FileModule } from 'src/modules/file/file.module';
import { RequestModule } from 'src/modules/request/request.module';
import { SessionModule } from 'src/modules/session/session.module';

@Module({
  imports: [
    Auth0Module,
    MailModule,
    IdentityModule,
    UserModule,
    InvitationModule,
    FileModule,
    RequestModule,
    SessionModule,
  ],
  providers: [TherapistService],
  controllers: [TherapistController],
})
export class TherapistModule {}
