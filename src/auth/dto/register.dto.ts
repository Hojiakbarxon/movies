import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { BaseDto } from "../../utils/base.dto";

export class RegisterDto extends BaseDto{
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
        message: 'password must contain at least one letter and one number',
    })
    password: string;
}