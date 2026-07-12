import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../config/env';
import { UnauthorizedError, BadRequestError } from '../../shared/errors';
import { validate } from '../../utils/validate';
import { authRepository } from './auth.repository';
import { CreateUserInput, LoginInput, AuthResponseData, VerifyOtpInput, PendingSignup } from './auth.types';
import { signupSchema, loginSchema, verifyOtpSchema, refreshTokenSchema } from './auth.validation';
import { cache } from '../../utils/cache';

// Expiries & Lockout Configurations
const PENDING_REGISTRATION_EXPIRY = 15 * 60 * 1000; // 15 mins
const LOCKOUT_ATTEMPTS_LIMIT = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 mins
const OTP_GEN_LIMIT_COUNT = 3;
const OTP_GEN_LIMIT_WINDOW = 10 * 60 * 1000; // 10 mins

export const authService = {
  /**
   * Register a new user.
   * Generates OTP, stores user info temporarily in cache, and does NOT write to database yet.
   * Implementation features generic responses to prevent email harvesting.
   */
  async signup(input: CreateUserInput): Promise<{ success: boolean; message: string }> {
    // 1. Validate payload structure using schema helper
    const payload = validate(signupSchema, input);

    // 2. Rate-limit OTP generation requests per email (Max 3 per 10 minutes)
    await this.checkOtpGenerationRate(payload.email);

    // 3. Generic response if user already exists in PostgreSQL
    const existingUser = await authRepository.findByEmail(payload.email);
    if (existingUser) {
      // Simulate slow response to prevent timing attacks, then return generic success
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        success: true,
        message: 'OTP sent to email.',
      };
    }

    // 4. Hash the password with 12 rounds of salt
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(payload.password, salt);

    // 5. Generate secure 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 6. Store pending signup in cache with 15 minutes TTL
    const cacheKey = `signup:pending:${payload.email}`;
    const pendingData: PendingSignup = {
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: payload.role ?? 'employee',
      departmentId: payload.departmentId,
      code,
      attempts: 0, // Track verification guesses
    };
    await cache.set(cacheKey, pendingData, PENDING_REGISTRATION_EXPIRY);

    // 7. Track OTP generation timestamp
    await this.trackOtpGeneration(payload.email);

    // 8. Simulate sending email (print OTP code to terminal console)
    console.log(`\n📧 [EMAIL SIMULATION] Sent OTP to "${payload.email}": ${code} (expires in 15 minutes)\n`);

    return {
      success: true,
      message: 'OTP sent to email.',
    };
  },

  /**
   * Log in an existing user.
   * Directly authenticates using PostgreSQL database (all users in DB are verified).
   * Implements account lockout after 5 failed login attempts.
   */
  async login(input: LoginInput): Promise<AuthResponseData> {
    // 1. Validate payload
    const payload = validate(loginSchema, input);

    // 2. Check if account is locked out
    const lockoutKey = `login:lockout:${payload.email}`;
    const failedAttemptsKey = `login:failed:${payload.email}`;
    const lockedUntil = await cache.get<number>(lockoutKey);

    if (lockedUntil && Date.now() < lockedUntil) {
      const minutesLeft = Math.ceil((lockedUntil - Date.now()) / (60 * 1000));
      throw new UnauthorizedError(
        `Account locked due to too many failed attempts. Try again in ${minutesLeft} minutes.`
      );
    }

    // 3. Find user in database
    const user = await authRepository.findByEmail(payload.email);
    if (!user) {
      await this.handleFailedLogin(payload.email);
      throw new UnauthorizedError('Invalid credentials');
    }

    // 4. Check if user account is active
    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated. Please contact an admin.');
    }

    // 5. Compare passwords
    const isPasswordValid = await bcrypt.compare(payload.password, user.password_hash);
    if (!isPasswordValid) {
      await this.handleFailedLogin(payload.email);
      throw new UnauthorizedError('Invalid credentials');
    }

    // 6. Clear failed login attempts on success
    await cache.delete(failedAttemptsKey);
    await cache.delete(lockoutKey);

    // 7. Generate access token + rotated refresh token
    const token = this.generateToken(user.id, user.email, user.role);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.department_id,
        xpTotal: user.xp_total,
        isVerified: user.is_verified,
      },
      token,
      refreshToken,
    };
  },

  /**
   * Generate and send a fresh OTP for a pending registration.
   * Uses generic messages to prevent exposing state.
   */
  async sendOtp(email: string): Promise<{ success: boolean; message: string }> {
    // Validate email format
    if (!email || !email.includes('@')) {
      throw new BadRequestError('Invalid email format');
    }

    // Rate-limit OTP generation requests per email (Max 3 per 10 minutes)
    await this.checkOtpGenerationRate(email);

    const cacheKey = `signup:pending:${email}`;
    const pendingData = await cache.get<PendingSignup>(cacheKey);
    
    // Generic response if not in cache (don't reveal that email doesn't have pending registration)
    if (!pendingData) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        success: true,
        message: 'Verification OTP sent successfully',
      };
    }

    // Generate new OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    pendingData.code = code;
    pendingData.attempts = 0; // Reset attempts for new code

    // Reset TTL in cache
    await cache.set(cacheKey, pendingData, PENDING_REGISTRATION_EXPIRY);

    // Track OTP generation timestamp
    await this.trackOtpGeneration(email);

    // Log code to terminal
    console.log(`\n📧 [EMAIL SIMULATION] Sent OTP to "${email}": ${code} (expires in 15 minutes)\n`);

    return {
      success: true,
      message: 'Verification OTP sent successfully',
    };
  },

  /**
   * Verify the OTP, save the user to database, clear cache, and issue access/refresh tokens.
   * Lockout pending registration after 5 incorrect verify attempts.
   */
  async verifyOtp(input: VerifyOtpInput): Promise<AuthResponseData> {
    const payload = validate(verifyOtpSchema, input);

    // 1. Fetch pending signup from cache
    const cacheKey = `signup:pending:${payload.email}`;
    const pendingData = await cache.get<PendingSignup>(cacheKey);

    if (!pendingData) {
      throw new UnauthorizedError('Invalid or expired verification code');
    }

    // 2. Match code and handle attempt count
    if (pendingData.code !== payload.code) {
      pendingData.attempts += 1;

      if (pendingData.attempts >= LOCKOUT_ATTEMPTS_LIMIT) {
        // Delete pending registration completely to block further guesses
        await cache.delete(cacheKey);
        throw new UnauthorizedError(
          'Too many incorrect verification attempts. This registration has been invalidated. Please sign up again.'
        );
      }

      // Save updated attempts count
      await cache.set(cacheKey, pendingData, PENDING_REGISTRATION_EXPIRY);
      throw new UnauthorizedError('Invalid or expired verification code');
    }

    // 3. Clear cache entry upon successful match
    await cache.delete(cacheKey);

    // 4. Save user to PostgreSQL database
    const createdUser = await authRepository.createUser({
      name: pendingData.name,
      email: pendingData.email,
      password_hash: pendingData.passwordHash,
      role: pendingData.role,
      department_id: pendingData.departmentId,
    });

    // 5. Mark user verified in database
    await authRepository.verifyUserEmail(createdUser.email);

    // 6. Generate access token + rotated refresh token
    const token = this.generateToken(createdUser.id, createdUser.email, createdUser.role);
    const refreshToken = await this.generateRefreshToken(createdUser.id);

    return {
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        departmentId: createdUser.department_id,
        xpTotal: createdUser.xp_total,
        isVerified: true,
      },
      token,
      refreshToken,
    };
  },

  /**
   * Session Refresh Token Rotation (RTR).
   * Validates refresh token, invalidates it on use, and issues a fresh pair.
   */
  async refreshSession(input: { refreshToken: string }): Promise<AuthResponseData> {
    const payload = validate(refreshTokenSchema, input);

    // 1. Find active refresh token in database
    const record = await authRepository.findRefreshToken(payload.refreshToken);
    if (!record) {
      throw new UnauthorizedError('Invalid or expired session');
    }

    // 2. Rotate token: Immediately revoke the used refresh token
    await authRepository.revokeRefreshToken(record.token);

    // 3. Fetch user
    const user = await authRepository.findById(record.user_id);
    if (!user || !user.is_active) {
      throw new UnauthorizedError('User session inactive');
    }

    // 4. Generate new tokens
    const token = this.generateToken(user.id, user.email, user.role);
    const newRefreshToken = await this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.department_id,
        xpTotal: user.xp_total,
        isVerified: user.is_verified,
      },
      token,
      refreshToken: newRefreshToken,
    };
  },

  /**
   * Log out user by revoking the refresh token.
   */
  async logout(refreshToken: string): Promise<void> {
    if (refreshToken) {
      await authRepository.revokeRefreshToken(refreshToken);
    }
  },

  /**
   * Generate a JWT access token.
   */
  generateToken(userId: string, email: string, role: string): string {
    return jwt.sign(
      { userId, email, role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
    );
  },

  /**
   * Generate a secure random refresh token and save to DB.
   */
  async generateRefreshToken(userId: string): Promise<string> {
    // Generate 80 hex characters (40 bytes) of cryptographically secure random values
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await authRepository.saveRefreshToken(userId, token, expiresAt);
    return token;
  },

  /**
   * Handle failed login attempt tracking and lockout trigger.
   */
  async handleFailedLogin(email: string): Promise<void> {
    const failedAttemptsKey = `login:failed:${email}`;
    const lockoutKey = `login:lockout:${email}`;

    const currentAttempts = (await cache.get<number>(failedAttemptsKey)) ?? 0;
    const newAttempts = currentAttempts + 1;

    if (newAttempts >= LOCKOUT_ATTEMPTS_LIMIT) {
      const lockoutExpiry = Date.now() + LOCKOUT_DURATION;
      await cache.set(lockoutKey, lockoutExpiry, LOCKOUT_DURATION);
      await cache.delete(failedAttemptsKey);
    } else {
      await cache.set(failedAttemptsKey, newAttempts, LOCKOUT_DURATION);
    }
  },

  /**
   * Track OTP generation requests to prevent spam.
   */
  async trackOtpGeneration(email: string): Promise<void> {
    const key = `otp:rate:${email}`;
    const now = Date.now();
    const timestamps = (await cache.get<number[]>(key)) ?? [];
    
    // Filter timestamps within window
    const validTimestamps = timestamps.filter((t) => now - t < OTP_GEN_LIMIT_WINDOW);
    validTimestamps.push(now);
    
    await cache.set(key, validTimestamps, OTP_GEN_LIMIT_WINDOW);
  },

  /**
   * Verify if email exceeded the OTP generation rate limit.
   */
  async checkOtpGenerationRate(email: string): Promise<void> {
    const key = `otp:rate:${email}`;
    const now = Date.now();
    const timestamps = (await cache.get<number[]>(key)) ?? [];
    
    const countWithinWindow = timestamps.filter((t) => now - t < OTP_GEN_LIMIT_WINDOW).length;
    if (countWithinWindow >= OTP_GEN_LIMIT_COUNT) {
      throw new BadRequestError('Too many OTP requests. Please wait before requesting another code.');
    }
  },
};
export default authService;
