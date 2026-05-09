import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "../utils/errors";
import { Prisma } from "generated/prisma";
import { errorResponse } from "../utils/response";
import { ZodError } from "zod";

/**
 * Global error handler for Fastify
 */
export function setupErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler(
    async (error: unknown, request: FastifyRequest, reply: FastifyReply) => {
      const requestId = request.id;

      // Handle Prisma errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const prismaError = error as Prisma.PrismaClientKnownRequestError;
        console.error(`[${requestId}] Prisma error:`, prismaError.code);
        switch (prismaError.code) {
          case "P2002":
            return reply
              .code(409)
              .send(
                errorResponse(
                  "Unique constraint violation",
                  "CONFLICT",
                  prismaError.meta,
                  requestId,
                ),
              );
          case "P2025":
            return reply
              .code(404)
              .send(
                errorResponse(
                  "Record not found",
                  "NOT_FOUND",
                  undefined,
                  requestId,
                ),
              );
          case "P2003":
            return reply
              .code(400)
              .send(
                errorResponse(
                  "Foreign key constraint failed",
                  "INVALID_REFERENCE",
                  undefined,
                  requestId,
                ),
              );
          default:
            return reply
              .code(500)
              .send(
                errorResponse(
                  "Database error",
                  "DATABASE_ERROR",
                  undefined,
                  requestId,
                ),
              );
        }
      }

      // Handle Prisma validation errors
      if (error instanceof Prisma.PrismaClientValidationError) {
        const validationError = error as Error;
        console.error(
          `[${requestId}] Prisma validation error:`,
          validationError.message,
        );
        return reply
          .code(400)
          .send(
            errorResponse(
              "Invalid data provided",
              "VALIDATION_ERROR",
              { message: validationError.message },
              requestId,
            ),
          );
      }

      // Handle custom AppError
      if (error instanceof AppError) {
        console.error(
          `[${requestId}] App error (${error.statusCode}):`,
          error.message,
        );
        return reply
          .code(error.statusCode)
          .send(
            errorResponse(
              error.message,
              error.constructor.name,
              error.details,
              requestId,
            ),
          );
      }

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const fields = error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        }));

        return reply
          .code(400)
          .send(
            errorResponse(
              "Validation failed",
              "VALIDATION_ERROR",
              { fields },
              requestId,
            ),
          );
      }

      // Handle general errors
      if (error instanceof Error) {
        console.error(`[${requestId}] Unexpected error:`, error.message);
        const message =
          process.env.NODE_ENV === "production"
            ? "Internal server error"
            : error.message;
        return reply
          .code(500)
          .send(
            errorResponse(
              message,
              "INTERNAL_SERVER_ERROR",
              undefined,
              requestId,
            ),
          );
      }

      // Handle unknown errors
      console.error(`[${requestId}] Unknown error:`, error);
      return reply
        .code(500)
        .send(
          errorResponse(
            "Internal server error",
            "UNKNOWN_ERROR",
            undefined,
            requestId,
          ),
        );
    },
  );
}
