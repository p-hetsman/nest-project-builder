import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ type: String, unique: true, required: true })
  username: string;

  @Prop({ type: String, enum: ['user', 'admin'] })
  role: string;

  @Prop({ type: String })
  password?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
