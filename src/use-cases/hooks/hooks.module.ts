import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { IdentityModule } from 'src/modules/indentity/identity.module';
import { UserModule } from 'src/modules/user/user.module';
import { HooksController } from './hooks.controller';

@Module({
  imports: [UserModule, HttpModule, IdentityModule],
  controllers: [HooksController],
  providers: [],
})
export class HooksModule {}
