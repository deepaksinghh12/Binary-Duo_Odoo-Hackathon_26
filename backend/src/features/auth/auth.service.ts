import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { ConflictError, UnauthorizedError, BadRequestError } from '../../shared/errors';
import { validate } from '../../utils/validate';
import { authRepository } from './auth.repository';
import { CreateUserInput, LoginInput, AuthResponseData, VerifyOtpInput } from './auth.types';
import { signupSchema, loginSchema, verifyOtpSchema } from './auth.validation';

export const authService = {
  /**
   * Register a new user. Creates the account as unverified and triggers OTP send.
   */
  async signup(input: CreateUserInput): Promise<{ message: string; email: string }> {
    // 1. Validate payload structure using schema helper
    const payload = validate(signupSchema, input);

    // 2. Check if user already exists
    const existingUser = await authRepository.findByEmail(payload.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // 3. Hash the password with 12 rounds of salt
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(payload.password, salt);

    // 4. Create the user in database as unverified
    await authRepository.createUser({
      name: payload.name,
      email: payload.email,
      password_hash: passwordHash,
      role: payload.role ?? 'employee',
      department_id: payload.departmentId,
    });

    // 5. Send verification OTP
    await this.sendOtp(payload.email);

    return {
      message: 'Registration successful. Verification OTP sent to email.',
      email: payload.email,
    };
  },

  /**
   * Log in an existing user. If user is unverified, blocks access and sends a new OTP.
   */
  async login(input: LoginInput): Promise<AuthResponseData | { otpRequired: true; email: string; message: string }> {
    // 1. Validate payload
    const payload = validate(loginSchema, input);

    // 2. Find user
    const user = await authRepository.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // 3. Check if user account is deactivated
    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated. Please contact an admin.');
    }

    // 4. Compare passwords
    const isPasswordValid = await bcrypt.compare(payload.password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // 5. If user is not verified, require OTP verification first
    if (!user.is_verified) {
      await this.sendOtp(user.email);
      return {
        otpRequired: true,
        email: user.email,
        message: 'Account not verified. Verification OTP sent.',
      };
    }

    // 6. Generate JWT for verified user
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
   * Generate and send a 6-digit OTP verification code.
   * Logs code to console for development testing.
   */
  async sendOtp(email: string): Promise<{ success: boolean; message: string }> {
    // Generate a secure 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Expire in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save to database
    await authRepository.saveOtp(email, code, expiresAt);

    // Log code to terminal in development/testing mode so users can view it
    console.log(`\n📧 [EMAIL SIMULATION] Sent OTP to "${email}": ${code} (expires in 5 minutes)\n`);

    return {
      success: true,
      message: 'Verification OTP sent successfully.',
    };
  },

  /**
   * Verify the OTP and issue a JWT to complete authentication.
   */
  async verifyOtp(input: VerifyOtpInput): Promise<AuthResponseData> {
    // 1. Validate payload
    const payload = validate(verifyOtpSchema, input);

    // 2. Find active OTP
    const activeOtp = await authRepository.findActiveOtp(payload.email, payload.code);
    if (!activeOtp) {
      throw new UnauthorizedError('Invalid or expired verification code');
    }

    // 3. Mark OTP as used
    await authRepository.markOtpAsUsed(activeOtp.id);

    // 4. Mark user as verified
    await authRepository.verifyUserEmail(payload.email);

    // 5. Fetch user to return auth response
    const user = await authRepository.findByEmail(payload.email);
    if (!user) {
      throw new BadRequestError('User not found after verification');
    }

    // 6. Generate final JWT
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
