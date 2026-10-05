-- CreateTable
CREATE TABLE "DetailOrder" (
    "id_detail" TEXT NOT NULL,
    "id_order" TEXT NOT NULL,
    "id_product" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "price_unity" INTEGER NOT NULL,

    CONSTRAINT "DetailOrder_pkey" PRIMARY KEY ("id_detail")
);

-- AddForeignKey
ALTER TABLE "DetailOrder" ADD CONSTRAINT "DetailOrder_id_order_fkey" FOREIGN KEY ("id_order") REFERENCES "Order"("id_order") ON DELETE RESTRICT ON UPDATE CASCADE;
