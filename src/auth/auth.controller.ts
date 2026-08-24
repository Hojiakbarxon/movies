import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { Isuccess } from '../utils/success-response-interface';
import { AuthService } from './auth.service';
import { ConfrimOtpDto } from './dto/confirm-otp.dto';
import { LoginDto } from './dto/login.dto';
import express from "express"
import { ForgotPasswordDto } from './dto/forgot.password.dto';
import { ResetPasswordDto } from './dto/reset.password.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post('register')
    register(@Body() dto: RegisterDto): Promise<Isuccess> {
        return this.authService.register(dto);
    };

    @Throttle({
        default: {
            limit: 10,
            ttl: 60_000
        }
    })
    @Post("confirm-otp")
    confirmOtp(@Body() dto: ConfrimOtpDto): Promise<Isuccess> {
        return this.authService.confirmOtp(dto)
    };

    @Throttle({
        default: {
            limit: 3,
            ttl: 60_000
        }
    })
    @Post("login")
    login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: express.Response
    ): Promise<Isuccess> {
        return this.authService.login(dto, res);
    };

    @Post("forgot-password")
    forgotPassword(@Body() dto: ForgotPasswordDto): Promise<Isuccess> {
        return this.authService.forgotPassword(dto);
    };

    @Throttle({
        default: {
            limit: 10,
            ttl: 60_000
        }
    })
    @Post("reset-password")
    resetPassword(@Body() dto: ResetPasswordDto): Promise<Isuccess> {
        return this.authService.resetPassword(dto);
    };
}
