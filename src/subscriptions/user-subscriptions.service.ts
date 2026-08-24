import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { UserSubscription, SubscriptionStatus } from './entities/user-subscription.entity';
import { PurchaseSubscriptionDto } from './dto/purchase-subscription.dto';
import { UpdateUserSubscriptionDto } from './dto/update-user-subscription.dto';
import { Isuccess } from '../utils/success-response-interface';
import { Conflict } from '../utils/conflict';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { User } from '../users/entities/user.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { v4 as uuidv4 } from "uuid"
@Injectable()
export class UserSubscriptionsService {
  constructor(
    @InjectRepository(UserSubscription)
    private readonly userSubRepo: Repository<UserSubscription>,
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    private readonly conflict: Conflict,
  ) { }

  async purchase(userId: string, dto: PurchaseSubscriptionDto): Promise<Isuccess> {
    const user = await this.conflict.mustExist({ id: userId }, this.userRepo, 'User', 'ID') as User;
    const plan = (await this.conflict.mustExist(
      { id: dto.plan_id },
      this.planRepo,
      'SubscriptionPlan',
      'ID',
    )) as SubscriptionPlan;

    const userSub = this.userSubRepo.create({
      user,
      plan,
      status: SubscriptionStatus.PENDING_PAYMENT,
      auto_renew: dto.auto_renew ?? false,
    });

    const savedSub = await this.userSubRepo.save(userSub);

    return {
      statusCode: 201,
      message: 'Subscription created, awaiting payment',
      data: savedSub,
    };
  }

  async findAll(): Promise<Isuccess> {
    const subs = await this.userSubRepo.find({ relations: { user: true, plan: true } });

    return {
      statusCode: 200,
      message: 'All subscriptions',
      data: subs,
    };
  }

  async findOne(id: string): Promise<Isuccess> {
    const sub = await this.conflict.mustExist({ id }, this.userSubRepo, 'UserSubscription', 'ID');

    return {
      statusCode: 200,
      message: 'Subscription with the given UUID',
      data: sub,
    };
  }

  async findByUser(userId: string): Promise<Isuccess> {
    const subs = await this.userSubRepo.find({
      where: { user: { id: userId } },
      relations: { plan: true },
      order: { created_at: 'DESC' },
    });

    return {
      statusCode: 200,
      message: 'Subscriptions for user',
      data: subs,
    };
  }

  async update(id: string, dto: UpdateUserSubscriptionDto): Promise<Isuccess> {
    await this.conflict.mustExist({ id }, this.userSubRepo, 'UserSubscription', 'ID');
    await this.userSubRepo.update(id, { ...dto });
    const updatedSub = await this.userSubRepo.findOne({
      where: { id },
      relations: { user: true, plan: true },
    }) as UserSubscription;

    return {
      statusCode: 200,
      message: 'Subscription has been updated successfully',
      data: updatedSub,
    };
  }

  async remove(id: string): Promise<Isuccess> {
    await this.conflict.mustExist({ id }, this.userSubRepo, 'UserSubscription', 'ID');
    await this.userSubRepo.delete({ id });

    return {
      statusCode: 200,
      message: 'Subscription has been deleted successfully',
      data: {},
    };
  }

  // used internally by payments module — activates subscription after successful payment
  async activate(id: string): Promise<Isuccess> {
    const sub = await this.userSubRepo.findOne({
      where: { id },
      relations: {
        plan: true
      }
    });


    if (!sub) throw new NotFoundException(`Subscription not found`);

    const start_date = new Date();
    const end_date = new Date(start_date);
    end_date.setDate(end_date.getDate() + sub.plan.duration_days);

    await this.userSubRepo.update(id, {
      status: SubscriptionStatus.ACTIVE,
      start_date,
      end_date
    });

    const updated = await this.userSubRepo.findOne({
      where: { id },
      relations: { user: true, plan: true },
    });

    if (!updated) throw new Error('Subscription not found after activation');
    return {
      statusCode: 200,
      message: "Subscription payment is finished successfully",
      data: updated
    }
  }
}