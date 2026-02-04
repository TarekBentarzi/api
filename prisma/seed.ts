import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = [
        { name: 'Bob', email: 'bob@example.com' },
        { name: 'Carol', email: 'carol@example.com' },
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: user,
        });
    }

    console.log('Seed successful!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
