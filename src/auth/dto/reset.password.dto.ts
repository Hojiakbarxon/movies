import { IsEmail, IsNotEmpty, IsString, Length, MaxLength, MinLength } from "class-validator";
import { OTPBaseDto } from "../../utils/base.dto";

export class ResetPasswordDto extends OTPBaseDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    repeat_password: string
}