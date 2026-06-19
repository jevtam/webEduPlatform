import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

import { UpdateLessonDto } from './dto/update-lesson.dto';

@Controller('courses/:courseId/lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  findByCourse(@Param('courseId') courseId: string) {
    return this.lessonsService.findByCourse(courseId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  create(
    @Param('courseId') courseId: string,
    @Body() createLessonDto: CreateLessonDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.lessonsService.create(courseId, createLessonDto, user.sub);
  }

  @Patch(':lessonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  update(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.lessonsService.update(
      courseId,
      lessonId,
      updateLessonDto,
      user.sub,
    );
  }

  @Delete(':lessonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  remove(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.lessonsService.remove(courseId, lessonId, user.sub);
  }
}
