import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User, UserRole } from '../../../users/entities/user.entity';
import { ROLES_KEY } from '../../decorators/role.decorator';
import { Conflict } from '../../../utils/conflict';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly conflicts: Conflict,
    @InjectRepository(User) private readonly userRepo: Repository<User>
  ) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    const { user } = context.switchToHttp().getRequest();
    let realUser = await this.userRepo.findOne({ where: { id: user.id } });
    if (!realUser) throw new ForbiddenException("You have no permission.");
    if (!requiredRoles) return true;

    if (!requiredRoles.includes(realUser.role)) throw new ForbiddenException("You have no permission.");

    return true;
  }
}
