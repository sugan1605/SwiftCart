import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: "Travel Backpack 40L",
        slug: "travel-backpack-40l",
        description: "Durable and spacious backpack for all your travel needs.",
        priceCents: 129900,
      },
      {
        name: "Noise Cancelling Headphones",
        slug: "noise-cancelling-headphones",
        description:
          "Experience immersive sound with active noise cancellation.",
        priceCents: 249900,
      },
      {
        name: "Mechanical Keyboard",
        slug: "mechanical-keyboard",
        description: "High-performance keyboard with customizable RGB lighting",
        priceCents: 179900,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed completed!");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
