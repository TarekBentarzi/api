# Script de Verification Pre-Deploiement
# Usage: .\pre-deploy-check.ps1

Write-Host "[CHECK] Verification Pre-Deploiement" -ForegroundColor Green
Write-Host ""

$allGood = $true

# Verifier que nous sommes dans le bon dossier
if (!(Test-Path "prisma\schema.prisma")) {
    Write-Host "[ERREUR] Executez ce script depuis le dossier /api" -ForegroundColor Red
    exit 1
}

Write-Host "[1/8] Verification des fichiers requis..." -ForegroundColor Cyan

# Fichiers requis
$requiredFiles = @(
    "prisma\schema.prisma",
    "vercel.json",
    "..\\.github\workflows\deploy-api.yml",
    "prisma\migrations\migration_lock.toml",
    ".gitignore"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [MANQUANT] $file" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""
Write-Host "[2/8] Verification du .gitignore..." -ForegroundColor Cyan
$gitignoreContent = Get-Content .gitignore -Raw
if ($gitignoreContent -match "\.env") {
    Write-Host "  [OK] .env est dans .gitignore" -ForegroundColor Green
} else {
    Write-Host "  [ATTENTION] .env n'est pas dans .gitignore!" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
Write-Host "[3/8] Verification des variables d'environnement..." -ForegroundColor Cyan

# Charger .env
if (Test-Path ".env") {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($name -and !$name.StartsWith('#')) {
                [Environment]::SetEnvironmentVariable($name, $value, [EnvironmentVariableTarget]::Process)
            }
        }
    }
}

$requiredEnvVars = @("DATABASE_URL", "DIRECT_URL", "JWT_SECRET")
foreach ($var in $requiredEnvVars) {
    $value = [Environment]::GetEnvironmentVariable($var)
    if ($value) {
        Write-Host "  [OK] $var est defini" -ForegroundColor Green
    } else {
        Write-Host "  [MANQUANT] $var n'est pas defini" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""
Write-Host "[4/8] Verification de la configuration Prisma..." -ForegroundColor Cyan
$schemaContent = Get-Content "prisma\schema.prisma" -Raw
if ($schemaContent -match 'directUrl\s*=\s*env\("DIRECT_URL"\)') {
    Write-Host "  [OK] directUrl est configure" -ForegroundColor Green
} else {
    Write-Host "  [ATTENTION] directUrl non configure dans schema.prisma" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[5/8] Verification des migrations..." -ForegroundColor Cyan
npx prisma migrate status 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Migrations synchronisees" -ForegroundColor Green
} else {
    Write-Host "  [ATTENTION] Verifiez le statut des migrations" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[6/8] Test de compilation..." -ForegroundColor Cyan
npm run build 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Build reussit" -ForegroundColor Green
} else {
    Write-Host "  [ERREUR] Build echoue - corrigez les erreurs" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
Write-Host "[7/8] Verification Git..." -ForegroundColor Cyan
$gitStatus = git status --porcelain 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Git initialise" -ForegroundColor Green
    
    # Verifier si .env est tracked
    $trackedFiles = git ls-files
    if ($trackedFiles -match "\.env$") {
        Write-Host "  [ERREUR] .env est tracke par Git! Supprimez-le du cache:" -ForegroundColor Red
        Write-Host "    git rm --cached .env" -ForegroundColor Yellow
        $allGood = $false
    } else {
        Write-Host "  [OK] .env n'est pas tracke" -ForegroundColor Green
    }
} else {
    Write-Host "  [INFO] Git non initialise (executez: git init)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[8/8] Verification des tests..." -ForegroundColor Cyan
npm run test 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Tests passent" -ForegroundColor Green
} else {
    Write-Host "  [ATTENTION] Certains tests echouent - verifiez" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "[SUCCESS] Tout est pret pour le deploiement!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines etapes:" -ForegroundColor Cyan
    Write-Host "1. Configurez les secrets GitHub (voir GITHUB_ACTIONS_SETUP.md)" -ForegroundColor Yellow
    Write-Host "2. Committez et pushez vers GitHub:" -ForegroundColor Yellow
    Write-Host "   git add ." -ForegroundColor White
    Write-Host "   git commit -m 'feat: ready for production'" -ForegroundColor White
    Write-Host "   git push origin main" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "[ATTENTION] Certains problemes detectes" -ForegroundColor Red
    Write-Host "Corrigez les erreurs ci-dessus avant de deployer" -ForegroundColor Yellow
    Write-Host ""
}
