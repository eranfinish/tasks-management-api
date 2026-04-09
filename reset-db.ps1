# Reset Database Script for PowerShell
# Run this script to drop and recreate the tasks_db database

$env:PGPASSWORD = "123456"
$psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"

Write-Host "Dropping existing database..." -ForegroundColor Yellow
& $psqlPath -U postgres -h localhost -p 5434 -d postgres -c "DROP DATABASE IF EXISTS tasks_db;"

Write-Host "Creating new database..." -ForegroundColor Green
& $psqlPath -U postgres -h localhost -p 5434 -d postgres -c "CREATE DATABASE tasks_db;"

Write-Host "Database reset complete!" -ForegroundColor Cyan
Write-Host "Now restart your NestJS application - TypeORM will create all tables automatically." -ForegroundColor Cyan
