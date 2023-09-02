import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetListeningTimeReportDTO {
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
}
