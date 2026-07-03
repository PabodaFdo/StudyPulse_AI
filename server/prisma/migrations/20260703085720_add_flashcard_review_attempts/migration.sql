-- CreateTable
CREATE TABLE "FlashcardReviewAttempt" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "subjectId" INTEGER,
    "flashcardDeckId" TEXT,
    "sourceTitle" TEXT,
    "totalCards" INTEGER NOT NULL,
    "reviewedCards" INTEGER NOT NULL,
    "knownCards" INTEGER NOT NULL,
    "needReviewCards" INTEGER NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlashcardReviewAttempt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FlashcardReviewAttempt" ADD CONSTRAINT "FlashcardReviewAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashcardReviewAttempt" ADD CONSTRAINT "FlashcardReviewAttempt_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
