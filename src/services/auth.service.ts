import { UserRepository } from "../repositories/user.repository";
import {  User } from "../types";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { emailService } from "./email.service";
import { create } from "domain";

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  // Register a new user
  async register(
    userData: User
  ): Promise<Omit<User, "password" | "reset_token" | "verification_token">> {
    // Check if the user already exists
    const existingUser = await this.userRepository.findUserByEmail(
      userData.email
    );
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create a new user with hashed password
    const newUserData: User = {
      ...userData,
      isVerified: true,
      password: hashedPassword, // Set the hashed password
    };

    // Save user to the databases
    const createdUser = await this.userRepository.createUser(newUserData);

    // Generate a verification token
    const verificationToken = crypto.randomBytes(20).toString("hex");

    await this.userRepository.updateUserVerificationToken(
      createdUser.id,
      verificationToken
    );

    // Send a verification email
    // const verificationUrl = `http://localhost:4000/verify-email?token=${verificationToken}`;
    await emailService.sendEmail(
      createdUser.email,
      "Welcome to Mytemplate! Let's Get Started",
      "welcome-email",
      { name: createdUser.firstName }
    );

    return createdUser;
  }

  async checkOldPassword(
    userId: number,
    oldPassword: string
  ): Promise<boolean> {
    // Fetch the user's data from the repository
    const user = await this.userRepository.findUserId(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    return isMatch;
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    // Verify the old password
    const isOldPasswordValid = await this.checkOldPassword(userId, oldPassword);
    if (!isOldPasswordValid) {
      throw new Error("Old password is incorrect");
    }
    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    // Update the user's password in the repository
    await this.userRepository.updateUser(userId, {
      password: hashedNewPassword,
    });
  }

  // Email verification
  async verifyEmail(token: string): Promise<User | null> {
    // Find the user by the verification token
    const user = await this.userRepository.findUserByVerificationToken(token);
    if (!user) {
      throw new Error("Invalid or expired verification token");
    }

    // Verify the user's email by setting a "verified" flag
    user.isVerified = true;
    user.verificationToken = null; // Remove the token
    await this.userRepository.updateUser(user.id, user);
    return user;
  }

  // Login a user
  async login(email: string, password: string): Promise<User | null> {
    // Find the user by email
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Check if the user's email is verified
    if (!user.isVerified) {
      throw new Error("Email not verified. Please check your inbox.");
    }

    // Return the user if login is successful
    return user;
  }

  // Generate password reset token
  async requestPasswordReset(email: string): Promise<void> {
    // Find the user by email
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("No user found with this email");
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    await this.userRepository.updateUserResetToken(user.id, resetToken);

    // Send a password reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await emailService.sendEmail(
      user.email,
      "Reset Your Password",
      "reset-password", // Template name
      { resetUrl }
    );
  }

  // Reset password
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<User | null> {
    // Find the user by reset token
    const user = await this.userRepository.findUserByResetToken(token);
    if (!user) {
      throw new Error("Invalid or expired reset token");
    }
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = null; // Remove the reset token

    // Update the user's password
    await this.userRepository.updateUser(user.id, user);

    return user;
  }
}
