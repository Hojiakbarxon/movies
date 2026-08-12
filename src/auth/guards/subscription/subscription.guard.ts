import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserRole } from '../../../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionStatus, UserSubscription } from '../../../subscriptions/entities/user-subscription.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    @InjectRepository(UserSubscription) private readonly userSubRepo: Repository<UserSubscription>
  ) {

  }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    if (!req.user) {
      req.canWatch = false;
      return true
    }
    if ([UserRole.SUPERADMIN, UserRole.ADMIN].includes(req.user.role)) {
      req.canWatch = true;
      return true;
    }
    const activeSub = await this.userSubRepo.findOne({
      where: {
        user: {
          id: req.user.id
        },
        status: SubscriptionStatus.ACTIVE
      },
      relations: {
        user: true
      }
    });

    if (!activeSub) {
      req.canWatch = false;
      return true
    }
    req.canWatch = true;
    return true;
  }
}
