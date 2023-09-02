import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import mongoose from 'mongoose';
import { UserEnity } from '../user/user.schema';

export type CommentDocument = CommentEntity & Document;

@Schema({
  timestamps: true,
})
export class CommentEntity {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  content: string;

  @Prop({ type: Boolean, default: true })
  unread: boolean;

  @Prop({ type: [{ type: String }] })
  tags: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserEnity.name })
  @Type(() => UserEnity)
  author: UserEnity;
}

export const CommentSchema = SchemaFactory.createForClass(CommentEntity);
