import { IsUUID, IsEnum, IsOptional, IsObject } from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
    @IsUUID()
    user_subscription_id: string;

    @IsEnum(PaymentMethod)
    payment_method: PaymentMethod;

    @IsOptional()
    @IsObject()
    payment_details?: Record<string, any>;
}