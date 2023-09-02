import { IsDate, IsString } from 'class-validator';

export class GetHealthInfoDTO {
  @IsString()
  clientId: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;
}
