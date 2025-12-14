***areal-hr_ext-test***

## Задание Реализовать веб-приложение, в котором специалист по кадрам ведет учет сотрудников в нескольких организациях.

# Areal HR System Stack
# Инструменты
-*Операционная система*: Windows 11 с установленным WSL2 и Docker Desktop  
-*IDE: IntelliJ IDEA + PgAdmin4*  
-*База данных: PostgreSQL 17(локально) (Docker контейнер)*  
-*Docker + Docker Compose*
-*Nginx*  
# Frontend
-Vite/Vue.js/Next.js(react)
# Backend
-Node.js*  
# Git  
git init  
git add .   
git commit -m "описание изменений"  
git remote add origin "ссылка на репозиторий"  
git push origin main

## Project commands
docker-compose up -d  
npm run start:dev  
npm run migrate:up  
npm run migrate:down

## Inscturction
-git clone 'link'  
-connect db in .env  
-docker migrate:up  
-docker compose up  
-npm run start:dev  
GO to http:/localhost:3000/'name of module'(for example employees)
GO to cmd and check CRUD with curl-commands

