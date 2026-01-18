import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable() // This decorator makes the class injectable (can be used by other classes)
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService, // Inject JWT service
  ) {}

  // REGISTER: Create a new user
  async register(registerDto: RegisterDto): Promise<Omit<User, 'password' | 'hashPassword'>> {
    const { email, password, firstName, lastName } = registerDto;

    // 1. Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      // 409 Conflict - resource already exists
      throw new ConflictException('User with this email already exists');
    }

    // 2. Create new user (password will be hashed by @BeforeInsert hook)
    const user = this.usersRepository.create({
      email,
      password,
      firstName,
      lastName,
    });

    // 3. Save to database
    await this.usersRepository.save(user);

    // 4. Return user WITHOUT password (never expose passwords!)
    const { password: _, ...result } = user;
    return result;
  }

  // LOGIN: Validate credentials and return JWT token + user info
  async login(loginDto: LoginDto): Promise<{
    access_token: string;
    user: Omit<User, 'password' | 'hashPassword'>;
  }> {
    const { email, password } = loginDto;

    // 1. Find user by email
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Compare passwords using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Create JWT payload - this data is encoded in the token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // 4. Remove password from user object
    const { password: _, ...userWithoutPassword } = user;
    

    // 5. Return token AND user info
    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }
}
