import knex from "knex";
import { User } from "../types";
import knexConfig from "../config/knexprod";

// Initialize knex with config
const db = knex(knexConfig);

export class UserRepository {
  // Find user by email
  async findUserId(id: number): Promise<User | undefined> {
    return db<User>("users").where({ id }).first();
  }

  // Find user by email
  async findAllUser(id: number): Promise<User[] | undefined> {
    return db<User>("users").where({ id });
  }

  // Find user by email
  async findUserByEmail(email: string): Promise<User | undefined> {
    return db<User>("users").where({ email }).first();
  }

  // Create a new user with a single object parameter
  async createUser(
    userData: User
  ): Promise<Omit<User, "password" | "reset_token" | "verification_token">> {
    const [id] = await db<User>("users").insert(userData);
    const {
      password,
      resetToken,
      verificationToken,
      id: _,
      ...userFiltered
    } = userData;
    return { id, ...userFiltered };
  }

  async updateUser(
    userId: number,
    userData: Partial<User>
  ): Promise<Omit<User, "password" | "reset_token" | "verification_token">> {
    // Update user in the database
    await db<User>("users").where({ id: userId }).update(userData);
    // Fetch updated user data
    const updatedUser = await db<User>("users").where({ id: userId }).first();
    if (!updatedUser) {
      throw new Error("User not found");
    }
    // Omit sensitive fields before returning
    const { password, resetToken, verificationToken, ...userFiltered } =
      updatedUser;
    return userFiltered;
  }

  // Update user with verification token
  async updateUserVerificationToken(
    userId: number,
    verificationToken: string
  ): Promise<void> {
    await db<User>("users").where({ id: userId }).update({ verificationToken });
  }

  // Find user by verification token
  async findUserByVerificationToken(token: string): Promise<User | undefined> {
    return db<User>("users").where({ verificationToken: token }).first();
  }

  // Update user with reset token
  async updateUserResetToken(user_id: number, token: string): Promise<void> {
    await db<User>("users")
      .where({ id: user_id })
      .update({ resetToken: token });
  }

  // Find user by reset token
  async findUserByResetToken(token: string): Promise<User | undefined> {
    return db<User>("users").where({ resetToken: token }).first();
  }
}
