/*
  Warnings:

  - Added the required column `description` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_brand` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `material` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stock` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "id_brand" TEXT NOT NULL,
ADD COLUMN     "material" TEXT NOT NULL,
ADD COLUMN     "model" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "price" INTEGER NOT NULL,
ADD COLUMN     "stock" INTEGER NOT NULL,
ADD COLUMN     "weight" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_id_brand_fkey" FOREIGN KEY ("id_brand") REFERENCES "Brand"("id_brand") ON DELETE RESTRICT ON UPDATE CASCADE;
