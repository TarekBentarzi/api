-- CreateEnum
CREATE TYPE "statut_memorisation" AS ENUM ('en_cours', 'memorise', 'a_reviser');

-- CreateEnum
CREATE TYPE "type_exercice" AS ENUM ('completion', 'recitation', 'ordre', 'qcm');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sourates" (
    "id" UUID NOT NULL,
    "numero" INTEGER NOT NULL,
    "nom_arabe" TEXT NOT NULL,
    "nom_translitteration" TEXT NOT NULL,
    "nom_traduction" TEXT NOT NULL,
    "nombre_versets" INTEGER NOT NULL,
    "revelation" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sourates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "versets" (
    "id" UUID NOT NULL,
    "sourate_numero" INTEGER NOT NULL,
    "verset_numero" INTEGER NOT NULL,
    "texte_arabe" TEXT NOT NULL,
    "translitteration" TEXT,
    "traduction" TEXT,
    "audio_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "versets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_saves" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "sourate_numero" INTEGER NOT NULL,
    "verset_numero" INTEGER NOT NULL,
    "last_read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_saves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_memorizations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "verset_id" UUID NOT NULL,
    "sourate_numero" INTEGER NOT NULL,
    "verset_numero" INTEGER NOT NULL,
    "statut" "statut_memorisation" NOT NULL DEFAULT 'en_cours',
    "niveau_maitrise" INTEGER NOT NULL DEFAULT 0,
    "exercices_total" INTEGER NOT NULL DEFAULT 0,
    "exercices_reussis" INTEGER NOT NULL DEFAULT 0,
    "derniere_revision" TIMESTAMP(3),
    "prochaine_revision" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_memorizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercices" (
    "id" UUID NOT NULL,
    "memorization_id" UUID NOT NULL,
    "type_exercice" "type_exercice" NOT NULL,
    "resultat" BOOLEAN NOT NULL,
    "score" INTEGER,
    "duree_secondes" INTEGER,
    "details" JSONB,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sourates_numero_key" ON "sourates"("numero");

-- CreateIndex
CREATE INDEX "versets_sourate_numero_idx" ON "versets"("sourate_numero");

-- CreateIndex
CREATE INDEX "versets_sourate_numero_verset_numero_idx" ON "versets"("sourate_numero", "verset_numero");

-- CreateIndex
CREATE UNIQUE INDEX "versets_sourate_numero_verset_numero_key" ON "versets"("sourate_numero", "verset_numero");

-- CreateIndex
CREATE UNIQUE INDEX "user_saves_user_id_key" ON "user_saves"("user_id");

-- CreateIndex
CREATE INDEX "user_memorizations_user_id_idx" ON "user_memorizations"("user_id");

-- CreateIndex
CREATE INDEX "user_memorizations_statut_idx" ON "user_memorizations"("statut");

-- CreateIndex
CREATE INDEX "user_memorizations_prochaine_revision_idx" ON "user_memorizations"("prochaine_revision");

-- CreateIndex
CREATE UNIQUE INDEX "user_memorizations_user_id_verset_id_key" ON "user_memorizations"("user_id", "verset_id");

-- CreateIndex
CREATE INDEX "exercices_memorization_id_idx" ON "exercices"("memorization_id");

-- AddForeignKey
ALTER TABLE "versets" ADD CONSTRAINT "versets_sourate_numero_fkey" FOREIGN KEY ("sourate_numero") REFERENCES "sourates"("numero") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_saves" ADD CONSTRAINT "user_saves_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_memorizations" ADD CONSTRAINT "user_memorizations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_memorizations" ADD CONSTRAINT "user_memorizations_verset_id_fkey" FOREIGN KEY ("verset_id") REFERENCES "versets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercices" ADD CONSTRAINT "exercices_memorization_id_fkey" FOREIGN KEY ("memorization_id") REFERENCES "user_memorizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
