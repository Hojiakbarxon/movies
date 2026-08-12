import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PendingUser } from './entities/pending.user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { Crypto } from '../utils/Crypto';
import { generateOtp } from '../utils/otp.service';
import { sendMail } from '../utils/mail.service';
import { Isuccess } from '../utils/success-response-interface';
import { ConfrimOtpDto } from './dto/confirm-otp.dto';
import { Conflict } from '../utils/conflict';
import { User } from '../users/entities/user.entity';
import { Token } from '../utils/Token';
import { Profile } from '../users/entities/profile.entity';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { ForgotPasswordDto } from './dto/forgot.password.dto';
import { ProcessingUser } from './entities/processing.user.entity';
import { ResetPasswordDto } from './dto/reset.password.dto';

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
        private readonly userService: UsersService) {
    }

    async register(dto: RegisterDto): Promise<Isuccess> {
        let { email, password, username } = dto;

        let user = await this.userRepo.findOne({
            where: { email }
        });

        if (user) {
            throw new ConflictException("User with this email has already registered")
        };

        let password_hash = await this.crypto.hash(password);
        let otp = generateOtp();

        let penUser = await this.penUserRepo.findOne({
            where: { email }
        });

        let expires_in = new Date(Date.now() + 5 * 60 * 1000);

        if (penUser) {
            let mail = await sendMail(email, otp);
            await this.penUserRepo.update({ id: penUser.id }, {
                otp,
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

        let mail = await sendMail(email, otp);

        let pendingUser = await this.penUserRepo.create({
            email,
            username,
            password_hash,
            otp,
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

        if (otp !== penUser.otp) {
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

        if (!user) throw new BadRequestException("Email or Password is wrong!")

        let isMatch = await this.crypto.compare(password, user.password_hash);

        if (!isMatch) throw new BadRequestException("Email or Password is wrong!")

        let payload = {
            id: user.id,
            role: user.role
        };

        let authToken = await this.token.getAccessToken(payload);
        let refreshToken = await this.token.getRefreshToken(res, payload);

        return {
            statusCode: 200,
            message: "You have signed in successfully",
            data: {
                authToken,
                refreshToken
            }
        }
    };

    async forgotPassword(dto: ForgotPasswordDto): Promise<Isuccess> {

        let { email } = dto;
        await this.conflicts.mustExist({ email }, this.userRepo, "User", "email");

        let existedProcessingUser = await this.proUserRepo.findOne({
            where: { email }
        });

        const otp = generateOtp();
        let expires_in = new Date(Date.now() + 5 * 60 * 1000);

        if (existedProcessingUser) {
            await this.proUserRepo.update({ id: existedProcessingUser.id }, {
                email,
                otp,
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

        let processingUser = await this.proUserRepo.create({
            ...dto,
            otp,
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

        if (otp !== processingUser.otp) throw new BadRequestException("OTP is wrong or expired");

        if (password !== repeat_password) throw new BadRequestException("Password did not match");

        let password_hash = await this.crypto.hash(password);

        await this.userRepo.update({ email }, {
            password_hash
        });


        return {
            statusCode: 200,
            message: "Password has been updated, successfully",
            data: {}
        }
    }
}
