-- AddForeignKey
ALTER TABLE "DetailOrder" ADD CONSTRAINT "DetailOrder_id_product_fkey" FOREIGN KEY ("id_product") REFERENCES "Product"("id_product") ON DELETE RESTRICT ON UPDATE CASCADE;
