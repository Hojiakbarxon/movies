import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { Profile } from './users/entities/profile.entity';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { SubscriptionPlan } from './subscriptions/entities/subscription-plan.entity';
import { UserSubscription } from './subscriptions/entities/user-subscription.entity';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/entities/payment.entity';
import { CategoriesModule } from './categories/categories.module';
import { MoviesModule } from './movies/movies.module';
import { Category } from './categories/entities/category.entity';
import { Movie } from './movies/entities/movie.entity';
import { MovieCategory } from './movies/entities/movie-category.entity';
import { MovieFile } from './movies/entities/movie-file.entity';
import { AuthModule } from './auth/auth.module';
import { PendingUser } from './auth/entities/pending.user.entity';
import { ProcessingUser } from './auth/entities/processing.user.entity';
import { FavouritesModule } from './favourites/favourites.module';
import { Favourites } from './favourites/entities/favourite.entity';
import { Reviews } from './movies/entities/reviews.entity';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ExceptionFilterFilter } from './filters/exception-filter/exception-filter.filter';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './log/winston.config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Actor } from './users/entities/actors.entity';
import { MovieCast } from './movies/entities/movie-cast.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env"
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100
      }
    ]),
    WinstonModule.forRoot(winstonConfig),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "postgres",
      url: String(process.env.DB_URL),
      synchronize: true,
      entities: [User, Profile, SubscriptionPlan, UserSubscription, Payment, Category, Movie, MovieCategory, MovieFile, PendingUser, ProcessingUser, Favourites, Reviews, Actor, MovieCast]
    }),
    UsersModule,
    SubscriptionsModule,
    SubscriptionsModule,
    PaymentsModule,
    CategoriesModule,
    MoviesModule,
    AuthModule,
    FavouritesModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: ExceptionFilterFilter
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
})
export class AppModule { }
