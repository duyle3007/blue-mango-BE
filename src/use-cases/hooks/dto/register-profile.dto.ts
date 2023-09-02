import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export default class RegisterProfileDTO {
  @IsString()
  @ApiProperty()
  sub: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  given_name?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  family_name?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  name?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  picture?: string;

  @IsString()
  @ApiProperty()
  email: string;
}
