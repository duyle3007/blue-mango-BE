import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Transform, Type } from 'class-transformer';
import mongoose, { Document } from 'mongoose';
import UserRole from './domain/user-role.enum';
import UserStatus from './domain/user-status.enum';
import {
  MAXTIME_PER_DAY_DEFAULT,
  MAXTIME_PER_SESSION_DEFAULT,
} from 'src/constant/course';

@Schema({ _id: false })
export class UserCourse {
  @Prop({ type: Number })
  totalTime: number;

  @Prop({ type: Number, default: MAXTIME_PER_DAY_DEFAULT })
  maxTimePerDay: number;

  @Prop({ type: Number, default: MAXTIME_PER_SESSION_DEFAULT })
  maxTimePerSession: number;

  @Prop({ type: Date })
  startDate: Date;

  @Prop({ type: Date })
  endDate: Date;

  @Prop({ type: Boolean, default: false })
  shouldReset: boolean;
}

const UserCourseSchema = SchemaFactory.createForClass(UserCourse);

export type UserDocument = UserEnity & Document;

@Schema()
export class UserEnity {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  nickname: string;

  @Prop()
  gender: string;

  @Prop()
  address1: string;

  @Prop()
  address2: string;

  @Prop()
  country: string;

  @Prop()
  state: string;

  @Prop()
  city: string;

  @Prop()
  zipCode: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  picture: string;

  @Prop({
    enum: [UserRole.CLIENT, UserRole.THERAPIST],
    default: UserRole.THERAPIST,
  })
  role: string;

  @Prop()
  email: string;

  @Prop({
    index: true,
    unique: true,
  })
  hashedEmail: string;

  @Prop([String])
  authSubs: string[];

  @Prop()
  @Exclude()
  password: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserEnity.name })
  @Type(() => UserEnity)
  therapist: UserEnity;

  @Prop({
    enum: [UserStatus.ACTIVE, UserStatus.INVITED, UserStatus.PAUSE],
    default: UserStatus.INVITED,
  })
  status: string;

  @Prop({ type: UserCourseSchema })
  course?: UserCourse;
}

export const UserSchema = SchemaFactory.createForClass(UserEnity);
