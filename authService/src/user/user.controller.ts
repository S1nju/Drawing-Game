import { Controller } from '@nestjs/common';
import { CheckUserRequest, UsersServiceControllerMethods,UsersServiceController, CheckUserResponse, CheckByIdRequest, CheckByIdResponse } from 'types/proto/user';
import { UserService } from './user.service';
import { Observable } from 'rxjs';

@Controller('user')
@UsersServiceControllerMethods()
export class UserController implements UsersServiceController {
      constructor(private readonly usersService: UserService) {}

    async checkUser(request: CheckUserRequest): Promise<CheckUserResponse> {
         const user = await this.usersService.ckeck(request.sessionId);
         if (!user ) {
            return {check:0};
        }
        return { check: 1 };
    }

    async checkById(request: CheckByIdRequest): Promise<CheckByIdResponse> {
      const user = await this.usersService.checkUsername(request.id);
      if (user) {
        return { check: 1 };
      }
      return { check: 0 };
    }
}


