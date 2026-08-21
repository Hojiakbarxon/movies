import { IsEmail, IsNotEmpty, IsString, Length, MaxLength } from "class-validator";

export abstract class BaseDto {
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(100)
    email: string;
}

export abstract class OTPBaseDto extends BaseDto {
    @IsString()
    @IsNotEmpty()
    @Length(6)
    otp: string;
}