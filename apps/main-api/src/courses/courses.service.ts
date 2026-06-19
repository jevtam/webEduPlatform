import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';

import { ForbiddenException } from '@nestjs/common';
import { UpdateCourseDto } from './dto/update-course.dto';

import { UsersService } from '../users/users.service';

import { RedisService } from '../redis/redis.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
  ) {}

  private async invalidateCourseCache(courseId?: string) {
    await this.redisService.del('courses:all');

    if (courseId) {
      await this.redisService.del(`courses:${courseId}`);
    }
  }

  async create(createCourseDto: CreateCourseDto, teacherId: string) {
    const course = new this.courseModel({
      ...createCourseDto,
      teacherId,
    });

    return course.save();
    const savedCourse = await course.save();
    await this.invalidateCourseCache(savedCourse._id.toString());
    return savedCourse;
  }

  async findAll() {
    const cacheKey = 'courses:all';

    const cachedCourses = await this.redisService.get(cacheKey);

    if (cachedCourses) {
      console.log('COURSES FROM REDIS');
      return cachedCourses;
    }

    console.log('COURSES FROM MONGO');

    const courses = await this.courseModel
      .find()
      .sort({ createdAt: -1 })
      .exec();

    await this.redisService.set(cacheKey, courses, 60);

    return courses;
  }

  async findById(id: string) {
    const cacheKey = `courses:${id}`;

    const cachedCourse = await this.redisService.get(cacheKey);

    if (cachedCourse) {
      console.log('COURSES FROM REDIS');
      return cachedCourse as CourseDocument;
    }

    console.log('COURSE FROM MONGO');

    const course = await this.courseModel.findById(id).exec();

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    await this.redisService.set(cacheKey, course, 60);

    return course;
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    teacherId: string,
  ) {
    const course = await this.findDocumentById(id);

    if (course.teacherId !== teacherId) {
      throw new ForbiddenException('Only course owner can update course');
    }

    if (updateCourseDto.title !== undefined) {
      course.title = updateCourseDto.title;
    }

    if (updateCourseDto.description !== undefined) {
      course.description = updateCourseDto.description;
    }

    const updatedCourse = await course.save();
    await this.invalidateCourseCache(id);
    return updatedCourse;
    return course.save();
  }

  async remove(id: string, teacherId: string) {
    const course = await this.findDocumentById(id);

    if (course.teacherId !== teacherId) {
      throw new ForbiddenException('Only course owner can delete course');
    }

    await course.deleteOne();

    await course.deleteOne();
    await this.invalidateCourseCache(id);

    return {
      message: 'Course deleted successfully',
    };
  }

  async enroll(courseId: string, studentId: string) {
    const course = await this.findDocumentById(courseId);
    const user = await this.usersService.findById(studentId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.enrolledCourses.includes(courseId)) {
      return {
        message: 'Student already enrolled',
        courseId,
        studentId,
      };
    }

    await this.usersService.addEnrolledCourse(studentId, courseId);

    course.studentsCount += 1;
    await course.save();

    await this.invalidateCourseCache(courseId);

    return {
      message: 'Student enrolled successfully',
      courseId,
      studentId,
    };
  }

  async findDocumentById(id: string) {
    const course = await this.courseModel.findById(id).exec();

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }
}
