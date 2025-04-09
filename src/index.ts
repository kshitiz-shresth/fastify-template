import fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { swaggerOptions, swaggerUiOptions } from "./config/swagger";
import apiRoutes from "./routes/api";
import fastifyJwt from "@fastify/jwt";
import fastifyCors from "@fastify/cors";
import { ALLOWED_ORIGIN } from "./constants/security";
import { UserGetMe } from "./types";
import fastifyMultipart, { ajvFilePlugin } from "@fastify/multipart";
declare module "fastify" {
  interface FastifyRequest {
    userData?: UserGetMe;
  }
}

const server = fastify({
  logger: true,
});

server.register(fastifyMultipart, {
  limits: {
    fileSize: 50 * 1024 * 1024, // Set file size limit to 50 MB
  },
});

// Cors Skipper
server.register(fastifyCors, {
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGIN.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error("Not allowed by CORS"), false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

// Register Swagger for API documentation
server.register(swagger, swaggerOptions);

// Register Swagger UI for serving documentation
server.register(swaggerUi, swaggerUiOptions);

server.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || "jwt_secret",
});

// server.addHook("preHandler", bodyParser);

// Register Routes
server.register(apiRoutes, { prefix: "/api" });

// Start the server
const start = async () => {
  try {
    const port = process.env.PORT || 4000;
    const host = "0.0.0.0"; // Adjust host based on environment
    await server.listen({ port: Number(port), host });
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Swagger Docs available at http://localhost:${port}/docs`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
