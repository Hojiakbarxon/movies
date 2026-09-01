import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { MovieCategory } from './entities/movie-category.entity';
import { Conflict } from '../utils/conflict';
import { MovieFile } from './entities/movie-file.entity';
import { Favourites } from '../favourites/entities/favourite.entity';
import { Reviews } from './entities/reviews.entity';
import { Token } from '../utils/Token';
import { Payment } from '../payments/entities/payment.entity';
import { UserSubscription } from '../subscriptions/entities/user-subscription.entity';
import { AdminMoviesController } from './admin.movies.controller';
import { R2Service } from '../utils/r2.service';
import { MovieCast } from './entities/movie-cast.entity';
import { Actor } from '../users/entities/actors.entity';
import { TmdbService } from '../utils/TMDB.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      Movie,
      Category,
      User,
      MovieCategory,
      MovieFile,
      Favourites,
      Reviews,
      Payment,
      UserSubscription,
      MovieCast,
      Actor
    ])
  ],
  controllers: [MoviesController, AdminMoviesController],
  providers: [MoviesService, Conflict, Token, R2Service, TmdbService],
})
export class MoviesModule {}
