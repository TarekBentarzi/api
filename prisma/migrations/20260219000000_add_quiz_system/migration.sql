-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" UUID NOT NULL,
    "verset_id" UUID NOT NULL,
    "sourate_numero" INTEGER NOT NULL,
    "verset_numero" INTEGER NOT NULL,
    "texte_arabe" TEXT NOT NULL,
    "texte_with_blank" TEXT NOT NULL,
    "correct_answer" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "word_position" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "sourate_numero" INTEGER NOT NULL,
    "selected_answer" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sourate_progress" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "sourate_numero" INTEGER NOT NULL,
    "is_memorized" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sourate_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quiz_questions_sourate_numero_idx" ON "quiz_questions"("sourate_numero");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_questions_verset_id_word_position_key" ON "quiz_questions"("verset_id", "word_position");

-- CreateIndex
CREATE INDEX "quiz_attempts_user_id_sourate_numero_idx" ON "quiz_attempts"("user_id", "sourate_numero");

-- CreateIndex
CREATE INDEX "quiz_attempts_user_id_question_id_idx" ON "quiz_attempts"("user_id", "question_id");

-- CreateIndex
CREATE INDEX "sourate_progress_user_id_idx" ON "sourate_progress"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sourate_progress_user_id_sourate_numero_key" ON "sourate_progress"("user_id", "sourate_numero");

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sourate_progress" ADD CONSTRAINT "sourate_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
