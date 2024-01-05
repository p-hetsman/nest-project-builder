import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Role } from '../../roles/schemas/role.schema';

@Schema()
export class User {
  @Prop({ type: String, unique: true, required: true })
  username: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Role', default: 'user' })
  role: Role;

  @Prop({ type: String })
  password?: string;

  @Prop()
  refreshToken: string;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
