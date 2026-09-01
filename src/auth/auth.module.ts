import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendingUser } from './entities/pending.user.entity';
import { Conflict } from '../utils/conflict';
import { Token } from '../utils/Token';
import { User } from '../users/entities/user.entity';
import { Crypto } from '../utils/Crypto';
import { Profile } from '../users/entities/profile.entity';
import { UsersService } from '../users/users.service';
import { ProcessingUser } from './entities/processing.user.entity';
import { Reviews } from '../movies/entities/reviews.entity';
import { Payment } from '../payments/entities/payment.entity';
import { UserSubscription } from '../subscriptions/entities/user-subscription.entity';
import { R2Service } from '../utils/r2.service';
import { MailService } from '../utils/mail.service';
import { Actor } from '../users/entities/actors.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    PendingUser,
    User,
    Profile,
    ProcessingUser,
    Reviews,
    Payment,
    UserSubscription,
    Actor
  ])],
  controllers: [AuthController],
  providers: [AuthService, Conflict, Token, Crypto, UsersService, R2Service, MailService]
})
export class AuthModule { }
