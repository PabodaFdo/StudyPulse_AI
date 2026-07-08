-- CreateTable
CREATE TABLE "FlowerCollection" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "flowerKey" TEXT NOT NULL,
    "flowerName" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "unlockReason" TEXT,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlowerCollection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FlowerCollection_userId_idx" ON "FlowerCollection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FlowerCollection_userId_flowerKey_key" ON "FlowerCollection"("userId", "flowerKey");

-- AddForeignKey
ALTER TABLE "FlowerCollection" ADD CONSTRAINT "FlowerCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
