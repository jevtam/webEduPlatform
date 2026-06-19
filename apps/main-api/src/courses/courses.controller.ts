import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Delete,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

import { UpdateCourseDto } from './dto/update-course.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  create(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.coursesService.create(createCourseDto, user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.coursesService.update(id, updateCourseDto, user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.coursesService.remove(id, user.sub);
  }

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  enroll(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.coursesService.enroll(id, user.sub);
  }

  @Post(':id/cover')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: '../../uploads/originals',
        filename: (_req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}${extname(file.originalname)}`;

          callback(null, uniqueName);
        },
      }),
    }),
  )
  uploadCover(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.coursesService.uploadCover(id, file, user.sub);
  }
}
