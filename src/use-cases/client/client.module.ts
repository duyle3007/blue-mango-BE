import { Module } from '@nestjs/common';
import { CommentModule } from 'src/modules/comment/comment.module';
import { FileModule } from 'src/modules/file/file.module';
import { InvitationModule } from 'src/modules/invitation/invitation.module';
import { QuestionsModule } from 'src/modules/questions/questions.module';
import { RequestModule } from 'src/modules/request/request.module';
import { SessionModule } from 'src/modules/session/session.module';
import { UserModule } from 'src/modules/user/user.module';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';

@Module({
  imports: [
    InvitationModule,
    UserModule,
    FileModule,
    RequestModule,
    SessionModule,
    CommentModule,
    QuestionsModule,
  ],
  controllers: [ClientController],
  providers: [ClientService],
})
export class ClientModule {}
