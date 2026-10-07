-- CreateTable
CREATE TABLE "User" (
    "id_user" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "birthDate" DATE,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id_supplier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id_supplier")
);

-- CreateTable
CREATE TABLE "Address" (
    "id_address" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "house_number" TEXT NOT NULL,
    "department" TEXT,
    "block" TEXT,
    "comune" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "reference" TEXT,
    "id_supplier" TEXT,
    "id_user" TEXT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id_address")
);

-- CreateTable
CREATE TABLE "Category" (
    "id_category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id_category")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id_brand" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country_origin" TEXT,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id_brand")
);

-- CreateTable
CREATE TABLE "Product" (
    "id_product" TEXT NOT NULL,
    "id_supplier" TEXT NOT NULL,
    "id_category" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id_product")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_name_key" ON "Supplier"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_email_key" ON "Supplier"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_phone_number_key" ON "Supplier"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "Address_id_user_key" ON "Address"("id_user");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_id_supplier_fkey" FOREIGN KEY ("id_supplier") REFERENCES "Supplier"("id_supplier") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_id_supplier_fkey" FOREIGN KEY ("id_supplier") REFERENCES "Supplier"("id_supplier") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_id_category_fkey" FOREIGN KEY ("id_category") REFERENCES "Category"("id_category") ON DELETE RESTRICT ON UPDATE CASCADE;
