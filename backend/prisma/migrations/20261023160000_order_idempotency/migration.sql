-- Anti double-soumission des commandes (cf. cahier des charges §8.8 / ORD-006)
ALTER TABLE "Order" ADD COLUMN "deliveryFeeStatus" TEXT NOT NULL DEFAULT 'confirmed';
ALTER TABLE "Order" ADD COLUMN "idempotencyKey" TEXT;

CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");
