import { prisma } from "~/db.server";

export const createUserIfNotExists = async (email: string) => {
  let user;
  user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        username: email.split("@")[0],
        email: email,
      },
    });
  }
  return user;
};
