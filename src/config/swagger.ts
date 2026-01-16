import swaggerJsdoc from "swagger-jsdoc";
import { Express } from "express";
import swaggerUi from "swagger-ui-express";

// Swagger definition
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Backend Development API project",
      version: "1.0.0",
      description: "REST API documentation for backend develoment project",
      contact: {
        name: "M. Rafi ash shiddiqie",
        email: "m.raffi1808@gmail,com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://your-production-url.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Path to API docs (JSDoc comments)
  apis: ["./src/routes/*.ts", "./src/index.ts"],
};

// Generate Swagger specification
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Setup Swagger middleware
export const setupSwagger = (app: Express): void => {
  // Swagger UI route
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Backend Development Project API Docs",
    })
  );

  // Swagger JSON endpoint
  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log("Swagger UI available at: http://localhost:3000/api-docs");
};
