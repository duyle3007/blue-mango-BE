import { IsOptional, IsString } from 'class-validator';

export class CreateCommentDTO {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  content: string;

  @IsString()
  author: string;
}
