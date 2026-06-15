-- CreateTable
CREATE TABLE "DeltaCursor" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "deltaLink" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeltaCursor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeltaCursor_key_key" ON "DeltaCursor"("key");
