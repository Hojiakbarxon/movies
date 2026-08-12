import { IsUUID, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';

export class PurchaseSubscriptionDto {
    @IsUUID()
    @IsNotEmpty()
    plan_id: string;

    @IsOptional()
    @IsBoolean()
    auto_renew?: boolean;
}