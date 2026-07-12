import db from '../../database/knex';
import { UserRecord, OtpRecord } from './auth.types';
import { UserRole } from '../../shared/types';

export const authRepository = {
  /**
   * Find a user by their unique email.
   * Parameterised by Knex under the hood to prevent SQL injection.
   */
  async findByEmail(email: string): Promise<UserRecord | undefined> {
    return db<UserRecord>('users')
      .where({ email })
      .first();
  },

  /**
   * Insert a new user record into the users table.
   * Parameterised by Knex.
   */
  async createUser(user: {
    name: string;
    email: string;
    password_hash: string;
    role: UserRole;
    department_id?: string;
  }): Promise<UserRecord> {
    const [createdUser] = await db<UserRecord>('users')
      .insert({
        name: user.name,
        email: user.email,
        password_hash: user.password_hash,
        role: user.role,
        department_id: user.department_id || null,
        is_verified: false, // Default to unverified until OTP check
      })
      .returning('*');

    return createdUser;
  },

  /**
   * Find a user by their primary ID.
   */
  async findById(id: string): Promise<UserRecord | undefined> {
    return db<UserRecord>('users')
      .where({ id })
      .first();
  },

  /**
   * Insert an OTP verification code.
   */
  async saveOtp(email: string, code: string, expiresAt: Date): Promise<OtpRecord> {
    const [otpRecord] = await db<OtpRecord>('otps')
      .insert({
        email,
        otp_code: code,
        expires_at: expiresAt,
        is_used: false,
      })
      .returning('*');

    return otpRecord;
  },

  /**
   * Find the latest unused, active OTP for an email.
   */
  async findActiveOtp(email: string, code: string): Promise<OtpRecord | undefined> {
    return db<OtpRecord>('otps')
      .where({ email, otp_code: code, is_used: false })
      .andWhere('expires_at', '>', new Date())
      .orderBy('created_at', 'desc')
      .first();
  },

  /**
   * Mark an OTP code as used.
   */
  async markOtpAsUsed(id: string): Promise<void> {
    await db('otps')
      .where({ id })
      .update({ is_used: true });
  },

  /**
   * Mark user's email as verified.
   */
  async verifyUserEmail(email: string): Promise<void> {
    await db('users')
      .where({ email })
      .update({ is_verified: true, is_active: true });
  },
};
