import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Token } from '../../../utils/Token';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly token: Token) { }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization;

    if (!auth) throw new UnauthorizedException("Please sign in first");

    const bearer = auth.split(" ")[0];
    const token = auth.split(" ")[1];

    if (bearer !== "Bearer" || !token) throw new BadRequestException("Invalid token.");


    try {
      let data = this.token.verifyAccessToken(token);
      req['user'] = data;
    } catch (error) {
      throw new UnauthorizedException("Please log in.");
    }
    
    return true;
  }
}
