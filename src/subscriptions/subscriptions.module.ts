import { Module } from '@nestjs/common';
import { SubscriptionPlansService } from './subscriptions-plans.service';
import { SubscriptionPlansController } from './subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { Conflict } from '../utils/conflict';
import { UserSubscriptionsService } from './user-subscriptions.service';
import { UserSubscriptionsController } from './user-subscriptions.controller';
import { UserSubscription } from './entities/user-subscription.entity';
import { User } from '../users/entities/user.entity';
import { Token } from '../utils/Token';
import { Payment } from '../payments/entities/payment.entity';
import { Reviews } from '../movies/entities/reviews.entity';
import { Task } from './tasks.service';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      SubscriptionPlan,
      UserSubscription,
      User,
      Payment,
      Reviews
    ])
  ],
  controllers: [SubscriptionPlansController, UserSubscriptionsController],
  providers: [SubscriptionPlansService, Conflict, UserSubscriptionsService, Token, Task]
})
export class SubscriptionsModule {}
