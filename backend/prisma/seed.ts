import { PrismaClient } from '../src/prisma/client';

const prisma = new PrismaClient();

const taskTitles = [
  'Update landing page design', 'Fix login bug on mobile', 'Write API documentation',
  'Set up CI/CD pipeline', 'Review pull request #142', 'Deploy v2.1 to staging',
  'Refactor auth module', 'Add unit tests for user service', 'Optimize database queries',
  'Implement dark mode toggle', 'Create onboarding flow', 'Fix timezone issue',
  'Add search functionality', 'Update dependencies', 'Configure monitoring alerts',
  'Design new dashboard layout', 'Implement file upload', 'Add email notifications',
  'Fix performance bottleneck', 'Create admin panel', 'Write integration tests',
  'Set up error tracking', 'Implement rate limiting', 'Add WebSocket support',
  'Create API versioning', 'Fix CORS issue', 'Implement caching layer',
  'Add role-based access', 'Create backup system', 'Optimize image processing',
];

const priorities = ['Low', 'Medium', 'High', 'Urgent'] as const;
const statuses = ['Draft', 'Todo', 'InProgress', 'OnHold', 'Completed', 'Archived'] as const;

function randomItem<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  const countArg = process.argv[2];
  const count = countArg ? parseInt(countArg, 10) : 50;

  const validCounts = [50, 100, 500, 1000];
  if (!validCounts.includes(count)) {
    console.error(`Invalid count: ${count}. Valid options: ${validCounts.join(', ')}`);
    process.exit(1);
  }

  console.log(`Seeding ${count} tasks...`);

  const seedUser = await prisma.user.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  });

  if (!seedUser) {
    console.error('No users found. Register an account first, then run seed.');
    process.exit(1);
  }

  const createdById = seedUser.id;
  const createdByName = seedUser.name;

  await prisma.task.deleteMany({});
  console.log('Cleared existing tasks');

  const tasks: any[] = [];
  for (let i = 0; i < count; i++) {
    const createdAt = randomDate(new Date('2025-01-01'), new Date());
    tasks.push({
      title: randomItem(taskTitles),
      description: `Task description for item ${i + 1}`,
      status: randomItem(statuses),
      priority: randomItem(priorities),
      createdById,
      createdByName,
      assignedUserId: Math.random() > 0.3 ? createdById : null,
      assignedUserName: Math.random() > 0.3 ? createdByName : null,
      dueDate: randomDate(new Date(), new Date('2026-12-31')),
      createdAt,
      updatedAt: createdAt,
    });
  }

  await prisma.task.createMany({ data: tasks });
  console.log(`Seeded ${tasks.length} tasks`);

  const total = await prisma.task.count();
  console.log(`\nTotal tasks: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
