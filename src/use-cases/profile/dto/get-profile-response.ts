import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import UserRole from 'src/modules/user/domain/user-role.enum';

export default class GetProfileResponse {
  @IsString()
  @ApiProperty()
  id: string;

  @IsString()
  @ApiProperty()
  email: string;

  @IsEnum(UserRole)
  @ApiProperty({
    enum: [UserRole.CLIENT, UserRole.THERAPIST],
  })
  role: string;

  constructor(profile: GetProfileResponse) {
    Object.assign(this, profile);
  }
}
