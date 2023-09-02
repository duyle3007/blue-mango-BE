import { Module } from '@nestjs/common';
import { IdentityModule } from 'src/modules/indentity/identity.module';
import { UserModule } from 'src/modules/user/user.module';
import { ProfileController } from './profile.controller';

@Module({
  imports: [UserModule, IdentityModule],
  controllers: [ProfileController],
})
export class ProfileModule {}
