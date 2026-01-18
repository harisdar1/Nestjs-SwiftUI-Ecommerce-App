import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// This guard uses the 'jwt' strategy we defined
// AuthGuard('jwt') automatically looks for JwtStrategy
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// That's it! The heavy lifting is done by Passport + our JwtStrategy
// This guard will:
// 1. Extract token from Authorization header
// 2. Verify it using our secret
// 3. Check expiration
// 4. Call our validate() method
// 5. Attach user to request, or return 401
