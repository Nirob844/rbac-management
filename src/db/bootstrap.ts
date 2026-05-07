import { prisma } from "./prisma";
import { config } from "../config/env";
import { hashPassword } from "../utils/hash";

export async function bootstrapDefaultAdmin(): Promise<void> {
  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: config.defaultAdminEmail },
        { username: config.defaultAdminUsername },
      ],
    },
    select: { id: true },
  });

  if (existingAdmin) {
    return;
  }

  const password = await hashPassword(config.defaultAdminPassword);

  await prisma.$transaction(async (tx) => {
    const adminRole = await tx.role.upsert({
      where: { name: "admin" },
      update: {},
      create: {
        name: "admin",
        description: "System administrator",
      },
      select: { id: true },
    });

    const adminUser = await tx.user.create({
      data: {
        email: config.defaultAdminEmail,
        username: config.defaultAdminUsername,
        password,
        isActive: true,
      },
      select: { id: true },
    });

    await tx.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });
  });

  console.log(
    `✅ Default admin created: ${config.defaultAdminEmail} / ${config.defaultAdminUsername}`,
  );
}
