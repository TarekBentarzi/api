import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../../secondary/user/service/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';

type UserWithoutPassword = {
  id: string;
  name: string;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.userService.findByEmail(email);
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return {
        id: result.id,
        name: result.name,
        email: result.email,
      };
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<{
    access_token: string;
    user: UserWithoutPassword;
  }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload: { email: string; sub: string } = {
      email: user.email,
      sub: user.id,
    };
    const token = this.jwtService.sign(payload);
    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
