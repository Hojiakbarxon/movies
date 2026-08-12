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


    let data = this.token.verifyAccessToken(token);

    if (!data) throw new UnauthorizedException("Invalid token");

    req['user'] = data;
    
    return true;
  }
}
