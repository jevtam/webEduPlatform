import { IsNumber, IsOptional, IsString, IsNotEmpty, Min } from 'class-validator';

export class UpdateLessonDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  order?: number;
}