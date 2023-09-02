import { IsString } from 'class-validator';

export class CreateIdentityDTO {
  @IsString()
  providerId: string;

  @IsString()
  user: string;
}
