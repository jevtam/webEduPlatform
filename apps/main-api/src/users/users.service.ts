import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument, UserRole } from './schemas/user.schema';

interface CreateUserParams {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async create(params: CreateUserParams): Promise<UserDocument> {
    const user = new this.userModel({
      ...params,
      email: params.email.toLowerCase(),
    });

    return user.save();
  }

  async addEnrolledCourse(userId: string, courseId: string) {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $addToSet: {
            enrolledCourses: courseId,
          },
        },
        {
          new: true,
        },
      )
      .exec();
  }

  async findById(userId: string) {
    return this.userModel.findById(userId).exec();
  }
}
