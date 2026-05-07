import { FastifyReply, FastifyRequest } from "fastify";
import { successResponse } from "../../utils/response";
import { createUserSchema, updateUserSchema } from "./user.schema";
import * as userService from "./user.service";

export const list = async (_req: FastifyRequest, reply: FastifyReply) => {
  const users = await userService.listUsers();
  return reply.send(successResponse(users, "Users fetched successfully"));
};

export const getById = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  const user = await userService.getUserById(id);
  return reply.send(successResponse(user, "User fetched successfully"));
};

export const create = async (req: FastifyRequest, reply: FastifyReply) => {
  const input = createUserSchema.parse(req.body);
  const user = await userService.createUser(input);
  return reply
    .status(201)
    .send(successResponse(user, "User created successfully"));
};

export const update = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  const input = updateUserSchema.parse(req.body);
  const user = await userService.updateUser(id, input);
  return reply.send(successResponse(user, "User updated successfully"));
};

export const remove = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  await userService.deleteUser(id);
  return reply.send(successResponse(null, "User deleted successfully"));
};
