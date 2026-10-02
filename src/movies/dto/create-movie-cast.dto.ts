import { Type } from 'class-transformer';
import {
    IsInt,
    IsNotEmpty,
    IsString,
    Min,
} from 'class-validator';

export class CreateMovieCastDto {
    @IsInt()
    @IsNotEmpty()
    @Type(() => Number)
    tmdbId: number;

    @IsString()
    @IsNotEmpty()
    characterName: string;

    @IsInt()
    @IsNotEmpty()
    @Min(0)
    @Type(() => Number)
    castOrder: number;
}
