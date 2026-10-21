/*
  Warnings:

  - Added the required column `method` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('WEBPAY', 'PAYPAL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'REJECTED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "method" "PaymentMethod" NOT NULL,
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "total" INTEGER NOT NULL;
