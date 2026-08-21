import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { SubscriptionStatus, UserSubscription } from "./entities/user-subscription.entity";
import { LessThan, Repository } from "typeorm";
import { Payment, PaymentStatus } from "../payments/entities/payment.entity";
import { v4 as uuidv4 } from "uuid"
import { sendMail } from "../utils/mail.service";
import { UserSubscriptionsService } from "./user-subscriptions.service";
@Injectable()
export class Task {
    constructor(
        @InjectRepository(UserSubscription) private readonly userSubRepo: Repository<UserSubscription>,
        @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
        private readonly userSubService: UserSubscriptionsService
    ) {
    }
    @Cron(CronExpression.EVERY_HOUR)
    async deactivateSubscription(): Promise<boolean> {
        await this.userSubRepo.update({
            status: SubscriptionStatus.ACTIVE,
            auto_renew: false,
            end_date: LessThan(new Date())
        }, {
            status: SubscriptionStatus.EXPIRED
        });

        return true
    }

    @Cron(CronExpression.EVERY_HOUR)
    async renewSubscription(): Promise<boolean> {
        let renewedSubscriptions = await this.userSubRepo.find({
            where: {
                auto_renew: true,
                status: SubscriptionStatus.ACTIVE,
                end_date: LessThan(new Date())
            },
            relations: {
                plan: true,
                user: true,
                payments: true
            }
        });

        renewedSubscriptions.forEach(async (userSub) => {

            let payment = this.paymentRepo.create({
                user_subscription: userSub,
                payment_details: userSub.payments.at(-1)?.payment_details,
                payment_method: userSub.payments.at(-1)?.payment_method,
                status: PaymentStatus.COMPLETED,
                amount: userSub.plan.price,
                external_transaction_id: `demo_txn_${uuidv4()}`
            })
            let savedPayment = await this.paymentRepo.save(payment)
            await this.userSubService.activate(userSub.id);

            await sendMail('olimxojayev22.2007@gmail.com', `${userSub.user.username}'s subscription automatically renewed`);
        })

        return true
    }
}