import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Identity, IdentitySchema } from './identity.schema';
import { IdentityService } from './identity.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Identity.name, schema: IdentitySchema },
    ]),
  ],
  providers: [IdentityService],
  exports: [IdentityService],
})
export class IdentityModule {}
