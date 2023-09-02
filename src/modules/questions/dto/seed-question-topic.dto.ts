import { IsString } from 'class-validator';

export class SeedQuestionTopicDTO {
  @IsString()
  key: string;

  @IsString()
  description: string;
}
