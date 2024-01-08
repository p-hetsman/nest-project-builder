import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Role {
  @Prop({ type: String, unique: true, required: true })
  name: string;

  @Prop({ type: [String] })
  permissions: string[];
}

export type RoleDocument = Role & Document;

export const RoleSchema = SchemaFactory.createForClass(Role);
