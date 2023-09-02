import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsJSON,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PAGINATION_ORDER_BY } from 'src/constant/pagination';

export class GetClientsDTO {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({
    description: 'The limit number of client records',
  })
  limit?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @ApiProperty({
    description: 'The start order of client records',
  })
  skip?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Search the client by name',
  })
  search?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Filter by field',
  })
  filter?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Field name is sorted',
  })
  sort?: string;

  @IsEnum(PAGINATION_ORDER_BY)
  @IsOptional()
  @ApiProperty({
    description: 'Field name is sorted',
  })
  order?: PAGINATION_ORDER_BY;
}
