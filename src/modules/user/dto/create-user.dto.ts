import { IsEnum, IsString } from 'class-validator';
import UserRole from '../domain/user-role.enum';
import UserStatus from '../domain/user-status.enum';

export class CreateUserDTO {
  @IsString()
  email: string;

  @IsString()
  password?: string;

  @IsString()
  firstName?: string;

  @IsString()
  lastName?: string;

  @IsString()
  nickname?: string;

  @IsString()
  picture?: string;

  @IsEnum(UserRole)
  role?: string;

  @IsString()
  therapist?: string;

  @IsEnum(UserStatus)
  status?: UserStatus;
}
