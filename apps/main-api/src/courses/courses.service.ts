import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
  ) {}

  async create(createCourseDto: CreateCourseDto, teacherId: string) {
    const course = new this.courseModel({
      ...createCourseDto,
      teacherId,
    });

    return course.save();
  }

  async findAll() {
    return this.courseModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string) {
    const course = await this.courseModel.findById(id).exec();

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }
}