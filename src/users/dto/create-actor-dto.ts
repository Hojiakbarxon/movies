import {
    IsBoolean,
    IsDateString,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateActorDto {

    @IsInt()
    @IsNotEmpty()
    tmdbId: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsDateString()
    @IsOptional()
    birthday?: string;

    @IsDateString()
    @IsOptional()
    deathday?: string;

    @IsString()
    @IsOptional()
    biography?: string;

    @IsString()
    @IsOptional()
    placeOfBirth?: string;

    @IsString()
    @IsOptional()
    profilePath?: string;

    @IsInt()
    @IsOptional()
    gender?: number;

    @IsBoolean()
    @IsOptional()
    adult?: boolean;
}
