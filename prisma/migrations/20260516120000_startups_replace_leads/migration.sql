-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('GITHUB', 'PRODUCT_HUNT', 'TWITTER', 'OTHER');

-- CreateEnum
CREATE TYPE "PipelineStatus" AS ENUM ('SCANNED', 'EVALUATED', 'QUEUED', 'OUTREACHED', 'IGNORED');

-- CreateTable
CREATE TABLE "startup" (
    "id" TEXT NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "founder_name" TEXT NOT NULL,
    "founder_linkedin" TEXT,
    "email" TEXT NOT NULL,
    "description" TEXT,
    "source" "SourceType" NOT NULL DEFAULT 'OTHER',
    "source_url" TEXT,
    "scraped_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidence_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "thesis_reasoning" TEXT,
    "status" "PipelineStatus" NOT NULL DEFAULT 'SCANNED',
    "drafted_email" TEXT,
    "sent_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "startup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "startup_organization_email_unique" ON "startup"("organization_id", "email");

-- CreateIndex
CREATE INDEX "startup_organization_id_idx" ON "startup"("organization_id");

-- CreateIndex
CREATE INDEX "startup_status_idx" ON "startup"("status");

-- CreateIndex
CREATE INDEX "startup_source_idx" ON "startup"("source");

-- CreateIndex
CREATE INDEX "startup_created_at_idx" ON "startup"("created_at");

-- CreateIndex
CREATE INDEX "startup_org_status_idx" ON "startup"("organization_id", "status");

-- AddForeignKey
ALTER TABLE "startup" ADD CONSTRAINT "startup_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropTable (legacy generic CRM leads; data not migrated)
DROP TABLE IF EXISTS "lead" CASCADE;

-- DropEnum
DROP TYPE IF EXISTS "LeadStatus";

-- DropEnum
DROP TYPE IF EXISTS "LeadSource";
