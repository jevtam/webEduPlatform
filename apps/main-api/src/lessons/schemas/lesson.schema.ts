import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ImageStatus } from '../../courses/schemas/course.schema';

export type LessonDocument = HydratedDocument<Lesson>;

@Schema({
  timestamps: true,
})
export class LessonImage {
  @Prop()
  url?: string;

  @Prop({
    enum: ImageStatus,
    default: ImageStatus.PROCESSING,
  })
  status?: ImageStatus;
}

@Schema({
  timestamps: true,
})
export class Lesson {
  @Prop({
    required: true,
    trim: true,
  })
  title!: string;

  @Prop({
    required: true,
  })
  content!: string;

  @Prop({
    required: true,
  })
  courseId!: string;

  @Prop({
    required: true,
  })
  order!: number;

  @Prop({
    type: [LessonImage],
    default: [],
  })
  images!: LessonImage[];
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);