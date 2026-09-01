import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Conflict } from '../utils/conflict';
import { Crypto } from '../utils/Crypto';
import { Movie } from '../movies/entities/movie.entity';
import { Token } from '../utils/Token';
import { Favourites } from '../favourites/entities/favourite.entity';
import { Reviews } from '../movies/entities/reviews.entity';
import { Payment } from '../payments/entities/payment.entity';
import { UserSubscription } from '../subscriptions/entities/user-subscription.entity';
import { R2Service } from '../utils/r2.service';
import { Actor } from './entities/actors.entity';
import { MovieCast } from '../movies/entities/movie-cast.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Profile,
      Movie,
      Favourites,
      Reviews,
      Payment,
      UserSubscription,
      Actor,
      MovieCast
    ])
  ],
  controllers: [UsersController],
  providers: [UsersService, Conflict, Crypto, Token, R2Service],
})
export class UsersModule { }
