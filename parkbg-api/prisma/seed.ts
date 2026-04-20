import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const existingVarna = await prisma.city.findUnique({
    where: { slug: 'varna' },
  });

  const varna =
    existingVarna ??
    (await prisma.city.create({
      data: {
        name: 'Varna',
        slug: 'varna',
        centerLat: 43.2141,
        centerLng: 27.9147,
      },
    }));

  // 🟦 Синя зона (примерна - център)

  await prisma.parking.createMany({
    data: [
      {
        cityId: varna.id,
        name: 'Малък паркинг Център',
        parkingType: 'MUNICIPAL',
        address: 'ул. „Ген. Колев“ 1',
        latitude: 43.2145,
        longitude: 27.911,
        priceText: '1.00 лв/час',
        approxCapacity: 50,
        status: 'APPROVED',
      },
      {
        cityId: varna.id,
        name: 'Паркинг Морска градина',
        parkingType: 'MUNICIPAL',
        address: 'ул. „Морска градина“ 5',
        latitude: 43.218,
        longitude: 27.9115,
        priceText: '2.00 лв/час',
        approxCapacity: 30,
        status: 'APPROVED',
      },
    ],
  });
  console.log('🌊 Varna seed done');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
