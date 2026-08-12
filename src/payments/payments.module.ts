import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Conflict } from '../utils/conflict';
import { UserSubscriptionsService } from '../subscriptions/user-subscriptions.service';
import { UserSubscription } from '../subscriptions/entities/user-subscription.entity';
import { SubscriptionPlan } from '../subscriptions/entities/subscription-plan.entity';
import { User } from '../users/entities/user.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { Token } from '../utils/Token';
import { Reviews } from '../movies/entities/reviews.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      UserSubscription,
      SubscriptionPlan,
      User,
      Reviews
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, Conflict, UserSubscriptionsService, Token],
})
export class PaymentsModule { }
