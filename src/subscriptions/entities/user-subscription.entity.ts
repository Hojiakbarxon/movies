import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { Payment } from '../../payments/entities/payment.entity';

export enum SubscriptionStatus {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    CANCELED = 'canceled',
    PENDING_PAYMENT = 'pending_payment',
}

@Entity('user_subscriptions')
export class UserSubscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => SubscriptionPlan, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'plan_id' })
    plan: SubscriptionPlan;

    @Column({ type: "timestamp", nullable: true })
    start_date: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    end_date: Date | null;

    @Column({
        type: 'enum',
        enum: SubscriptionStatus,
        default: SubscriptionStatus.PENDING_PAYMENT,
    })
    status: SubscriptionStatus;

    @Column({ type: 'boolean', default: false })
    auto_renew: boolean;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => Payment, (payment) => payment.user_subscription)
    payments: Payment[]
}