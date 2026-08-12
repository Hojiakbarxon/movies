import { IsNotEmpty, IsNumber, IsString, Max, Min } from "class-validator";

export class CreateReviewDto{
    @IsString()
    @IsNotEmpty()
    comment : string;

    @IsNumber()
    @Max(5)
    @Min(1)
    @IsNotEmpty()
    rating : number;
}