import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CourseDocument = HydratedDocument<Course>;

export enum ImageStatus {
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

@Schema({
  timestamps: true,
})
export class CourseImage {
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
export class Course {
  @Prop({
    required: true,
    trim: true,
  })
  title!: string;

  @Prop({
    required: true,
  })
  description!: string;

  @Prop({
    required: true,
  })
  teacherId!: string;

  @Prop({
    type: CourseImage,
    default: null,
  })
  cover?: CourseImage | null;

  @Prop({
    type: [String],
    default: [],
  })
  lessons!: string[];

  @Prop({
    default: 0,
  })
  studentsCount!: number;
}

export const CourseSchema = SchemaFactory.createForClass(Course);