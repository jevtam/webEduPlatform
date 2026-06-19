import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';

import { ForbiddenException } from '@nestjs/common';
import { UpdateCourseDto } from './dto/update-course.dto';

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

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    teacherId: string,
  ) {
    const course = await this.findById(id);

    if (course.teacherId !== teacherId) {
      throw new ForbiddenException('Only course owner can update course');
    }

    if (updateCourseDto.title !== undefined) {
      course.title = updateCourseDto.title;
    }

    if (updateCourseDto.description !== undefined) {
      course.description = updateCourseDto.description;
    }

    return course.save();
  }

  async remove(id: string, teacherId: string) {
    const course = await this.findById(id);

    if (course.teacherId !== teacherId) {
      throw new ForbiddenException('Only course owner can delete course');
    }

    await course.deleteOne();

    return {
      message: 'Course deleted successfully',
    };
  }
}
