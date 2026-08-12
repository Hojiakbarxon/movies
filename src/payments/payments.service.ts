import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Isuccess } from '../utils/success-response-interface';
import { Conflict } from '../utils/conflict';
import { UserSubscription, SubscriptionStatus } from '../subscriptions/entities/user-subscription.entity';
import { UserSubscriptionsService } from '../subscriptions/user-subscriptions.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(UserSubscription)
    private readonly userSubRepo: Repository<UserSubscription>,
    private readonly conflict: Conflict,
    private readonly userSubscriptionsService: UserSubscriptionsService,
  ) { }

  async pay(dto: CreatePaymentDto): Promise<Isuccess> {
    const userSub = (await this.conflict.mustExist(
      { id: dto.user_subscription_id },
      this.userSubRepo,
      'UserSubscription',
      'ID',
    )) as UserSubscription;

    // reload with plan relation since mustExist doesn't specify relations
    const fullSub = await this.userSubRepo.findOne({
      where: { id: userSub.id },
      relations: { plan: true },
    });
    if (!fullSub) throw new BadRequestException('Subscription not found');

    if (fullSub.status === SubscriptionStatus.ACTIVE) {
      throw new BadRequestException(
        `This subscription is already ${fullSub.status}, cannot pay again`,
      );
    }

    // --- DEMO LOGIC: no real payment gateway, always succeeds ---
    const payment = this.paymentRepo.create({
      user_subscription: fullSub,
      amount: fullSub.plan.price,
      payment_method: dto.payment_method,
      payment_details: dto.payment_details ?? null,
      status: PaymentStatus.COMPLETED,
      external_transaction_id: `demo_txn_${uuidv4()}`,
    });

    const savedPayment = await this.paymentRepo.save(payment);

    // activate the subscription now that payment "succeeded"
    await this.userSubscriptionsService.activate(fullSub.id);

    return {
      statusCode: 201,
      message: 'Payment completed and subscription activated',
      data: savedPayment,
    };
  }

  async findAll(): Promise<Isuccess> {
    const payments = await this.paymentRepo.find({
      relations: { user_subscription: true },
      order: { created_at: 'DESC' },
    });

    return {
      statusCode: 200,
      message: 'All payments',
      data: payments,
    };
  }

  async findOne(id: string): Promise<Isuccess> {
    const payment = await this.conflict.mustExist({ id }, this.paymentRepo, 'Payment', 'ID');

    return {
      statusCode: 200,
      message: 'Payment with the given UUID',
      data: payment,
    };
  }

  async refund(id: string): Promise<Isuccess> {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: {
        user_subscription: true
      }
    });

    if (!payment) throw new NotFoundException("The payment with the given ID is not found");

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    await this.paymentRepo.update(id, { status: PaymentStatus.REFUNDED });
    const updated = await this.paymentRepo.findOne({ where: { id } }) as Payment;

    const userSubId = payment.user_subscription.id;

    await this.userSubRepo.update(userSubId, {
      start_date: null,
      end_date: null,
      status: SubscriptionStatus.CANCELED
    })

    return {
      statusCode: 200,
      message: 'Payment has been refunded',
      data: updated,
    };
  }
}