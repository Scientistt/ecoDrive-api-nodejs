-- CreateTable
CREATE TABLE "ecodrive_supplier" (
    "id" BIGSERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" BIGINT NOT NULL,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by_user_id" BIGINT,
    "name" TEXT NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'A',
    "description" TEXT,
    "account_supplier" TEXT NOT NULL,
    "account_key" TEXT NOT NULL,
    "account_secret" TEXT NOT NULL,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "ecodrive_supplier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ecodrive_supplier_id_key" ON "ecodrive_supplier"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ecodrive_supplier_slug_key" ON "ecodrive_supplier"("slug");

-- CreateIndex
CREATE INDEX "ecodrive_supplier_account_supplier_idx" ON "ecodrive_supplier"("account_supplier");

-- CreateIndex
CREATE INDEX "ecodrive_supplier_user_id_idx" ON "ecodrive_supplier"("user_id");

-- CreateIndex
CREATE INDEX "ecodrive_supplier_name_idx" ON "ecodrive_supplier"("name");

-- CreateIndex
CREATE INDEX "ecodrive_supplier_status_idx" ON "ecodrive_supplier"("status");

-- AddForeignKey
ALTER TABLE "ecodrive_supplier" ADD CONSTRAINT "ecodrive_supplier_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ecodrive_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecodrive_supplier" ADD CONSTRAINT "ecodrive_supplier_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "ecodrive_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecodrive_supplier" ADD CONSTRAINT "ecodrive_supplier_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "ecodrive_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Params
ALTER SEQUENCE ecodrive_supplier_id_seq RESTART WITH 1000000001;