import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../services/auth.service";
import { UserRepository } from "../repositories/user.repository";
import { sendResponse } from "../utils/responses";
import { EditableUser, UpdatePassword } from "../types";
import fs from "fs";
import { S3Service } from "../services/s3.service";
import util from "util";
import { pipeline } from "stream";
import { MultipartFile } from "@fastify/multipart";
// Request body interfaces
const pump = util.promisify(pipeline);

export class UserController {
  private userRepository: UserRepository;
  private authService: AuthService;
  private s3Service: S3Service;

  constructor(server: any) {
    this.userRepository = new UserRepository();
    this.authService = new AuthService();
    this.s3Service = new S3Service();
  }

  // Update user handler
  async updateUser(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const userData = request.body as EditableUser;
    if (!request.userData?.id) throw new Error("Something went wrong");
    const user = await this.userRepository.updateUser(
      request.userData?.id,
      userData
    );
    reply.send(
      sendResponse({
        data: { user },
        message: "User updated successfully",
      })
    );
  }

  // Update password handler
  async updatePassword(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const { oldPassword, newPassword } = request.body as UpdatePassword;
    if (!request.userData?.id) throw new Error("Something went wrong");
    const user = await this.authService.changePassword(
      request.userData?.id,
      oldPassword,
      newPassword
    );
    reply.send(
      sendResponse({
        data: {},
        message: "Password changed successfully",
      })
    );
  }

  // Update password handler
  async updateProfilePicture(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    // Retrieve the uploaded file
    const file = await request.file();
    if (!request.userData?.id) throw new Error("Something went wrong");
    const userId = request.userData?.id;
    if (!file) {
      reply.status(400).send(
        sendResponse({
          data: {},
          message: "No file uploaded",
          success: false,
        })
      );
      return;
    }
    const fileName = `${userId}_${Date.now()}_${file.filename}`;
    const filePath = `/tmp/${fileName}`; // Temporary file path
    const writeStream = fs.createWriteStream(filePath);
    await pump(file.file, writeStream);
    const fileUrl = await this.s3Service.uploadFile(
      filePath,
      `${process.env.NODE_ENV}/profile-pictures/${fileName}`
    );
    fs.unlinkSync(filePath);

    await this.userRepository.updateUser(userId, { avatar: fileUrl });

    reply.send(
      sendResponse({
        data: { fileUrl },
        message: "Profile picture updated successfully!",
        success: true,
      })
    );
  }
}
