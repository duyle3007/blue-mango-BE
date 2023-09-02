import { IsArray, IsDate, IsOptional, IsString } from 'class-validator';

export class CountAdverseReactionDTO {
  @IsString()
  clientId: string;

  @IsDate()
  startDate?: Date;

  @IsDate()
  endDate?: Date;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  topics?: string[];
}
