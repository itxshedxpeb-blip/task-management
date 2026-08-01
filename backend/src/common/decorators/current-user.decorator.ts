import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { CurrentUser as CurrentUserType } from '../types';

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserType | undefined, ctx: ExecutionContext): CurrentUserType => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    console.log('[CurrentUser decorator] Extracting user from request:', {
      hasUser: !!user,
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      dataRequested: data,
    });

    if (!user) {
      console.error('[CurrentUser decorator] No user found in request');
      throw new UnauthorizedException('Not authenticated');
    }

    const result = data ? user[data] : user;
    console.log('[CurrentUser decorator] Returning:', data ? { [data]: result } : result);
    
    return result;
  },
);
