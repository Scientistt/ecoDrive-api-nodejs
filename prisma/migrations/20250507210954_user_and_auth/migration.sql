-- CreateEnum
CREATE TYPE "SexEnum" AS ENUM ('M', 'F', 'N');

-- CreateEnum
CREATE TYPE "StatusEnum" AS ENUM ('A', 'I', 'E', 'D', 'V');

-- CreateTable
CREATE TABLE "ecodrive_whitelabel" (
    "id" BIGSERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" BIGINT,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by_user_id" BIGINT,
    "name" TEXT NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'A',
    "description" TEXT,

    CONSTRAINT "ecodrive_whitelabel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecodrive_user" (
    "id" BIGSERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "sex" "SexEnum",
    "login" TEXT NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'A',
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whitelabel_id" BIGINT NOT NULL,

    CONSTRAINT "ecodrive_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecodrive_user_auth_token" (
    "id" BIGSERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "last_used_at" TIMESTAMPTZ(6),
    "created_ip" TEXT NOT NULL,
    "last_used_ip" TEXT,
    "status" "StatusEnum" NOT NULL DEFAULT 'A',
    "jwt_token" TEXT NOT NULL,
    "jwt_secret" TEXT NOT NULL,
    "keep" BOOLEAN NOT NULL DEFAULT false,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "ecodrive_user_auth_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ecodrive_whitelabel_id_key" ON "ecodrive_whitelabel"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ecodrive_whitelabel_slug_key" ON "ecodrive_whitelabel"("slug");

-- CreateIndex
CREATE INDEX "ecodrive_whitelabel_status_idx" ON "ecodrive_whitelabel"("status");

-- CreateIndex
CREATE INDEX "ecodrive_whitelabel_name_idx" ON "ecodrive_whitelabel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ecodrive_user_id_key" ON "ecodrive_user"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ecodrive_user_slug_key" ON "ecodrive_user"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ecodrive_user_login_key" ON "ecodrive_user"("login");

-- CreateIndex
CREATE UNIQUE INDEX "ecodrive_user_email_key" ON "ecodrive_user"("email");

-- CreateIndex
CREATE INDEX "ecodrive_user_login_idx" ON "ecodrive_user"("login");

-- CreateIndex
CREATE INDEX "ecodrive_user_status_idx" ON "ecodrive_user"("status");

-- CreateIndex
CREATE INDEX "ecodrive_user_email_idx" ON "ecodrive_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ecodrive_user_auth_token_id_key" ON "ecodrive_user_auth_token"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ecodrive_user_auth_token_slug_key" ON "ecodrive_user_auth_token"("slug");

-- CreateIndex
CREATE INDEX "ecodrive_user_auth_token_created_at_idx" ON "ecodrive_user_auth_token"("created_at");

-- CreateIndex
CREATE INDEX "ecodrive_user_auth_token_updated_at_idx" ON "ecodrive_user_auth_token"("updated_at");

-- CreateIndex
CREATE INDEX "ecodrive_user_auth_token_last_used_at_idx" ON "ecodrive_user_auth_token"("last_used_at");

-- CreateIndex
CREATE INDEX "ecodrive_user_auth_token_jwt_token_idx" ON "ecodrive_user_auth_token"("jwt_token");

-- CreateIndex
CREATE INDEX "ecodrive_user_auth_token_jwt_secret_idx" ON "ecodrive_user_auth_token"("jwt_secret");

-- CreateIndex
CREATE INDEX "ecodrive_user_auth_token_status_idx" ON "ecodrive_user_auth_token"("status");

-- CreateIndex
CREATE INDEX "ecodrive_user_auth_token_keep_idx" ON "ecodrive_user_auth_token"("keep");

-- AddForeignKey
ALTER TABLE "ecodrive_user" ADD CONSTRAINT "ecodrive_user_whitelabel_id_fkey" FOREIGN KEY ("whitelabel_id") REFERENCES "ecodrive_whitelabel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecodrive_user_auth_token" ADD CONSTRAINT "ecodrive_user_auth_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ecodrive_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Dependencies
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Params
ALTER SEQUENCE ecodrive_whitelabel_id_seq RESTART WITH 1000000001;
ALTER SEQUENCE ecodrive_user_id_seq RESTART WITH 1000000001;
ALTER SEQUENCE ecodrive_user_auth_token_id_seq RESTART WITH 1000000001;

-- Insert
INSERT INTO ecodrive_whitelabel (slug, created_at, name) 
VALUES (uuid_generate_v4(),'NOW()', 'Default ecoDrive Interface');

