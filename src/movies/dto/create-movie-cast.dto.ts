import { Type } from 'class-transformer';
import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from 'class-validator';

export class CreateMovieCastDto {
    @IsUUID()
    @IsNotEmpty()
    actorId: string;

    @IsString()
    @IsNotEmpty()
    characterName: string;

    @IsInt()
    @IsNotEmpty()
    @Min(0)
    @Type(() => Number)
    castOrder: number;
}
