import { Type } from 'class-transformer';
import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { CreateMovieCastDto } from './create-movie-cast.dto';

export class AddMovieCastBulkDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateMovieCastDto)
    actors: CreateMovieCastDto[];
}