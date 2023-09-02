import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CountClientAdverseReactionsDTO {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Start date with format DD/MM/YYYY',
  })
  startDate?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'End date with format DD/MM/YYYY',
  })
  endDate?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Type(() => String)
  @Transform(({ value }) => value.split(','))
  @ApiProperty({
    description: 'List of topic of question',
  })
  topics?: string[];
}
