/*
  Warnings:

  - A unique constraint covering the columns `[shopifyOrderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'ABANDONED';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "currency" TEXT,
ADD COLUMN     "shopifyCheckoutUrl" TEXT,
ADD COLUMN     "shopifyOrderId" TEXT,
ADD COLUMN     "shopifyOrderName" TEXT,
ADD COLUMN     "subtotalCents" INTEGER,
ALTER COLUMN "totalCents" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "shopifyVariantId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_shopifyOrderId_key" ON "Order"("shopifyOrderId");
