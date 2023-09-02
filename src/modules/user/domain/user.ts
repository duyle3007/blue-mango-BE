import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import UserRole from './user-role.enum';
import UserStatus from './user-status.enum';

export default class User {
  @IsString()
  id?: string;

  @IsString()
  firstName?: string;

  @IsString()
  lastName?: string;

  @IsString()
  nickname?: string;

  @IsString()
  gender?: string;

  @IsString()
  address1?: string;

  @IsString()
  address2?: string;

  @IsString()
  country?: string;

  @IsString()
  state?: string;

  @IsString()
  city?: string;

  @IsString()
  zipCode?: string;

  @IsString()
  phoneNumber?: string;

  @IsEnum(UserRole)
  role?: string;

  @IsString()
  email?: string;

  @IsString()
  password?: string;

  @IsString()
  therapist?: string;

  @IsString()
  hashedEmail?: string;

  @IsEnum(UserStatus)
  status?: string;

  @IsObject()
  @IsOptional()
  course?: {
    totalTime: number;
    maxTimePerDay: number;
    maxTimePerSession: number;
    startDate: Date;
    endDate: Date;
    shouldReset: boolean;
  };
}
