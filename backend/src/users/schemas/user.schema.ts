import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  password?: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ required: true, enum: ['customer', 'supplier', 'admin'], default: 'customer' })
  role: string;

  @Prop({ default: false })
  isGoogleAccount?: boolean;
}

export type UserDocument = User & Document & { _id: Types.ObjectId };
export const UserSchema = SchemaFactory.createForClass(User);
