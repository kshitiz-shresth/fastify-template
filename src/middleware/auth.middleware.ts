import { FastifyRequest, FastifyReply } from "fastify";
import { UserGetMe } from "../types";

// JWT authentication middleware
export async function jwtAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Extract the token from the Authorization header
    const token = request.headers["authorization"]?.split(" ")[1];

    if (!token && process.env.NODE_ENV !== "local") {
      return reply
        .status(401)
        .send({ success: false, message: "Unauthorized" });
    }

    // Verify the JWT token using fastify-jwt
    let user;
    if (process.env.NODE_ENV === "local") {
      user = { id: 1, email: "john001@mailinator.com" };
    } else {
      user = await request.jwtVerify();
    }
    request.userData = user as UserGetMe; // Attach user info to the request object for use in routes
  } catch (err) {
    return reply
      .status(401)
      .send({ success: false, message: "Invalid or expired token" });
  }
}
