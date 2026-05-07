import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { AppError, InternalServerError } from "../utils/errors";
import { Prisma } from "generated/prisma";

/**
 * Global error handler for Fastify
 */
export function setupErrorHandler(app: any): void {
  app.setErrorHandler(
    async (error: unknown, request: FastifyRequest, reply: FastifyReply) => {
      const requestId = request.id;

      // Handle Prisma errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error(`[${requestId}] Prisma error:`, error.code);
        switch (error.code) {
          case "P2002":
            return reply.code(409).send({
              success: false,
              message: "Unique constraint violation",
              error: "CONFLICT",
              details: error.meta,
              requestId,
            });
          case "P2025":
            return reply.code(404).send({
              success: false,
              message: "Record not found",
              error: "NOT_FOUND",
              requestId,
            });
          case "P2003":
            return reply.code(400).send({
              success: false,
              message: "Foreign key constraint failed",
              error: "INVALID_REFERENCE",
              requestId,
            });
          default:
            return reply.code(500).send({
              success: false,
              message: "Database error",
              error: "DATABASE_ERROR",
              requestId,
            });
        }
      }

      // Handle Prisma validation errors
      if (error instanceof Prisma.PrismaClientValidationError) {
        console.error(`[${requestId}] Prisma validation error:`, error.message);
        return reply.code(400).send({
          success: false,
          message: "Invalid data provided",
          error: "VALIDATION_ERROR",
          requestId,
        });
      }

      // Handle custom AppError
      if (error instanceof AppError) {
        console.error(
          `[${requestId}] App error (${error.statusCode}):`,
          error.message,
        );
        return reply.code(error.statusCode).send({
          success: false,
          message: error.message,
          error: error.constructor.name,
          details: error.details,
          requestId,
        });
      }

      // Handle general errors
      if (error instanceof Error) {
        console.error(`[${requestId}] Unexpected error:`, error.message);
        return reply.code(500).send({
          success: false,
          message:
            process.env.NODE_ENV === "production"
              ? "Internal server error"
              : error.message,
          error: "INTERNAL_SERVER_ERROR",
          requestId,
        });
      }

      // Handle unknown errors
      console.error(`[${requestId}] Unknown error:`, error);
      return reply.code(500).send({
        success: false,
        message: "Internal server error",
        error: "UNKNOWN_ERROR",
        requestId,
      });
    },
  );
}
