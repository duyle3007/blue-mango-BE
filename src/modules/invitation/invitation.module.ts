import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvitationEntity, InvitationSchema } from './invitation.schema';
import { InvitationService } from './invitation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InvitationEntity.name, schema: InvitationSchema },
    ]),
  ],
  providers: [InvitationService],
  exports: [InvitationService],
})
export class InvitationModule {}
