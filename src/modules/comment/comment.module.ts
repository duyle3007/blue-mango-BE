import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentEntity, CommentSchema } from './comment.schema';
import { CommentService } from './comment.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CommentEntity.name,
        schema: CommentSchema,
      },
    ]),
  ],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
