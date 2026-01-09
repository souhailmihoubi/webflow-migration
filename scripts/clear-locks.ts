import { PrismaClient } from '@prisma/client';

const directUrl = process.env.DIRECT_URL;

if (!directUrl) {
  console.error('Error: DIRECT_URL is not defined in .env');
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: directUrl,
    },
  },
});

async function clearLocks() {
  console.log('Connecting to database via DIRECT_URL to clear locks...');
  try {
    // Terminate all other connections to the current database
    // This forces the release of any advisory locks held by ghost connections
    const result = await prisma.$queryRawUnsafe(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE pid <> pg_backend_pid()
      AND datname = current_database()
      AND usename = current_user;
    `);

    console.log('Successfully terminated other connections:', result);
    console.log('Locks should now be released.');
  } catch (error) {
    console.error('Error clearing locks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearLocks();
