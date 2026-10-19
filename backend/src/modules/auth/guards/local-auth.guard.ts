import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalAuthGuard extends PassportStrategy(Strategy) {
  constructor() {
    super({ usernameField: 'phone' });
  }

  async validate(phone: string, password: string): Promise<any> {
    return { phone, password };
  }
}
