import { IsString } from 'class-validator';

export class SeedQuestionTypeDTO {
  @IsString()
  key: string;

  @IsString()
  description: string;
}
