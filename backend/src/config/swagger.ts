import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: any = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EcoSphere API Documentation',
      version: '1.0.0',
      description: 'API documentation for the EcoSphere ESG Management Platform',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Automatically parse docstrings in all routes
  apis: ['./src/features/**/*.routes.ts', './src/features/**/*.controller.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('📄 Swagger docs available at http://localhost:5000/api-docs');
};
