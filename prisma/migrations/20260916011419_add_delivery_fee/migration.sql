-- CreateEnum
CREATE TYPE "DeliveryFeeMode" AS ENUM ('INCLUS', 'A_LA_CHARGE_DU_CLIENT');

-- AlterTable
ALTER TABLE "boutique"
  ADD COLUMN "delivery_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "delivery_fee_mode" "DeliveryFeeMode" NOT NULL DEFAULT 'A_LA_CHARGE_DU_CLIENT';

-- AlterTable
ALTER TABLE "order"
  ADD COLUMN "delivery_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "delivery_fee_mode" "DeliveryFeeMode" NOT NULL DEFAULT 'A_LA_CHARGE_DU_CLIENT';
