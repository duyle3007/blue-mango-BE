import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import mongoose from 'mongoose';
import { UserEnity } from '../user/user.schema';

export type IdentityDocument = Identity & Document;

@Schema()
export class Identity {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop({ index: true, unique: true })
  providerId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserEnity.name })
  @Type(() => UserEnity)
  user: UserEnity;
}

export const IdentitySchema = SchemaFactory.createForClass(Identity);
