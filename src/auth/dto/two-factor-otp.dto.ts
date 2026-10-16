import { IsNotEmpty, IsString, Matches } from "class-validator";

export class TwoFactorOtpDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{6}$/, { message: 'otp must be 6 digits' })
    otp: string
}