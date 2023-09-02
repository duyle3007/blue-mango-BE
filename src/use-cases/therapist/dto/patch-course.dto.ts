import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNumber, IsOptional } from 'class-validator';

export class PatchCourseDTO {
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'Total time of course',
  })
  totalTime?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'Max time per day of course',
  })
  maxTimePerDay?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'Max time per session of course',
  })
  maxTimePerSession?: number;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiProperty({
    description: 'Start date of course',
  })
  startDate?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiProperty({
    description: 'End date of course',
  })
  endDate?: Date;

  @IsBoolean()
  @IsOptional()
  shouldReset?: boolean;
}
