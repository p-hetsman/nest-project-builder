import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Action, existingEntities } from '../roles.constants';

@Schema()
export class Permission extends Document {
  @Prop({
    required: true,
    enum: Object.values(Action),
  })
  action: Action;
  @Prop({
    required: true,
    enum: existingEntities,
  })
  subject: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

@Schema()
export class Role extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop([PermissionSchema])
  permissions: Permission[];
}

export type RoleDocument = Role & Document;

export const RoleSchema = SchemaFactory.createForClass(Role);
