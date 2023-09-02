import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestEntity, RequestSchema } from './request.schema';
import { RequestService } from './request.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RequestEntity.name, schema: RequestSchema },
    ]),
  ],
  providers: [RequestService],
  exports: [RequestService],
})
export class RequestModule {}
