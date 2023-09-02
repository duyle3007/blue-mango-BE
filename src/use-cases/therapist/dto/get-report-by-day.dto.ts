import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetReportByDayDTO {
  @IsString()
  @ApiProperty({
    description: 'Date with format DD/MM/YYYY',
  })
  date: string;
}
