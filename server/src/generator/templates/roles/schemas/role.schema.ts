import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Action } from 'src/auth/policies/constants';

export class Permission {
  @Prop({
    type: String,
    enum: Object.values(Action),
  })
  action: Action;

  @Prop({ type: String })
  subject: string;
}
@Schema()
export class Role {
  @Prop({ type: String, unique: true, required: true })
  name: string;

  @Prop({ type: [String] })
  permissions: Permission[];
}

export type RoleDocument = Role & Document;

export const RoleSchema = SchemaFactory.createForClass(Role);
