-- CreateTable
CREATE TABLE "RevisionReminder" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "subjectId" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "dueDate" TIMESTAMP(3),
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "snoozeUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevisionReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RevisionReminder_userId_idx" ON "RevisionReminder"("userId");

-- CreateIndex
CREATE INDEX "RevisionReminder_subjectId_idx" ON "RevisionReminder"("subjectId");

-- CreateIndex
CREATE INDEX "RevisionReminder_status_idx" ON "RevisionReminder"("status");

-- CreateIndex
CREATE INDEX "RevisionReminder_priority_idx" ON "RevisionReminder"("priority");

-- CreateIndex
CREATE INDEX "RevisionReminder_dueDate_idx" ON "RevisionReminder"("dueDate");

-- AddForeignKey
ALTER TABLE "RevisionReminder" ADD CONSTRAINT "RevisionReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionReminder" ADD CONSTRAINT "RevisionReminder_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
