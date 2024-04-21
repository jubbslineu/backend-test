import { PrismaClient, type Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import environment from '../src/lib/environment';
import logger from '../src/lib/logger';
import seedUsersData from './seed-users.json';

const prisma = new PrismaClient();

async function seed(): Promise<void> {
  const preprocessInputUsers = async (users) =>
    await Promise.all(
      users.map(async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(
            user.password,
            environment.bcryptSaltRounds
          );
        }
        return user;
      })
    );

  await prisma.user.createMany({
    data: (await preprocessInputUsers(
      seedUsersData
    )) as Prisma.UserCreateManyInput[],
  });
}

async function main(): Promise<void> {
  let isError: boolean = false;
  try {
    await seed();
  } catch (e) {
    isError = true;
    logger.error(e);
  } finally {
    await prisma.$disconnect();
    process.exit(isError ? 1 : 0);
  }
}

void main();
