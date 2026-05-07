import { FastifyReply, FastifyRequest } from "fastify";
import { successResponse } from "../../utils/response";
import {
  assignPermissionSchema,
  createPermissionSchema,
} from "./permission.schema";
import * as permissionService from "./permission.service";

export const list = async (_req: FastifyRequest, reply: FastifyReply) => {
  const permissions = await permissionService.listPermissions();
  return reply.send(
    successResponse(permissions, "Permissions fetched successfully"),
  );
};

export const create = async (req: FastifyRequest, reply: FastifyReply) => {
  const input = createPermissionSchema.parse(req.body);
  const permission = await permissionService.createPermission(input);
  return reply
    .status(201)
    .send(successResponse(permission, "Permission created successfully"));
};

export const assign = async (req: FastifyRequest, reply: FastifyReply) => {
  const input = assignPermissionSchema.parse(req.body);
  const assignment = await permissionService.assignPermissionToRole(input);
  return reply
    .status(201)
    .send(successResponse(assignment, "Permission assigned successfully"));
};
