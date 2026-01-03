import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RegisterDto, LoginDto } from '@my-org/api-interfaces';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly db: DatabaseService) {}

  async register(dto: RegisterDto) {
    const existing = await this.db.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.db.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email,
        password: hashedPassword,
        role: dto.role || 'CUSTOMER',
      },
    });

    // Return user without password
    const { password, ...result } = user;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.db.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // TODO: Return JWT
    const { password, ...result } = user;
    return {
      message: 'Login successful',
      user: result,
    };
  }
}
