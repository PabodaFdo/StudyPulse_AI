-- CreateTable
CREATE TABLE "RiskPredictionHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "trend" TEXT NOT NULL,
    "trendMessage" TEXT NOT NULL,
    "studyEngagement" DOUBLE PRECISION NOT NULL,
    "assessmentAverage" DOUBLE PRECISION NOT NULL,
    "quizAverage" DOUBLE PRECISION NOT NULL,
    "studyHoursPerWeek" DOUBLE PRECISION NOT NULL,
    "focusSessionsCompleted" INTEGER NOT NULL,
    "previousExamMark" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskPredictionHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RiskPredictionHistory" ADD CONSTRAINT "RiskPredictionHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskPredictionHistory" ADD CONSTRAINT "RiskPredictionHistory_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
