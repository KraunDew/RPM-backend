-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPPLIER', 'USER', 'ADMIN', 'SUPERADMIN');

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'SUPPLIER';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
