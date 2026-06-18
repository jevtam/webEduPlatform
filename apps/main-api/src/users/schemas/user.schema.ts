import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
}

@Schema({
  timestamps: true,
})
export class User {
  @Prop({
    required: true,
  })
  name!: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email!: string;

  @Prop({
    required: true,
  })
  passwordHash!: string;

  @Prop({
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role!: UserRole;

  @Prop({
    type: [String],
    default: [],
  })
  enrolledCourses!: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);