import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { CurrentUser as CurrentUserType } from '../types';

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserType | undefined, ctx: ExecutionContext): CurrentUserType => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }

    const result = data ? user[data] : user;
    
    return result;
  },
);
