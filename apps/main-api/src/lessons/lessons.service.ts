import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CoursesService } from '../courses/courses.service';

import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
    private readonly coursesService: CoursesService,
  ) {}

  async create(
    courseId: string,
    createLessonDto: CreateLessonDto,
    teacherId: string,
  ) {
    const course = await this.coursesService.findById(courseId);

    if (course.teacherId !== teacherId) {
      throw new ForbiddenException('Only course owner can add lessons');
    }

    const lesson = new this.lessonModel({
      ...createLessonDto,
      courseId,
    });

    const savedLesson = await lesson.save();

    course.lessons.push(String(savedLesson._id));
    await course.save();

    return savedLesson;
  }

  async findByCourse(courseId: string) {
    const course = await this.coursesService.findById(courseId);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.lessonModel.find({ courseId }).sort({ order: 1 }).exec();
  }

  async update(
    courseId: string,
    lessonId: string,
    updateLessonDto: UpdateLessonDto,
    teacherId: string,
  ) {
    const course = await this.coursesService.findById(courseId);

    if (course.teacherId !== teacherId) {
      throw new ForbiddenException('Only course owner can update lessons');
    }

    const lesson = await this.lessonModel.findOne({
      _id: lessonId,
      courseId,
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (updateLessonDto.title !== undefined) {
      lesson.title = updateLessonDto.title;
    }

    if (updateLessonDto.content !== undefined) {
      lesson.content = updateLessonDto.content;
    }

    if (updateLessonDto.order !== undefined) {
      lesson.order = updateLessonDto.order;
    }

    return lesson.save();
  }

  async remove(courseId: string, lessonId: string, teacherId: string) {
    const course = await this.coursesService.findById(courseId);

    if (course.teacherId !== teacherId) {
      throw new ForbiddenException('Only course owner can delete lessons');
    }

    const lesson = await this.lessonModel.findOne({
      _id: lessonId,
      courseId,
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    await lesson.deleteOne();

    course.lessons = course.lessons.filter((id) => id !== lessonId);
    await course.save();

    return {
      message: 'Lesson deleted successfully',
    };
  }
}
