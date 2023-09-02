import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';

export type InvitationDocument = InvitationEntity & Document;

@Schema()
export class InvitationEntity {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop()
  to: string;

  @Prop()
  from: string;
}

export const InvitationSchema = SchemaFactory.createForClass(InvitationEntity);
