import { Module } from '@nestjs/common';
import { QuestionsModule } from '../questions/questions.module';
import { SeederService } from './seeder.service';

@Module({
  imports: [QuestionsModule],
  providers: [SeederService],
})
export class SeederModule {}
