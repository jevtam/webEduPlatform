# EduPlatform Backend

Backend-система для платформы онлайн-курсов. Проект состоит из двух сервисов:

* Main API на Nest.js
* Image Worker на Express.js

## Технологии

* Nest.js
* Express.js
* MongoDB
* Mongoose
* Redis
* Kafka
* Zookeeper
* Sharp
* Docker Compose
* JWT

## Запуск инфраструктуры

```bash
docker compose up -d
```

Поднимаются:

* MongoDB
* Redis
* Kafka
* Zookeeper

## Установка зависимостей

```bash
npm install
npm run install:all
```

## Запуск Main API

```bash
npm run dev:api
```

Main API запускается на:

```text
http://localhost:3000
```

## Запуск Image Worker

```bash
npm run dev:worker
```

Image Worker запускается на:

```text
http://localhost:3001
```

Проверка:

```text
GET http://localhost:3001/health
```

## Основные возможности

### Авторизация

Регистрация:

```text
POST /auth/register
```

Пример тела:

```json
{
  "name": "Teacher Test",
  "email": "teacher@test.com",
  "password": "123456",
  "role": "teacher"
}
```

Логин:

```text
POST /auth/login
```

Пример тела:

```json
{
  "email": "teacher@test.com",
  "password": "123456"
}
```

После логина API возвращает JWT-токен.

### Курсы

Получить список курсов:

```text
GET /courses
```

Получить курс по ID:

```text
GET /courses/:id
```

Создать курс, только teacher:

```text
POST /courses
```

Обновить курс, только teacher-владелец:

```text
PATCH /courses/:id
```

Удалить курс, только teacher-владелец:

```text
DELETE /courses/:id
```

Записаться на курс, только student:

```text
POST /courses/:id/enroll
```

### Уроки

Получить уроки курса:

```text
GET /courses/:courseId/lessons
```

Добавить урок, только teacher-владелец курса:

```text
POST /courses/:courseId/lessons
```

Обновить урок:

```text
PATCH /courses/:courseId/lessons/:lessonId
```

Удалить урок:

```text
DELETE /courses/:courseId/lessons/:lessonId
```

## Redis

Список курсов и детальная информация курса кэшируются в Redis.

Кэш инвалидируется при:

* создании курса
* обновлении курса
* удалении курса
* записи студента на курс
* загрузке обложки курса

## Kafka

Используются два топика:

```text
image.uploaded
image.processed
```

Main API отправляет событие `image.uploaded` после загрузки изображения.

Image Worker слушает `image.uploaded`, обрабатывает изображение через Sharp, накладывает водяной знак и отправляет событие `image.processed`.

Main API слушает `image.processed` и логирует результат обработки.

## Обработка изображений

Image Worker:

* получает задачу через Kafka
* сжимает изображение через Sharp
* накладывает водяной знак
* сохраняет обработанный файл в `uploads/processed`
* отправляет событие `image.processed`

Папки проекта:

```text
uploads/originals
uploads/processed
uploads/watermark
```

Файл водяного знака:

```text
uploads/watermark/watermark.png
```

## Проверка проекта

Рекомендуемый порядок проверки:

1. Запустить Docker Desktop.
2. Выполнить:

```bash
docker compose up -d
```

3. Запустить Main API:

```bash
npm run dev:api
```

4. Запустить Image Worker:

```bash
npm run dev:worker
```

5. Проверить регистрацию и логин.
6. Создать курс от имени teacher.
7. Создать урок в курсе.
8. Записаться на курс от имени student.
9. Проверить Redis-кэширование через повторный `GET /courses`.
10. Проверить Kafka и Image Worker через загрузку изображения или тестовое событие.
