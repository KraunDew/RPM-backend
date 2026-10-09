/*
  Warnings:

  - You are about to drop the column `price_unity` on the `DetailOrder` table. All the data in the column will be lost.
  - The `weight` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[sku]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `unit_price` to the `DetailOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sku` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE "DetailOrder" DROP COLUMN "price_unity",
ADD COLUMN     "unit_price" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "sku" TEXT NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "material" DROP NOT NULL,
DROP COLUMN "weight",
ADD COLUMN     "weight" DECIMAL(10,3);

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
