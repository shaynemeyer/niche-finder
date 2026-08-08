import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { PlanType, PrismaClient, Role } from '../lib/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seedUser(
  email: string,
  password: string,
  role: Role = Role.USER,
  planType: PlanType = PlanType.FREE,
): Promise<void> {
  if (!email || !password) {
    throw new Error('email and password must be provided');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`User with email ${email} already exists`);
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: role === Role.ADMIN ? 'Admin User' : 'User',
      role,
      image: 'default-avatar.png',
      subscription: {
        create: {
          planType,
          isActive: true,
        },
      },
      usage: {
        create: {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          validationCount: 0,
        },
      },
    },
  });

  console.log(`${role} user created successfully: ${email}`);
}

async function main() {
  console.log('Staring database seeding...');

  // Create default admin user
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
  }

  // Explicit admin creation
  await seedUser(adminEmail, adminPassword, Role.ADMIN, PlanType.PRO);

  // Create default non-admin user
  const defaultUserEmail = process.env.DEFAULT_USER_EMAIL;
  const defaultUserPassword = process.env.DEFAULT_USER_PASSWORD;

  if (!defaultUserEmail || !defaultUserPassword) {
    throw new Error(
      'DEFAULT_USER_EMAIL and DEFAULT_USER_PASSWORD must be set in .env',
    );
  }

  await seedUser(defaultUserEmail, defaultUserPassword);

  console.log('\n Database seeding completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
