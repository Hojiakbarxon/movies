import { IsString, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { Countries } from '../../utils/Custom Types/countries-type';

export class UpdateProfileDto {
  @IsString()
  @MaxLength(100)
  @IsOptional()
  full_name?: string;


  @IsEnum(Countries)
  @IsOptional()
  country?: string;
}