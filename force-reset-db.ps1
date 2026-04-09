# Force Reset Database Script
# This will forcefully disconnect all users and reset the database

$env:PGPASSWORD = "123456"
$psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"

Write-Host "Step 1: Terminating all connections to tasks_db..." -ForegroundColor Yellow
& $psqlPath -U postgres -h localhost -p 5434 -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'tasks_db' AND pid <> pg_backend_pid();"

Start-Sleep -Seconds 2

Write-Host "Step 2: Dropping database..." -ForegroundColor Yellow
& $psqlPath -U postgres -h localhost -p 5434 -d postgres -c "DROP DATABASE IF EXISTS tasks_db;"

Write-Host "Step 3: Creating fresh database..." -ForegroundColor Green
& $psqlPath -U postgres -h localhost -p 5434 -d postgres -c "CREATE DATABASE tasks_db;"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Database reset successfully!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your NestJS application (npm run start:dev)" -ForegroundColor White
Write-Host "2. TypeORM will automatically create all tables" -ForegroundColor White
Write-Host "3. Test authentication endpoints" -ForegroundColor White
