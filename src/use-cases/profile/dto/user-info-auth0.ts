import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export default class UserInfoAuth0 {
  @IsString()
  @ApiProperty()
  sub: string;

  @IsString()
  @ApiProperty()
  given_name: string;

  @IsString()
  @ApiProperty()
  family_name: string;

  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  picture: string;

  @IsString()
  @ApiProperty()
  email: string;
}
