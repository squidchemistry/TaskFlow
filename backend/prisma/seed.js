require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Idempotent: delete the demo user (cascades to projects + tasks) then recreate
  await prisma.user.deleteMany({ where: { email: 'demo@example.com' } });

  const passwordHash = await bcrypt.hash('Demo@1234', 12);

  const user = await prisma.user.create({
    data: {
      fullName: 'Demo User',
      email: 'demo@example.com',
      passwordHash,
      projects: {
        create: [
          {
            name: 'Website Redesign',
            description: 'Modernise the company landing page and blog',
            status: 'IN_PROGRESS',
            tasks: {
              create: [
                { name: 'Wireframe homepage',       description: 'Low-fidelity mockups for all breakpoints', status: 'COMPLETED', priority: 'HIGH' },
                { name: 'Design system tokens',     description: 'Colours, typography, spacing in Figma',    status: 'IN_PROGRESS', priority: 'HIGH' },
                { name: 'Implement header component', description: 'Responsive nav with mobile drawer',      status: 'PENDING', priority: 'MEDIUM' },
              ],
            },
          },
          {
            name: 'Mobile App MVP',
            description: 'React Native app for iOS and Android',
            status: 'NOT_STARTED',
            tasks: {
              create: [
                { name: 'Set up Expo project', description: 'Initialise repo with Expo SDK 51', status: 'COMPLETED', priority: 'HIGH' },
                { name: 'Auth screens',        description: 'Login / Register with JWT flow',   status: 'IN_PROGRESS', priority: 'HIGH' },
              ],
            },
          },
        ],
      },
    },
    include: { projects: { include: { tasks: true } } },
  });

  console.log('\n✅  Seed complete');
  console.log(`   User     : ${user.email}`);
  console.log(`   Password : Demo@1234`);
  console.log(`   Projects : ${user.projects.length}`);
  console.log(`   Tasks    : ${user.projects.reduce((n, p) => n + p.tasks.length, 0)}\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
