import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/register - PUBLIC
  // Limit: 3 registrations per minute (prevent spam accounts)
  @Post('register')
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // POST /auth/login - PUBLIC
  // Strict limit: 5 attempts per minute (prevent brute force)
  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // GET /auth/profile - PROTECTED (requires valid JWT)
  // Skip throttle for authenticated users checking their profile
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @Get('profile')
  getProfile(@Request() req) {
    // req.user is set by JwtStrategy.validate()
    // Contains: { id, email, role }
    return req.user;
  }
}
