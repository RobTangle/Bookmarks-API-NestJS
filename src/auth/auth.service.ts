import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  signup() {
    return { msg: "I've signed up" };
  }
  signin() {
    return { msg: "I've signed in" };
  }
}
