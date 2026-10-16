import { BadRequestException, ConflictException, Injectable, Req, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PendingUser } from './entities/pending.user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { Crypto } from '../utils/Crypto';
import { generateOtp } from '../utils/otp.service';
import { Isuccess } from '../utils/success-response-interface';
import { ConfrimOtpDto } from './dto/confirm-otp.dto';
import { Conflict } from '../utils/conflict';
import { User } from '../users/entities/user.entity';
import { Token } from '../utils/Token';
import { Profile } from '../users/entities/profile.entity';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import { ForgotPasswordDto } from './dto/forgot.password.dto';
import { ProcessingUser } from './entities/processing.user.entity';
import { ResetPasswordDto } from './dto/reset.password.dto';
import { MailService } from '../utils/mail.service';
import { TwoFactorService } from './two-factor-authentication/two-factor.service';
import { TwoFactorLoginDto } from './dto/two-factor-login.dto';
import { Jwt, JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(PendingUser) private readonly penUserRepo: Repository<PendingUser>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Profile) private readonly profileRepo: Repository<Profile>,
        @InjectRepository(ProcessingUser) private readonly proUserRepo: Repository<ProcessingUser>,
        private readonly crypto: Crypto,
        private readonly conflicts: Conflict,
        private readonly token: Token,
        private readonly userService: UsersService,
        private readonly mail: MailService,
        private readonly twoFactor: TwoFactorService
    ) {
    }

    private async getUserWith2faFields(id: string) {
        return this.userRepo.findOne({
            where: { id },
            select: {
                id: true,
                email: true,
                enabledTwoFactorAuthentication: true,
                secretKey: true,
                pendingSecretKey: true,
            },
        });
    }

    async register(dto: RegisterDto): Promise<Isuccess> {
        let { email, password, username } = dto;

        let user = await this.userRepo.findOne({
            where: { email }
        });

        if (user) {
            throw new ConflictException("User with this email has already registered")
        };

        await this.conflicts.mustBeUnique({ username }, this.userRepo, 'User', "username");

        await this.conflicts.mustBeUnique({ username }, this.penUserRepo, 'User', 'username');

        let password_hash = await this.crypto.hash(password);
        let otp = generateOtp();
        let hashedOtp = await this.crypto.hash(otp);

        let penUser = await this.penUserRepo.findOne({
            where: { email }
        });

        let expires_in = new Date(Date.now() + 5 * 60 * 1000);

        if (penUser) {
            await this.mail.sendMail(email, otp);
            await this.penUserRepo.update({ id: penUser.id }, {
                otp: hashedOtp,
                password_hash,
                expires_in
            })

            return {
                statusCode: 200,
                message: 'success',
                data: {
                    message: "OTP has been sent to your email"
                }
            }
        }

        await this.mail.sendMail(email, otp);

        let pendingUser = this.penUserRepo.create({
            email,
            username,
            password_hash,
            otp: hashedOtp,
            expires_in
        });

        await this.penUserRepo.save(pendingUser);

        return {
            statusCode: 200,
            message: "success",
            data: {
                message: "Otp has been sent to your email"
            }
        }
    };

    async confirmOtp(dto: ConfrimOtpDto): Promise<Isuccess> {

        let { email, otp } = dto;

        let penUser = await this.conflicts.mustExist({ email }, this.penUserRepo, 'User', "email") as PendingUser;

        if (Date.now() > penUser.expires_in.getTime()) {
            throw new BadRequestException("OTP is expired, request a new one");
        };

        let checkOtp = await this.crypto.compare(otp, penUser.otp);
        if (!checkOtp) {
            throw new ConflictException("OTP is expired or wrong")
        };

        let user = await this.userRepo.create({
            username: penUser.username,
            email: penUser.email,
            password_hash: penUser.password_hash
        });


        let savedUser = await this.userRepo.save(user);

        let profile = await this.profileRepo.create({ user: savedUser });
        await this.profileRepo.save(profile);

        await this.penUserRepo.delete({ id: penUser.id });

        return {
            statusCode: 200,
            message: "You have been registered successfully",
            data: {}
        }
    };

    async login(dto: LoginDto, res: Response): Promise<Isuccess> {
        let { email, password } = dto;

        let user = await (await this.userService.findByEmailWithPassword(email)).data as User

        if (!user) {
            res.clearCookie("refreshToken");
            throw new BadRequestException("Email or Password is wrong!");
        }

        let isMatch = await this.crypto.compare(password, user.password_hash);

        if (!isMatch) {
            res.clearCookie("refreshToken");
            throw new BadRequestException("Email or Password is wrong!");
        }

        let payload = {
            id: user.id
        };

        if (user.enabledTwoFactorAuthentication) {
            res.clearCookie('refreshToken');
            const twoFactorToken = this.token.getTwoFactorToken(payload);
            return {
                statusCode: 200,
                message: "Two-factor authentication required",
                data: {
                    twoFactorRequired: true,
                    twoFactorToken
                }
            }
        };

        return this.issueTokens(user.id, res, "You have signed in successfully")

    };

    async forgotPassword(dto: ForgotPasswordDto): Promise<Isuccess> {

        let { email } = dto;
        await this.conflicts.mustExist({ email }, this.userRepo, "User", "email");

        let existedProcessingUser = await this.proUserRepo.findOne({
            where: { email }
        });

        const otp = generateOtp();
        let hashedOtp = await this.crypto.hash(otp);
        let expires_in = new Date(Date.now() + 5 * 60 * 1000);

        if (existedProcessingUser) {
            await this.mail.sendMail(email, otp)
            await this.proUserRepo.update({ id: existedProcessingUser.id }, {
                email,
                otp: hashedOtp,
                expires_in
            });

            return {
                statusCode: 200,
                message: "success",
                data: {
                    message: "OTP has been sent to your email"
                }
            };
        };

        await this.mail.sendMail(email, otp)
        let processingUser = await this.proUserRepo.create({
            ...dto,
            otp: hashedOtp,
            expires_in
        });
        await this.proUserRepo.save(processingUser);

        return {
            statusCode: 200,
            message: "success",
            data: {
                message: "OTP has been sent to your email"
            }
        };
    };

    async resetPassword(dto: ResetPasswordDto): Promise<Isuccess> {

        let { email, otp, password, repeat_password } = dto;

        let processingUser = await this.conflicts.mustExist({ email }, this.proUserRepo, 'User', 'email') as ProcessingUser;

        if (Date.now() > processingUser.expires_in.getTime()) {
            throw new BadRequestException("OTP is expired, request a new one");
        };
        let checkOtp = await this.crypto.compare(otp, processingUser.otp);

        if (!checkOtp) throw new BadRequestException("OTP is wrong or expired");

        if (password !== repeat_password) throw new BadRequestException("Password did not match");

        let password_hash = await this.crypto.hash(password);

        await this.userRepo.update({ email }, {
            password_hash
        });

        await this.proUserRepo.delete({ email });


        return {
            statusCode: 200,
            message: "Password has been updated, successfully",
            data: {}
        }
    };

    async enableTwoFactor(userId: string): Promise<Isuccess> {
        const user = await this.getUserWith2faFields(userId);
        if (!user) throw new UnauthorizedException("Please sign in first");
        if (user.enabledTwoFactorAuthentication) {
            throw new ConflictException("Two-factor authentication is already enabled");
        }

        const secret = this.twoFactor.generateSecret();
        await this.userRepo.update({ id: userId }, {
            pendingSecretKey: this.twoFactor.encrypt(secret)
        });

        return {
            statusCode: 200,
            message: "success",
            data: {
                secret,
                otpauthUrl: this.twoFactor.buildOtpauthUrl(user.email, secret)
            }
        };
    };

    async confirmTwoFactor(userId: string, otp: string): Promise<Isuccess> {
        const user = await this.getUserWith2faFields(userId);
        if (!user?.pendingSecretKey) {
            throw new BadRequestException("Start two-factor setup first");
        }

        const secret = this.twoFactor.decrypt(user.pendingSecretKey);
        if (!this.twoFactor.verify(otp, secret)) {
            throw new BadRequestException("Invalid or expired code");
        }

        await this.userRepo.update({ id: userId }, {
            enabledTwoFactorAuthentication: true,
            secretKey: user.pendingSecretKey,
            pendingSecretKey: null
        });

        return { statusCode: 200, message: "Two-factor authentication enabled", data: {} };
    };

    async loginWithTwoFactor(@Req() req: any, dto: TwoFactorLoginDto, res: Response): Promise<Isuccess> {
        let twoFactorToken: string = req.headers['two-factor-token'];
        if (!twoFactorToken) throw new UnauthorizedException("2FA session expired, please sign in again");

        let bearer = twoFactorToken.split(' ')[0];
        let token = twoFactorToken.split(' ')[1];

        if (bearer !== 'Bearer' || !token) throw new UnauthorizedException("2FA session expired, please sign in again");

        let payload: JwtPayload;
        try {
            payload = this.token.verifyTwoFactorToken(token);
        } catch {
            throw new UnauthorizedException("2FA session expired, please sign in again");
        }

        const user = await this.getUserWith2faFields(payload.id);
        if (!user || !user.enabledTwoFactorAuthentication || !user.secretKey) {
            throw new UnauthorizedException("Please sign in again");
        }

        const secret = this.twoFactor.decrypt(user.secretKey);
        if (!this.twoFactor.verify(dto.otp, secret)) {
            throw new BadRequestException("Invalid or expired code");
        }

        return this.issueTokens(user.id, res, "You have signed in successfully");
    };

    async disableTwoFactor(userId: string, otp: string): Promise<Isuccess> {
        const user = await this.getUserWith2faFields(userId);
        if (!user?.enabledTwoFactorAuthentication || !user.secretKey) {
            throw new BadRequestException("Two-factor authentication is not enabled");
        }

        if (!this.twoFactor.verify(otp, this.twoFactor.decrypt(user.secretKey))) {
            throw new BadRequestException("Invalid or expired code");
        }

        await this.userRepo.update({ id: userId }, {
            enabledTwoFactorAuthentication: false,
            secretKey: null,
            pendingSecretKey: null
        });

        return { statusCode: 200, message: "Two-factor authentication disabled", data: {} };
    };

    async getAccessToken(@Req() req: Request): Promise<Isuccess> {
        let refreshToken = req?.cookies?.refreshToken;
        if (!refreshToken) throw new UnauthorizedException("Please sign in first.")

        try {
            let data = this.token.verifyRefreshToken(refreshToken) as User;

            let payload = {
                id: data.id,
            };

            let authToken = this.token.getAccessToken(payload);

            return {
                statusCode: 200,
                message: "success",
                data: {
                    authToken
                }
            }
        } catch (error) {
            throw new UnauthorizedException("Something went wrong, please sign in again.")
        }
    };

    private issueTokens(userId: string, res: Response, message: string): Isuccess {
        const payload = { id: userId };
        const authToken = this.token.getAccessToken(payload);
        const refreshToken = this.token.getRefreshToken(res, payload);
        return { statusCode: 200, message, data: { authToken, refreshToken } };
    }
}
