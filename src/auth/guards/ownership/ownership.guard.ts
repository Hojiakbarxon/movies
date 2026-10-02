import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from '../../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Reviews } from '../../../movies/entities/reviews.entity';
import { Payment } from '../../../payments/entities/payment.entity';
import { isUUID } from 'class-validator';
import { UserSubscription } from '../../../subscriptions/entities/user-subscription.entity';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Reviews) private readonly reviewRepo: Repository<Reviews>,
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(UserSubscription) private readonly userSubRepo: Repository<UserSubscription>) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const realUser = await this.userRepo.findOne({ where: { id: user.id } });
    if (!realUser) throw new ForbiddenException("You have no permission!");

    if (req.params.review_id) {
      const reviewId = req.params.review_id;
      if (!isUUID(reviewId, '4')) throw new BadRequestException("Invalid review_id format")
      const review = await this.reviewRepo.findOne({
        where: {
          id: reviewId,
        },
        relations: {
          user: true
        }
      });

      if (!review) throw new NotFoundException("The review with this id is not found")
      if (realUser.role === UserRole.SUPERADMIN || user.role === UserRole.ADMIN) return true
      if (user.id === review?.user.id) return true

      throw new ForbiddenException("You have no permission!")
    };

    if (req.params.payment_id) {
      let paymentId = req.params.payment_id;
      if (!isUUID(paymentId, '4')) throw new BadRequestException("Invalid payment_id format")
      let payment = await this.paymentRepo.findOne({
        where: {
          id: paymentId
        },
        relations: {
          user_subscription: {
            user: true
          }
        }
      });

      if (!payment) throw new NotFoundException("Payment with this id is not found.");

      if (realUser.role === UserRole.SUPERADMIN || user.role === UserRole.ADMIN) return true
      if (user.id === payment.user_subscription.user.id) return true

      throw new ForbiddenException("You have no permission!");
    }

    if (req.params.userId) {
      const targetId = req.params.userId;
      if (!isUUID(targetId, '4')) throw new BadRequestException("Invalid user_id format");
      const targetedUser = await this.userRepo.findOne({ where: { id: targetId } });
      if (!targetedUser) throw new NotFoundException("User with this id is not found");

      if (realUser.role === UserRole.SUPERADMIN) return true;

      if (targetedUser.role === UserRole.SUPERADMIN) throw new ForbiddenException("You have no permission");

      if (realUser.role === UserRole.ADMIN) {
        if (targetedUser.role === UserRole.USER || user.id === targetId) return true
      }

      if (user.id === targetId) return true

      throw new ForbiddenException("You have no permission");
    };

    if (req.params.userSubId) {
      let userSubId = req.params.userSubId;
      if (!isUUID(userSubId, '4')) throw new BadRequestException("Invalid id format")
      let userSub = await this.userSubRepo.findOne({
        where: {
          id: userSubId
        },
        relations: {
          user: true
        }
      });

      if (!userSub) throw new NotFoundException("Not found");

      if (realUser.role === UserRole.SUPERADMIN || user.role === UserRole.ADMIN) return true
      if (user.id === userSub.user.id) return true

      throw new ForbiddenException("You have no permission!");
    }

    return true
  }
}
