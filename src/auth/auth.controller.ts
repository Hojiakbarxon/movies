import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { Isuccess } from '../utils/success-response-interface';
import { AuthService } from './auth.service';
import { ConfrimOtpDto } from './dto/confirm-otp.dto';
import { LoginDto } from './dto/login.dto';
import express from "express"
import { ForgotPasswordDto } from './dto/forgot.password.dto';
import { ResetPasswordDto } from './dto/reset.password.dto';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from './guards/auth/auth.guard';
import { TwoFactorOtpDto } from './dto/two-factor-otp.dto';
import { TwoFactorLoginDto } from './dto/two-factor-login.dto';

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

    @Throttle({
        default: {
            limit: 5,
            ttl: 60_000
        }
    })
    @Post('refresh')
    getAccessToken(@Req() req: express.Request): Promise<Isuccess> {
        return this.authService.getAccessToken(req)
    }

    @UseGuards(AuthGuard)
    @Post('2fa/enable')
    enableTwoFactor(@Req() req: any): Promise<Isuccess> {
        return this.authService.enableTwoFactor(req.user.id);
    }

    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    @UseGuards(AuthGuard)
    @Post('2fa/enable/check-otp')
    confirmTwoFactor(@Req() req: any, @Body() dto: TwoFactorOtpDto): Promise<Isuccess> {
        return this.authService.confirmTwoFactor(req.user.id, dto.otp);
    }

    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    @Post('2fa/login')
    loginWithTwoFactor(
        @Req() req: any,
        @Body() dto: TwoFactorLoginDto,
        @Res({ passthrough: true }) res: express.Response
    ): Promise<Isuccess> {
        return this.authService.loginWithTwoFactor(req, dto, res);
    }

    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    @UseGuards(AuthGuard)
    @Post('2fa/disable')
    disableTwoFactor(@Req() req: any, @Body() dto: TwoFactorOtpDto): Promise<Isuccess> {
        return this.authService.disableTwoFactor(req.user.id, dto.otp);
    }
}
