import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller";
import { jwtAuth } from "../middleware/auth.middleware";

export default async function authRoutes(
  server: FastifyInstance
): Promise<void> {
  const controller = new AuthController(server);

  // Register route
  server.post(
    "/register",
    {
      schema: {
        tags: ["Auth"],
        body: {
          type: "object",
          required: ["email", "password", "firstName", "lastName"],
          properties: {
            email: { type: "string" },
            password: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            companyName: { type: "string" },
            companyWebsite: { type: "string" },
          },
          examples: [
            {
              email: "john001@mailinator.com",
              password: "password123",
              firstName: "John",
              lastName: "Hero",
              companyName: "Hero Company",
              companyWebsite: "herocomany.com",
            },
          ],
        },
      },
    },
    controller.registerHandler.bind(controller)
  );

  // Login route
  server.post(
    "/login",
    {
      schema: {
        tags: ["Auth"],
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string" },
            password: { type: "string" },
          },
          examples: [
            {
              email: "john001@mailinator.com",
              password: "password123",
            },
          ],
        },
      },
    },
    controller.loginHandler.bind(controller)
  );

  // Reset password route
  server.post(
    "/forgot-password",
    {
      schema: {
        tags: ["Auth"],
        body: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string" },
          },
          examples: [
            {
              email: "john001@mailinator.com",
            },
          ],
        },
      },
    },
    controller.forgotPasswordHandler.bind(controller)
  );

  // Reset password route
  server.post("/reset-password/:token", {
    schema: {
      tags: ["Auth"],
      body: {
        type: "object",
        required: ["newPassword"],
        properties: {
          newPassword: {
            type: "string",
            description: "The new password for the user account",
          },
        },
        examples: [
          {
            newPassword: "newPassword123",
          },
        ],
      },
    },
    handler: controller.resetPasswordHandler.bind(controller),
  });

  server.get(
    "/me",
    {
      schema: {
        tags: ["Private"],
      },
      preValidation: jwtAuth, // Use the JWT auth middleware
    },
    controller.getmeHandler.bind(controller)
  );
}
