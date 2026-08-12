import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { SubscriptionStatus } from '../entities/user-subscription.entity';

export class UpdateUserSubscriptionDto {
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsBoolean()
  auto_renew?: boolean;
}