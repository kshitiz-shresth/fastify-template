import {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import authRoutes from "./auth.route";
import { exec } from "child_process";


export default async function apiRoutes(server: FastifyInstance) {
  // Register Auth Routes
  server.register(authRoutes, { prefix: "/auth" });
  server.post(
    "/deploy/:token",
    {
      schema: {
        tags: ["Extra"],
      },
    },
    async (
      request: FastifyRequest<{
        Params: { token: string };
      }>,
      reply
    ) => {
      try {
        // Log token and authenticated user (if needed for debugging)
        const { token } = request.params;
        const DEPLOY_TOKEN = process.env.DEPLOY_TOKEN;

        if (token !== DEPLOY_TOKEN) {
          return reply.status(401).send({
            success: false,
            message: "Unauthorized access. Invalid token.",
          });
        }

        // Run deployment commands
        exec(
          `git pull && npx knex migrate:latest && pm2 restart ${process.env.PM2_ID}`,
          (error, stdout, stderr) => {
            if (error) {
              console.error(`Deployment error: ${error}`);
              return reply.status(500).send({
                success: false,
                message: "Deployment failed",
                error: error.message,
              });
            }

            if (stderr) {
              console.error(`Deployment stderr: ${stderr}`);
              return reply.status(500).send({
                success: false,
                message: "Deployment failed",
                error: stderr,
              });
            }

            // Log the output for debugging
            console.log(`Deployment stdout: ${stdout}`);

            return reply.send({
              success: true,
              message: "Deployment completed successfully",
              output: stdout,
            });
          }
        );
      } catch (err) {
        console.error("Unexpected error during deployment:", err);
        reply.status(500).send({
          success: false,
          message: "An unexpected error occurred",
        });
      }
    }
  );
  // Add other route files here
  server.setErrorHandler(
    (error: FastifyError, request: any, reply: FastifyReply) => {
      console.error(error); // Log the error for debugging

      // If the error is an instance of Error, send the message
      if (error instanceof Error) {
        reply.status(400).send({ success: false, message: error.message });
      } else {
        // If the error is unknown, send a generic message
        reply
          .status(500)
          .send({ success: false, message: "An unknown error occurred." });
      }
    }
  );
}
