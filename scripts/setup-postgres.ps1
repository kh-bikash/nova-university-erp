# Setup PostgreSQL database for KL University ERP

$psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql"
$pgUser = "postgres"
$dbUser = "university_user"
$dbPassword = "university_password_123"
$dbName = "university_erp"

Write-Host "Setting up PostgreSQL database..." -ForegroundColor Green
Write-Host ""

# Create database user
Write-Host "Creating database user '$dbUser'..."
& $psqlPath -U $pgUser -c "CREATE USER $dbUser WITH PASSWORD '$dbPassword';" 2>&1 | ForEach-Object { Write-Host $_ }

# Create database
Write-Host "Creating database '$dbName'..."
& $psqlPath -U $pgUser -c "CREATE DATABASE $dbName OWNER $dbUser;" 2>&1 | ForEach-Object { Write-Host $_ }

# Grant privileges
Write-Host "Granting privileges..."
& $psqlPath -U $pgUser -c "GRANT ALL PRIVILEGES ON DATABASE $dbName TO $dbUser;" 2>&1 | ForEach-Object { Write-Host $_ }

# Run schema setup
Write-Host ""
Write-Host "Running schema setup..."
$schemaFile = "$PSScriptRoot\01-create-tables.sql"
if (Test-Path $schemaFile) {
    & $psqlPath -U $dbUser -d $dbName -f $schemaFile 2>&1 | ForEach-Object { Write-Host $_ }
    Write-Host "Schema setup complete" -ForegroundColor Green
} else {
    Write-Host "Schema file not found: $schemaFile" -ForegroundColor Red
}

Write-Host ""
Write-Host "PostgreSQL setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Connection string:" -ForegroundColor Yellow
Write-Host "postgresql://$($dbUser):$($dbPassword)@localhost:5432/$dbName" -ForegroundColor Cyan
Write-Host ""
Write-Host "Update your .env.local with:" -ForegroundColor Yellow
Write-Host "DATABASE_URL=postgresql://$($dbUser):$($dbPassword)@localhost:5432/$dbName" -ForegroundColor Cyan
