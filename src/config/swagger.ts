import { SwaggerOptions } from '@fastify/swagger';

export const swaggerOptions: SwaggerOptions = {
  mode: 'dynamic',
  openapi: {
    info: {
      title: "Mytemplate",
      description: "Building a Mytemplate",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Bearer token for authentication",
        },
      },
    },
    security: [
      {
        bearerAuth: [], // This enables the lock button
      },
    ],
  },
  hideUntagged: false,
};

export const swaggerUiOptions = {
  routePrefix: "/docs", // Swagger UI will be served at /docs
  staticCSP: true,
  transformStaticCSP: (header: string) => header,
  exposeRoute: true,
};