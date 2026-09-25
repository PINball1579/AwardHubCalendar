-- CreateTable
CREATE TABLE "NotificationQueue" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "changedIds" TEXT[],
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "NotificationQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationQueue_processedAt_receivedAt_idx" ON "NotificationQueue"("processedAt", "receivedAt");
