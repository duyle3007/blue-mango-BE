import { Module } from '@nestjs/common';
import { FileModule } from 'src/modules/file/file.module';
import { AudioController } from './audio.controller';

@Module({
  imports: [FileModule],
  controllers: [AudioController],
})
export class AudioModule {}
