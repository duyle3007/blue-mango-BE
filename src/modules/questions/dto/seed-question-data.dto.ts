import { IsString } from 'class-validator';

export class SeedQuestionDataDTO {
  @IsString()
  type: string;

  @IsString()
  topic: string;

  @IsString()
  label: string;

  @IsString()
  tags: string[];
}
