import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User, UserRole } from '../../../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionStatus, UserSubscription } from '../../../subscriptions/entities/user-subscription.entity';
import { Repository } from 'typeorm';
import { AuthGuard } from '../auth/auth.guard';
import { Token } from '../../../utils/Token';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    @InjectRepository(UserSubscription) private readonly userSubRepo: Repository<UserSubscription>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly token : Token
  ) {

  }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization;

    if (!auth) {
      req.canWatch = false;
      return true;
    }

    const bearer = auth.split(" ")[0];
    const token = auth.split(" ")[1];

    if (bearer !== "Bearer" || !token) {
      req.canWatch = false;
      return true;
    }


    try {
      let data = this.token.verifyAccessToken(token) as any;
      let originalUser = await this.userRepo.findOne({ where: { id: data?.id } })

      if (!originalUser) {
        req.canWatch = false;
        return true;
      }

      req['user'] = data;
    } catch (error) {
      req.canWatch = false;
      return true;
    }


    const realUser = await this.userRepo.findOne({ where: { id: req.user.id } });
    if (!realUser) {
      req.canWatch = false;
      return true
    }
    if ([UserRole.SUPERADMIN, UserRole.ADMIN].includes(realUser.role)) {
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
