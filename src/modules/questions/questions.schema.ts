import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { QuestionTypeEntity } from './question-types.schema';
import { QuestionTopicEntity } from './questions-topics.schema';

export type QuestionDocument = QuestionEntity & Document;

@Schema()
export class QuestionEntity {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop()
  label: string;

  @Prop([String])
  tags: string[];

  @Prop({
    type: String,
    ref: QuestionTypeEntity.name,
  })
  type: QuestionTypeEntity;

  @Prop({
    type: String,
    ref: QuestionTopicEntity.name,
  })
  topic: QuestionTopicEntity;
}

export const QuestionSchema = SchemaFactory.createForClass(QuestionEntity);

QuestionSchema.index({ type: 1, topic: 1 }, { unique: true });
