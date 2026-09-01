import { IsInt, IsNotEmpty } from "class-validator";

export class ConnectTmdbMovieDto {
    @IsInt()
    @IsNotEmpty()
    tmdbId: number;
}