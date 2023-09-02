import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';

export type QuestionTopicDocument = QuestionTopicEntity & Document;

@Schema()
export class QuestionTopicEntity {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop({ index: true, unique: true })
  key: string;

  @Prop()
  description: string;
}

export const QuestionTopicSchema =
  SchemaFactory.createForClass(QuestionTopicEntity);
