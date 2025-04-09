import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../services/auth.service";
import { User } from "../types";
import { UserRepository } from "../repositories/user.repository";
import { sendResponse } from "../utils/responses";

// Request body interfaces
interface RegisterRequestBody extends User {}

interface LoginRequestBody {
  email: string;
  password: string;
}

export class AuthController {
  private service: AuthService;
  private userRepository: UserRepository;
  private server: any;

  constructor(server: any) {
    this.service = new AuthService();
    this.userRepository = new UserRepository();
    this.server = server; // Storing Fastify instance to access server.jwt
  }

  // Register handler
  async registerHandler(
    request: FastifyRequest<{ Body: RegisterRequestBody }>,
    reply: FastifyReply
  ): Promise<void> {
    const userData: User = request.body;
    const user = await this.service.register(userData);
    reply.send(
      sendResponse({
        data: { user },
        message: "User registered successfully",
      })
    );
  }

  // Login handler
  async loginHandler(
    request: FastifyRequest<{ Body: LoginRequestBody }>,
    reply: FastifyReply
  ): Promise<void> {
    const { email, password } = request.body;
    const user = await this.service.login(email, password);
    if (user) {
      const {
        password,
        isVerified,
        resetToken,
        verificationToken,
        ...userFilter
      } = user;
      const token = this.server.jwt.sign({ email: user.email, id: user.id });
      reply.send(
        sendResponse({
          data: {
            token,
            user: userFilter,
          },
          message: "Logged in successfully",
        })
      );
    }
  }

  async forgotPasswordHandler(
    request: FastifyRequest<{ Body: { email: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { email } = request.body;
    await this.service.requestPasswordReset(email);
    reply.send({
      success: true,
      message: "Reset password email has been sent successfully",
    });
  }

  async resetPasswordHandler(
    request: FastifyRequest<{
      Params: { token: string };
      Body: { newPassword: string };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const { token } = request.params;
    const { newPassword } = request.body;

    await this.service.resetPassword(token, newPassword);

    reply.send({
      success: true,
      message: "Password has been reset successfully.",
    });
  }

  async getmeHandler(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (request.userData?.id) {
      const user = await this.userRepository.findUserId(request.userData?.id);
      if (user) {
        const {
          password,
          isVerified,
          resetToken,
          verificationToken,
          ...userFilter
        } = user;

        reply.send({
          success: true,
          message: "User fetched successfully",
          data: userFilter,
        });
      }
    } else {
      throw new Error("Somthing went wrong");
    }
  }
}
