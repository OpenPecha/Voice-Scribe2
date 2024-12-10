import { prisma } from "~/db.server";

export const createUserIfNotExists = async (username: string) => {
  let user = await prisma.user.findUnique({
    where: { username: username }, 
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        username: username,
        email: `${username}@example.com`, 
        role: "USER", 
      },
    });
  }

  return user;
};
