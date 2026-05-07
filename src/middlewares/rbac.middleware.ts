import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../db/prisma";
import { AuthError, ForbiddenError, ValidationError } from "../utils/errors";

export const hasRole = (role: string) => {
  return async (
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> => {
    const user = request.authUser;
    if (!user) {
      throw new AuthError("Unauthorized");
    }

    if (!user.roles.includes(role)) {
      throw new ForbiddenError(`Required role: ${role}`);
    }
  };
};

export const hasPermission = (permission: string) => {
  return async (
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> => {
    const user = request.authUser;
    if (!user) {
      throw new AuthError("Unauthorized");
    }

    const [subject, action, ...rest] = permission.split(":");
    if (!action || !subject || rest.length > 0) {
      throw new ValidationError(
        "Invalid permission format. Use subject:action",
      );
    }

    const matchedRoles = await prisma.userRole.count({
      where: {
        userId: user.userId,
        role: {
          rolePermissions: {
            some: {
              permission: {
                action,
                subject,
              },
            },
          },
        },
      },
    });

    if (matchedRoles === 0) {
      throw new ForbiddenError(`Missing permission: ${permission}`);
    }
  };
};
