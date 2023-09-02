import { IsString } from 'class-validator';

export class FindQuestionDTO {
  @IsString()
  type: string;

  @IsString()
  topic: string;
}
