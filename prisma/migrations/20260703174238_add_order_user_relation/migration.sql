-- AlterTable
ALTER TABLE "order" ADD COLUMN     "user_id" TEXT;

-- CreateIndex
CREATE INDEX "order_user_id_idx" ON "order"("user_id");

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
