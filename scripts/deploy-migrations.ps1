# Script de Deploiement des Migrations en Production
# Usage: .\deploy-migrations.ps1

Write-Host "[DEPLOY] Deploiement des Migrations Prisma en Production" -ForegroundColor Green
Write-Host ""

# Verifier que nous sommes dans le bon dossier
if (!(Test-Path "prisma\schema.prisma")) {
    Write-Host "[ERREUR] Executez ce script depuis le dossier /api" -ForegroundColor Red
    exit 1
}

# Charger les variables d'environnement depuis .env si present
if (Test-Path ".env") {
    Write-Host "[INFO] Chargement du fichier .env..." -ForegroundColor Cyan
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($name -and !$name.StartsWith('#')) {
                [Environment]::SetEnvironmentVariable($name, $value, [EnvironmentVariableTarget]::Process)
            }
        }
    }
    Write-Host ""
}

# Verifier que DATABASE_URL est definie
if (!$env:DATABASE_URL) {
    Write-Host "[ERREUR] DATABASE_URL n'est pas definie" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pour la production, definissez:" -ForegroundColor Yellow
    Write-Host '  $env:DATABASE_URL="postgresql://user:pass@host:port/db"' -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# Afficher l'URL (masquee) pour confirmation
$maskedUrl = $env:DATABASE_URL -replace "(postgresql://[^:]+:)([^@]+)(@.*)", '$1****$3'
Write-Host "[INFO] Database URL: $maskedUrl" -ForegroundColor Cyan
Write-Host ""

# Verifier qu'il y a des migrations a deployer
if (!(Test-Path "prisma\migrations")) {
    Write-Host "[ERREUR] Aucun dossier migrations trouve" -ForegroundColor Red
    Write-Host "   Creez d'abord des migrations avec: npm run migrate:dev" -ForegroundColor Yellow
    exit 1
}

# Afficher le statut actuel
Write-Host "[INFO] Statut actuel des migrations:" -ForegroundColor Cyan
npx prisma migrate status
Write-Host ""

# Demander confirmation
Write-Host "ATTENTION: Vous allez deployer en PRODUCTION" -ForegroundColor Red
Write-Host ""
Write-Host "Assurez-vous que:" -ForegroundColor Yellow
Write-Host "  - Vous avez un backup de la base de donnees" -ForegroundColor White
Write-Host "  - Les migrations ont ete testees en local" -ForegroundColor White
Write-Host "  - Tous les tests passent" -ForegroundColor White
Write-Host "  - L'equipe est informee" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Tapez 'DEPLOY' pour confirmer le deploiement"

if ($confirm -ne "DEPLOY") {
    Write-Host "[ANNULE] Deploiement annule" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "[START] Demarrage du deploiement..." -ForegroundColor Cyan
Write-Host ""

# Etape 1: Generer le client Prisma
Write-Host "[1/3] Generation du Prisma Client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERREUR] Erreur lors de la generation du client" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Client genere" -ForegroundColor Green
Write-Host ""

# Etape 2: Deployer les migrations
Write-Host "[2/3] Deploiement des migrations..." -ForegroundColor Cyan
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERREUR] Erreur lors du deploiement" -ForegroundColor Red
    Write-Host ""
    Write-Host "Actions possibles:" -ForegroundColor Yellow
    Write-Host "  - Verifiez les logs ci-dessus" -ForegroundColor White
    Write-Host "  - Verifiez la connexion a la DB" -ForegroundColor White
    Write-Host "  - Restaurez le backup si necessaire" -ForegroundColor White
    Write-Host ""
    exit 1
}
Write-Host "[OK] Migrations deployees" -ForegroundColor Green
Write-Host ""

# Etape 3: Verifier le statut final
Write-Host "[3/3] Verification du statut final..." -ForegroundColor Cyan
npx prisma migrate status
Write-Host ""

Write-Host "[SUCCESS] Deploiement termine avec succes!" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Cyan
Write-Host "  - Verifiez que l'API fonctionne correctement" -ForegroundColor Yellow
Write-Host "  - Surveillez les logs d'erreur" -ForegroundColor Yellow
Write-Host "  - Testez les endpoints critiques" -ForegroundColor Yellow
Write-Host ""
