import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import RequestStatus from './domain/request-status.enum';
import mongoose from 'mongoose';
import { UserEnity } from '../user/user.schema';

export type RequestDocument = RequestEntity & Document;

@Schema({ timestamps: true })
export class RequestEntity {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop({
    enum: [RequestStatus.ACCEPT, RequestStatus.REJECT, RequestStatus.PENDING],
    default: RequestStatus.PENDING,
  })
  status: string;

  @Prop(
    raw({
      fileName: { type: String },
      clientEmail: { type: String },
      therapistId: { type: String },
    }),
  )
  meta?: Record<string, string>;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserEnity.name })
  @Type(() => UserEnity)
  therapist: UserEnity;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserEnity.name })
  @Type(() => UserEnity)
  client: UserEnity;

  @Prop()
  audioId: string;
}

export const RequestSchema = SchemaFactory.createForClass(RequestEntity);
