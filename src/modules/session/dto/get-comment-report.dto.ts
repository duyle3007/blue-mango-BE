import { IsDate, IsString } from 'class-validator';

export class GetCommnetReportDTO {
  @IsString()
  clientId: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;
}
