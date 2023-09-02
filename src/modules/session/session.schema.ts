import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import mongoose from 'mongoose';
import { UserEnity } from '../user/user.schema';
import { CommentEntity } from '../comment/comment.schema';
import { QuestionEntity } from '../questions/questions.schema';

export type SessionDocument = SessionEntity & Document;

@Schema({ _id: false })
class SessionQuestion {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: QuestionEntity.name })
  @Type(() => QuestionEntity)
  question: QuestionEntity;

  @Prop({ type: String })
  answer: string;
}
const SessionQuestionSchema = SchemaFactory.createForClass(SessionQuestion);

@Schema()
export class SessionEntity {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop({ type: [SessionQuestionSchema] })
  questions: SessionQuestion[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: CommentEntity.name }])
  comments: CommentEntity;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserEnity.name })
  @Type(() => UserEnity)
  author: UserEnity;

  @Prop({
    type: Date,
  })
  startTime: Date;

  @Prop({ type: Number })
  duration: number;

  @Prop({ type: Number })
  pause: number;

  @Prop({ type: Number })
  interruptions: number;
}

export const SessionSchema = SchemaFactory.createForClass(SessionEntity);
