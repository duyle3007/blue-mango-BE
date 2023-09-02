import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class QuestionInfoDTO {
  @IsString()
  question: string;

  @IsString()
  answer: string;
}

export class CreateSessionDTO {
  @ValidateNested({
    each: true,
  })
  @Type(() => QuestionInfoDTO)
  questions: Array<QuestionInfoDTO>;

  @IsOptional()
  @IsArray()
  @IsString({
    each: true,
  })
  comments?: Array<string>;

  @IsString()
  author: string;

  @IsDate()
  startTime: Date;

  @IsNumber()
  duration: number;

  @IsNumber()
  pause: number;

  @IsNumber()
  interruptions: number;
}
