# Script de Setup de la Base de Donnees - Qlearn
# Usage: .\setup-db.ps1 [reset|baseline|fresh]

param(
    [Parameter(Position=0)]
    [ValidateSet("reset", "baseline", "fresh", "")]
    [string]$Mode = ""
)

Write-Host "[SETUP] Base de Donnees Qlearn" -ForegroundColor Green
Write-Host ""

# Verifier que nous sommes dans le bon dossier
if (!(Test-Path "prisma\schema.prisma")) {
    Write-Host "[ERREUR] Executez ce script depuis le dossier /api" -ForegroundColor Red
    exit 1
}

# Charger les variables d'environnement depuis .env
if (Test-Path ".env") {
    Write-Host "[INFO] Chargement du fichier .env..." -ForegroundColor Cyan
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            # Ignorer les commentaires et les lignes vides
            if ($name -and !$name.StartsWith('#')) {
                [Environment]::SetEnvironmentVariable($name, $value, [EnvironmentVariableTarget]::Process)
                Write-Host "  $name = $(if($name -like '*PASSWORD*' -or $name -like '*URL*'){'****'}else{$value})" -ForegroundColor Gray
            }
        }
    }
    Write-Host ""
}

# Verifier que les variables d'environnement sont definies
if (!$env:DATABASE_URL) {
    Write-Host "[ERREUR] DATABASE_URL n'est pas definie" -ForegroundColor Red
    Write-Host "   Creez un fichier .env avec DATABASE_URL" -ForegroundColor Yellow
    exit 1
}

function Show-Menu {
    Write-Host ""
    Write-Host "Choisissez le mode de setup:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. RESET - Reinitialiser completement (ATTENTION: supprime TOUT)" -ForegroundColor Yellow
    Write-Host "2. BASELINE - Marquer l'etat actuel comme base (garde les donnees)" -ForegroundColor Green
    Write-Host "3. FRESH - Creer une nouvelle DB et importer les donnees" -ForegroundColor Cyan
    Write-Host "4. ANNULER" -ForegroundColor Red
    Write-Host ""
    
    $choice = Read-Host "Votre choix (1-4)"
    
    switch ($choice) {
        "1" { return "reset" }
        "2" { return "baseline" }
        "3" { return "fresh" }
        "4" { exit 0 }
        default {
            Write-Host "[ERREUR] Choix invalide" -ForegroundColor Red
            return Show-Menu
        }
    }
}

# Si pas de mode specifie, afficher le menu
if ($Mode -eq "") {
    $Mode = Show-Menu
}

Write-Host ""
Write-Host "Mode selectionne: $Mode" -ForegroundColor Cyan
Write-Host ""

# Confirmation pour les operations destructives
if ($Mode -eq "reset" -or $Mode -eq "fresh") {
    Write-Host "ATTENTION: Cette operation va supprimer toutes les donnees!" -ForegroundColor Red
    $confirm = Read-Host "Tapez 'OUI' pour confirmer"
    
    if ($confirm -ne "OUI") {
        Write-Host "[ANNULE] Operation annulee" -ForegroundColor Yellow
        exit 0
    }
}

# Executer selon le mode
switch ($Mode) {
    "reset" {
        Write-Host ""
        Write-Host "[1/5] Suppression des migrations existantes..." -ForegroundColor Cyan
        if (Test-Path "prisma\migrations") {
            Remove-Item -Recurse -Force "prisma\migrations"
            Write-Host "[OK] Migrations supprimees" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "[2/5] Reset de la base de donnees..." -ForegroundColor Cyan
        npx prisma migrate reset --force --skip-seed
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERREUR] Erreur lors du reset" -ForegroundColor Red
            exit 1
        }
        Write-Host "[OK] Database reset" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "[3/5] Creation de la migration initiale..." -ForegroundColor Cyan
        npx prisma migrate dev --name init_quran_app
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERREUR] Erreur lors de la migration" -ForegroundColor Red
            exit 1
        }
        Write-Host "[OK] Migration creee et appliquee" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "[4/5] Import du Coran complet..." -ForegroundColor Cyan
        npx ts-node prisma/import-full-quran.ts
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERREUR] Erreur lors de l'import" -ForegroundColor Red
            exit 1
        }
        Write-Host "[OK] Coran importe (114 sourates)" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "[5/5] Ajout des URLs audio..." -ForegroundColor Cyan
        npx ts-node prisma/add-audio-urls.ts
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERREUR] Erreur lors de l'ajout des URLs" -ForegroundColor Red
            exit 1
        }
        Write-Host "[OK] URLs audio ajoutees (6000+ versets)" -ForegroundColor Green
    }
    
    "baseline" {
        Write-Host ""
        Write-Host "[1/3] Creation de la migration baseline..." -ForegroundColor Cyan
        npx prisma migrate dev --create-only --name baseline_current_state
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERREUR] Erreur lors de la creation" -ForegroundColor Red
            exit 1
        }
        Write-Host "[OK] Migration baseline creee" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "[2/3] Marquage comme appliquee..." -ForegroundColor Cyan
        npx prisma migrate resolve --applied baseline_current_state
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERREUR] Erreur lors du marquage" -ForegroundColor Red
            exit 1
        }
        Write-Host "[OK] Migration marquee comme appliquee" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "[3/3] Verification du statut..." -ForegroundColor Cyan
        npx prisma migrate status
    }
    
    "fresh" {
        Write-Host ""
        Write-Host "[1/4] Creation de la migration..." -ForegroundColor Cyan
        npx prisma migrate dev --name init_quran_fresh
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERREUR] Erreur lors de la migration" -ForegroundColor Red
            exit 1
        }
        Write-Host "[OK] Migration appliquee" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "[2/4] Import du Coran complet..." -ForegroundColor Cyan
        npx ts-node prisma/import-full-quran.ts
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERREUR] Erreur lors de l'import" -ForegroundColor Red
            exit 1
        }
        Write-Host "[OK] Coran importe" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "[3/4] Ajout des URLs audio..." -ForegroundColor Cyan
        npx ts-node prisma/add-audio-urls.ts
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERREUR] Erreur lors de l'ajout des URLs" -ForegroundColor Red
            exit 1
        }
        Write-Host "[OK] URLs audio ajoutees" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "[4/4] Verification..." -ForegroundColor Cyan
        npx prisma migrate status
    }
}

Write-Host ""
Write-Host "[SUCCESS] Setup termine avec succes!" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Cyan
Write-Host "  - Lancez le serveur: npm run start:dev" -ForegroundColor Yellow
Write-Host "  - Ouvrez Prisma Studio: npm run prisma:studio" -ForegroundColor Yellow
Write-Host "  - Testez l'API: curl http://localhost:3000/sourates" -ForegroundColor Yellow
Write-Host ""
