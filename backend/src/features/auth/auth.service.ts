import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { ConflictError, UnauthorizedError, BadRequestError } from '../../shared/errors';
import { validate } from '../../utils/validate';
import { authRepository } from './auth.repository';
import { CreateUserInput, LoginInput, AuthResponseData, VerifyOtpInput, PendingSignup } from './auth.types';
import { signupSchema, loginSchema, verifyOtpSchema } from './auth.validation';
import { cache } from '../../utils/cache';

// Expiry for pending registration (15 minutes in milliseconds)
const PENDING_REGISTRATION_EXPIRY = 15 * 60 * 1000;

export const authService = {
  /**
   * Register a new user.
   * Generates OTP, stores user info temporarily in cache, and does NOT write to database yet.
   */
  async signup(input: CreateUserInput): Promise<{ success: boolean; message: string }> {
    // 1. Validate payload structure using schema helper
    const payload = validate(signupSchema, input);

    // 2. Check if user already exists in PostgreSQL
    const existingUser = await authRepository.findByEmail(payload.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // 3. Hash the password with 12 rounds of salt
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(payload.password, salt);

    // 4. Generate secure 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 5. Store pending signup in cache with 15 minutes TTL
    const cacheKey = `signup:pending:${payload.email}`;
    const pendingData: PendingSignup = {
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: payload.role ?? 'employee',
      departmentId: payload.departmentId,
      code,
    };
    await cache.set(cacheKey, pendingData, PENDING_REGISTRATION_EXPIRY);

    // 6. Simulate sending email (print OTP code to terminal console)
    console.log(`\n📧 [EMAIL SIMULATION] Sent OTP to "${payload.email}": ${code} (expires in 15 minutes)\n`);

    return {
      success: true,
      message: 'OTP sent to email.',
    };
  },

  /**
   * Log in an existing user.
   * Directly authenticates using PostgreSQL database (all users in DB are verified).
   */
  async login(input: LoginInput): Promise<AuthResponseData> {
    // 1. Validate payload
    const payload = validate(loginSchema, input);

    // 2. Find user in database
    const user = await authRepository.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // 3. Check if user account is active
    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated. Please contact an admin.');
    }

    // 4. Compare passwords
    const isPasswordValid = await bcrypt.compare(payload.password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // 5. Generate JWT token
    const token = this.generateToken(user.id, user.email, user.role);

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
    };
  },

  /**
   * Generate and send a fresh OTP for a pending registration.
   */
  async sendOtp(email: string): Promise<{ success: boolean; message: string }> {
    const cacheKey = `signup:pending:${email}`;
    const pendingData = await cache.get<PendingSignup>(cacheKey);
    
    if (!pendingData) {
      throw new BadRequestError('No pending registration found for this email. Please sign up first.');
    }

    // Generate new OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    pendingData.code = code;

    // Reset TTL in cache
    await cache.set(cacheKey, pendingData, PENDING_REGISTRATION_EXPIRY);

    // Log code to terminal
    console.log(`\n📧 [EMAIL SIMULATION] Sent OTP to "${email}": ${code} (expires in 15 minutes)\n`);

    return {
      success: true,
      message: 'Verification OTP sent successfully',
    };
  },

  /**
   * Verify the OTP, save the user to database, clear cache, and issue final JWT.
   */
  async verifyOtp(input: VerifyOtpInput): Promise<AuthResponseData> {
    const payload = validate(verifyOtpSchema, input);

    // 1. Fetch pending signup from cache
    const cacheKey = `signup:pending:${payload.email}`;
    const pendingData = await cache.get<PendingSignup>(cacheKey);

    if (!pendingData || pendingData.code !== payload.code) {
      throw new UnauthorizedError('Invalid or expired verification code');
    }

    // 2. Clear cache entry
    await cache.delete(cacheKey);

    // 3. Save user to PostgreSQL database
    const createdUser = await authRepository.createUser({
      name: pendingData.name,
      email: pendingData.email,
      password_hash: pendingData.passwordHash,
      role: pendingData.role,
      department_id: pendingData.departmentId,
    });

    // 4. Mark user verified in database (the repository marks is_verified: false by default, update to true)
    await authRepository.verifyUserEmail(createdUser.email);

    // 5. Generate final JWT token
    const token = this.generateToken(createdUser.id, createdUser.email, createdUser.role);

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
    };
  },

  /**
   * Generate a JWT token with the user's ID, email, and role.
   */
  generateToken(userId: string, email: string, role: string): string {
    return jwt.sign(
      { userId, email, role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
    );
  },
};
export default authService;
