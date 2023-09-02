import { Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class QuestionInfoDTO {
  @IsString()
  topic: string;

  @IsString()
  type: string;

  @IsString()
  answer: string;
}

class CommentDTO {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  content: string;
}

export class SubmitSessionDTO {
  @ValidateNested({
    each: true,
  })
  @Type(() => QuestionInfoDTO)
  questions: Array<QuestionInfoDTO>;

  @IsOptional()
  @ValidateNested({
    each: true,
  })
  @Type(() => CommentDTO)
  comments?: Array<CommentDTO>;

  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @IsNumber()
  duration: number;

  @IsNumber()
  pause: number;

  @IsNumber()
  interruptions: number;

  @IsNumber()
  courseAccumulateTime: number;

  @IsDate()
  courseStart: Date;

  @IsDate()
  courseEnd: Date;
}
