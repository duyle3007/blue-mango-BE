import { Module } from '@nestjs/common';
import { FileModule } from '../file/file.module';
import { RequestModule } from '../request/request.module';
import { TasksService } from './tasks.service';

@Module({
  imports: [FileModule, RequestModule],
  providers: [TasksService],
})
export class TasksModule {}
