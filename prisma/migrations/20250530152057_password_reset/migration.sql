-- CreateTable
CREATE TABLE "ecodrive_password_reset" (
    "id" BIGSERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "user_id" BIGINT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'A',

    CONSTRAINT "ecodrive_password_reset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ecodrive_password_reset_id_key" ON "ecodrive_password_reset"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ecodrive_password_reset_slug_key" ON "ecodrive_password_reset"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ecodrive_password_reset_token_key" ON "ecodrive_password_reset"("token");

-- CreateIndex
CREATE INDEX "ecodrive_password_reset_user_id_idx" ON "ecodrive_password_reset"("user_id");

-- CreateIndex
CREATE INDEX "ecodrive_password_reset_token_idx" ON "ecodrive_password_reset"("token");

-- CreateIndex
CREATE INDEX "ecodrive_password_reset_status_idx" ON "ecodrive_password_reset"("status");

-- AddForeignKey
ALTER TABLE "ecodrive_password_reset" ADD CONSTRAINT "ecodrive_password_reset_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ecodrive_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
