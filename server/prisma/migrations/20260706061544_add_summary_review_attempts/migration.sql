-- CreateTable
CREATE TABLE "SummaryReviewAttempt" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "subjectId" INTEGER,
    "summaryId" TEXT,
    "sourceTitle" TEXT,
    "summaryWordCount" INTEGER NOT NULL,
    "readDurationSeconds" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SummaryReviewAttempt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SummaryReviewAttempt" ADD CONSTRAINT "SummaryReviewAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SummaryReviewAttempt" ADD CONSTRAINT "SummaryReviewAttempt_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
