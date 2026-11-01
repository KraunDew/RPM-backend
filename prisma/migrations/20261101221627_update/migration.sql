/*
  Warnings:

  - A unique constraint covering the columns `[paypalOrderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paypalCaptureId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'CLP',
ADD COLUMN     "exchangeRate" DECIMAL(18,6),
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentAmount" DECIMAL(12,2),
ADD COLUMN     "paypalCaptureId" TEXT,
ADD COLUMN     "paypalOrderId" TEXT;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "model" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_paypalOrderId_key" ON "Order"("paypalOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_paypalCaptureId_key" ON "Order"("paypalCaptureId");
