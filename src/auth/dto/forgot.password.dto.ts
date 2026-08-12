import { IsEmail, IsNotEmpty, MaxLength } from "class-validator";

export class ForgotPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(100)
    email: string;
}