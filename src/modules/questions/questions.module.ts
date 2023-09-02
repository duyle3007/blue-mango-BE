import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  QuestionTypeEntity,
  QuestionTypeSchema,
} from './question-types.schema';
import {
  QuestionTopicEntity,
  QuestionTopicSchema,
} from './questions-topics.schema';
import { QuestionEntity, QuestionSchema } from './questions.schema';
import { QuestionsService } from './questions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: QuestionEntity.name,
        schema: QuestionSchema,
      },
      {
        name: QuestionTopicEntity.name,
        schema: QuestionTopicSchema,
      },
      {
        name: QuestionTypeEntity.name,
        schema: QuestionTypeSchema,
      },
    ]),
  ],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
