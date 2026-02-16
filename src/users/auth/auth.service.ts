import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../create-user.dto';
import { LoginResponse } from '../login.response';
import { PasswordService } from '../password/password.service';
import { User } from '../user.entity';
import { UsersService } from '../users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  public async register(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersService.findOneByEmailOrNull(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    const user = await this.usersService.createUser(createUserDto);
    return user;
  }

  public async login(email: string, password: string): Promise<LoginResponse> {
    const user = (await this.usersService.findOneByEmail(email)) as User;

    if (!(user instanceof User)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.comparePasswords(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateToken(user);

    return new LoginResponse({
      accessToken,
    });
  }

  private generateToken(user: User) {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    };

    return this.jwtService.sign(payload);
  }
}
