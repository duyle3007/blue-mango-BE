import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsObject, IsString } from 'class-validator';

class QuestionInfoDTO {
  @IsNumber()
  answer: number;

  @IsString()
  comment: string;

  @IsString()
  name: string;

  @IsString()
  qtype: number;

  @IsString()
  atype: number;
}

export class SubmitMobileSessionDTO {
  @IsObject()
  @Type(() => QuestionInfoDTO)
  @ApiProperty({
    description: 'Question of session',
  })
  questions: Record<string, QuestionInfoDTO>;

  @Type(() => Date)
  @IsDate()
  @ApiProperty({
    description: 'Start date of session',
  })
  starttime: Date;

  @IsNumber()
  @ApiProperty({
    description: 'Duration of session',
  })
  duration: number;

  @IsNumber()
  @ApiProperty({
    description: 'Interruption time of session by second',
  })
  interruptions: number;

  @IsNumber()
  @ApiProperty({
    description: 'Pause time of session by second',
  })
  pausedduration: number;

  @IsNumber()
  @ApiProperty({
    description: 'Total course time of client by second',
  })
  courseaccumulatetime: number;

  @Type(() => Date)
  @IsDate()
  @ApiProperty({
    description: 'Start date of course',
  })
  coursestart: Date;

  @Type(() => Date)
  @IsDate()
  @ApiProperty({
    description: 'End date of course',
  })
  courseend: Date;
}
