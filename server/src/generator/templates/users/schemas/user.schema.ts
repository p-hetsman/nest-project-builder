import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RoleDocument, RoleSchema } from '../../roles/schemas/role.schema';

@Schema()
export class User {
  @Prop({ type: String, unique: true, required: true })
  username: string;

  @Prop({ type: RoleSchema, default: 'user' })
  role: RoleDocument;

  @Prop({ type: String })
  password?: string;

  @Prop()
  refreshToken: string;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
