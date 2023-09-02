import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';

export type QuestionTypeDocument = QuestionTypeEntity & Document;

@Schema()
export class QuestionTypeEntity {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop({ index: true, unique: true })
  key: string;

  @Prop()
  description: string;
}

export const QuestionTypeSchema =
  SchemaFactory.createForClass(QuestionTypeEntity);
