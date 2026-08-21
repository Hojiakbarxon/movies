import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { UserSubscription } from '../../subscriptions/entities/user-subscription.entity';
import { TimestampedEntity } from '../../utils/base.entity';

export enum PaymentMethod {
    CARD = 'card',
    PAYPAL = 'paypal',
    BANK_TRANSFER = 'bank_transfer',
    CRYPTO = 'crypto',
}

export enum PaymentStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    REFUNDED = 'refunded',
}

@Entity('payments')
export class Payment extends TimestampedEntity {
    @ManyToOne(() => UserSubscription, (userSub) => userSub.payments,{ onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_subscription_id' })
    user_subscription: UserSubscription;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'enum', enum: PaymentMethod })
    payment_method: PaymentMethod;

    @Column({ type: 'json', nullable: true })
    payment_details: Record<string, any> | null;

    @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus;

    @Column({ type: 'varchar', length: 100, nullable: true })
    external_transaction_id: string | null;
}