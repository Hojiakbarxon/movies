import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Token } from '../../../utils/Token';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly token: Token,
    @InjectRepository(User) private readonly userRepo: Repository<User>
  ) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean>  {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization;

    if (!auth) throw new UnauthorizedException("Please sign in first");

    const bearer = auth.split(" ")[0];
    const token = auth.split(" ")[1];

    if (bearer !== "Bearer" || !token) throw new BadRequestException("Invalid token.");


    try {
      let data  = this.token.verifyAccessToken(token) as any;
      let realUser =await this.userRepo.findOne({where : {id : data?.id}})
      
      if (!realUser) throw new Error

      req['user'] = data;
    } catch (error) {
      throw new UnauthorizedException("Please log in.");
    }

    return true;
  }
}
