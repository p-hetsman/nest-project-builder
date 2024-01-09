import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Permission } from '../dto/update-role.dto';


@Schema()
export class Role {
  @Prop({ type: String, unique: true, required: true })
  name: string;

  @Prop({ type: [String] })
  permissions: Permission[];
}

export type RoleDocument = Role & Document;

export const RoleSchema = SchemaFactory.createForClass(Role);
