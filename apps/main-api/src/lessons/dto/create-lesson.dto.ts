import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsNumber()
  @Min(1)
  order!: number;
}