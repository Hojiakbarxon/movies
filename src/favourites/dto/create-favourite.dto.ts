import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateFavouriteDto {
    @IsUUID()
    @IsNotEmpty()
    movie_id: string;
}
