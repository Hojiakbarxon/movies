import { PartialType } from "@nestjs/mapped-types";
import { RegisterDto } from "./register.dto";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { BaseDto } from "../../utils/base.dto";

export class LoginDto extends BaseDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string
}