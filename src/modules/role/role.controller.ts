import { FastifyReply, FastifyRequest } from "fastify";
import { successResponse } from "../../utils/response";
import { assignRoleSchema, createRoleSchema } from "./role.schema";
import * as roleService from "./role.service";

export const list = async (_req: FastifyRequest, reply: FastifyReply) => {
  const roles = await roleService.listRoles();
  return reply.send(successResponse(roles, "Roles fetched successfully"));
};

export const create = async (req: FastifyRequest, reply: FastifyReply) => {
  const input = createRoleSchema.parse(req.body);
  const role = await roleService.createRole(input);
  return reply
    .status(201)
    .send(successResponse(role, "Role created successfully"));
};

export const assign = async (req: FastifyRequest, reply: FastifyReply) => {
  const input = assignRoleSchema.parse(req.body);
  const assignment = await roleService.assignRoleToUser(input);
  return reply
    .status(201)
    .send(successResponse(assignment, "Role assigned successfully"));
};
