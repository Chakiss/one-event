import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest() as RequestWithUser;
    return request.user;
  },
);
