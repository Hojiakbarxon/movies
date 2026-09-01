import {
    IsString,
    IsInt,
    IsOptional,
    IsEnum,
    IsArray,
    IsUUID,
    Min,
    MaxLength,
    IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionType } from '../entities/movie.entity';

export class CreateMovieDto {
    @IsString()
    @MaxLength(100)
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @Type(() => Number)
    @IsInt()
    @Min(1888)
    release_year: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    duration_minutes: number;

    @IsOptional()
    @IsEnum(SubscriptionType)
    subscription_type?: SubscriptionType;

    @IsArray()
    @IsUUID('4', { each: true })
    category_ids: string[];

    @Type(() => Number)
    @IsOptional()
    rating: number;
}