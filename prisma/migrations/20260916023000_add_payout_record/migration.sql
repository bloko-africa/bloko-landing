-- CreateTable
CREATE TABLE "payout_record" (
    "id" TEXT NOT NULL,
    "boutique_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'XOF',
    "method" TEXT NOT NULL,
    "reference" TEXT,
    "note" TEXT,
    "recorded_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payout_record_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payout_record_boutique_id_idx" ON "payout_record"("boutique_id");

-- AddForeignKey
ALTER TABLE "payout_record" ADD CONSTRAINT "payout_record_boutique_id_fkey" FOREIGN KEY ("boutique_id") REFERENCES "boutique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payout_record" ADD CONSTRAINT "payout_record_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
