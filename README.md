<!-- DLP-Analytics-System/README.md -->

# DLP Analytics System

## Описание проекта

DLP Analytics System - это комплексная система для предотвращения утечек данных (DLP) с расширенными аналитическими возможностями и элементами машинного обучения для обнаружения аномалий и классификации данных.

## Основные возможности (Планируемые/Реализованные)

*   **Управление политиками DLP:** Создание, редактирование и применение гибких политик безопасности.
*   **Мониторинг событий и оповещений:** Отслеживание потенциальных нарушений политик в реальном времени.
*   **Управление инцидентами:** Расследование и реагирование на инциденты безопасности.
*   **Аналитика и отчетность:** Визуализация данных, трендов и статистики по событиям DLP.
*   **Пользовательская и поведенческая аналитика (UEBA):** Обнаружение аномального поведения пользователей с помощью ML.
*   **Классификация контента:** Автоматическое определение чувствительности данных с помощью ML.
*   **Управление пользователями и ролями:** Разграничение доступа на основе ролей.
*   **Мониторинг системы:** Сбор метрик и визуализация состояния компонентов системы.

## Технологический стек

*   **Бэкенд:** Node.js, Express.js, MongoDB, Redis
*   **Фронтенд:** React, TypeScript, Material-UI, Tailwind CSS, Redux Toolkit, React Query
*   **ML-движок:** Python, Flask (или FastAPI), Scikit-learn (и другие ML/DL библиотеки)
*   **Оркестрация (Локально):** Docker, Docker Compose
*   **Оркестрация (Продакшен):** Kubernetes
*   **Мониторинг:** Prometheus, Grafana
*   **База данных:** MongoDB
*   **Кэш:** Redis

## Структура проекта
DLP-Analytics-System/
    ├── backend/ # Node.js бэкенд (Express.js)
    │   ├── config/ # Конфигурации (база данных, Redis)
    │   │   ├── db.js
    │   │   └── redisClient.js
    │   ├── controllers/ # Контроллеры API (логика обработки запросов)
    │   │   ├── alertController.js
    │   │   ├── authController.js
    │   │   ├── incidentController.js
    │   │   ├── policyController.js
    │   │   └── userController.js
    │   ├── middleware/ # Промежуточное ПО (аутентификация, обработка ошибок)
    │   │   ├── auth.js
    │   │   ├── error.js
    │   │   └── validate.js
    │   ├── models/ # Модели данных MongoDB (Mongoose схемы)
    │   │   ├── Alert.js
    │   │   ├── Incident.js
    │   │   ├── Policy.js
    │   │   └── User.js
    │   ├── routes/ # Определения маршрутов API
    │   │   ├── alertRoutes.js
    │   │   ├── authRoutes.js
    │   │   ├── incidentRoutes.js
    │   │   ├── policyRoutes.js
    │   │   └── userRoutes.js
    │   ├── services/ # Сервисы (например, для взаимодействия с ML-движком)
    │   │   └── mlService.js
    │   ├── node_modules/ # Зависимости Node.js
    │   ├── .env # Локальные переменные окружения для бэкенда
    │   ├── Dockerfile # Dockerfile для сборки образа бэкенда
    │   ├── package-lock.json
    │   ├── package.json # Зависимости и скрипты проекта
    │   └── server.js # Точка входа в приложение бэкенда
    ├── frontend/ # React фронтенд (TypeScript)
    │   ├── public/ # Статические ассеты и index.html
    │   │   └── index.html
    │   ├── src/ # Исходный код фронтенда
    │   │   ├── assets/ # Статические ресурсы (изображения, шрифты)
    │   │   │   └── images/ # (пусто, но структура для изображений есть)
    │   │   ├── components/ # Переиспользуемые UI компоненты
    │   │   │   ├── alerts/
    │   │   │   │   └── AlertsTable.tsx
    │   │   │   ├── auth/
    │   │   │   │   ├── ForgotPasswordForm.tsx
    │   │   │   │   ├── LoginForm.tsx
    │   │   │   │   └── RegisterForm.tsx
    │   │   │   ├── common/
    │   │   │   │   ├── Button.tsx
    │   │   │   │   ├── Input.tsx
    │   │   │   │   ├── Modal.tsx
    │   │   │   │   ├── PageHeader.tsx
    │   │   │   │   ├── Spinner.tsx
    │   │   │   │   └── Table.tsx
    │   │   │   ├── dashboard/
    │   │   │   │     └── SummaryWidget.tsx
    │   │   │   ├── incidents/
    │   │   │   │     └── IncidentCard.tsx
    │   │   │   ├── policies/
    │   │   │   │     └── PolicyEditor.tsx
    │   │   │   ├── MainLayout.tsx
    │   │   │   └── ProtectedRoute.tsx
    │   │   ├── contexts/ # React Contexts
    │   │   │   ├── AuthContext.tsx
    │   │   │   └── ThemeContext.tsx
    │   │   ├── hooks/ # Пользовательские React хуки
    │   │   │   ├── useAuthCheck.ts
    │   │   │   ├── useDebounce.ts
    │   │   │   └── useLocalStorage.ts
    │   │   ├── pages/ # Компоненты страниц приложения
    │   │   │   ├── admin/ # (пусто, но структура для админ-панели есть)
    │   │   │   ├── AlertDetailPage.tsx
    │   │   │   ├── AlertsPage.tsx
    │   │   │   ├── DashboardPage.tsx
    │   │   │   ├── IncidentPage.tsx
    │   │   │   ├── LoginPage.tsx
    │   │   │   ├── NotFoundPage.tsx
    │   │   │   ├── PolicyPage.tsx
    │   │   │   └── RegisterPage.tsx
    │   │   ├── services/ # Сервисы для взаимодействия с API
    │   │   │   └── apiService.ts
    │   │   ├── store/ # Redux Toolkit хранилище и срезы (slices)
    │   │   │   ├── slices/
    │   │   │   │   ├── alertSlice.ts
    │   │   │   │   └── authSlice.ts
    │   │   │   ├── hooks.ts
    │   │   │   └── index.ts
    │   │   ├── types/ # TypeScript типы и интерфейсы
    │   │   │   ├── api.ts
    │   │   │   └── index.ts
    │   │   ├── utils/ # Утилиты (пусто, но структура есть)
    │   │   ├── App.tsx
    │   │   ├── index.css
    │   │   ├── index.tsx
    │   │   ├── react-app-env.d.ts
    │   │   ├── reportWebVitals.ts
    │   │   └── setupTests.ts
    │   ├── Dockerfile # Dockerfile для сборки образа фронтенда (с Nginx)
    │   ├── nginx.conf # Конфигурация Nginx для фронтенда
    │   ├── package.json # Зависимости и скрипты проекта
    │   ├── tailwind.config.js # Конфигурация Tailwind CSS
    │   └── tsconfig.json # Конфигурация TypeScript
    ├── kubernetes/ # Конфигурационные файлы Kubernetes для развертывания
    │   ├── backend-deployment.yaml # (0 байт, возможно в разработке)
    │   ├── configmap.yaml
    │   ├── frontend-deployment.yaml
    │   ├── ingress.yaml
    │   ├── ml-engine-deployment.yaml
    │   ├── mongo-statefulset.yaml
    │   ├── redis-deployment.yaml
    │   ├── secrets.yaml
    │   └── services.yaml
    ├── ml-engine/ # Python ML-движок (Flask/FastAPI)
    │   ├── models/ # Сохраненные ML модели
    │   │   └── sample_text_classifier.joblib # (0 байт, пример модели)
    │   ├── scripts/ # Скрипты для тренировки, препроцессинга, предсказаний
    │   │   ├── pycache/
    │   │   ├── predict_utils.py
    │   │   ├── preprocess.py
    │   │   └── train_model.py
    │   ├── source/ # Python virtual environment (или его часть)
    │   │   ├── Include/
    │   │   ├── Lib/
    │   │   ├── Scripts/
    │   │   └── pyvenv.cfg
    │   ├── tests/ # Тесты для ML-движка
    │   │   ├── test_app.py
    │   │   └── init.py
    │   ├── venv/ # Python virtual environment (альтернативная или основная)
    │   │   ├── bin/
    │   │   ├── Include/
    │   │   ├── Lib/
    │   │   ├── Scripts/
    │   │   └── pyvenv.cfg
    │   ├── app.py # Точка входа в ML-приложение (API)
    │   ├── Dockerfile # Dockerfile для сборки образа ML-движка
    │   └── requirements.txt # Зависимости Python
    ├── monitoring/ # Конфигурации для системы мониторинга
    │   ├── grafana/ # Конфигурации Grafana
    │   │   └── provisioning/
    │   │   ├── dashboards/
    │   │   │   ├── dashboard_files/
    │   │   │   │ └── sample-dashboard.json
    │   │   │   ├── backend-overview.json
    │   │   │   └── dashboard.yml
    │   │   ├── datasources/
    │   │   │   └── datasource.yml
    │   │   └── grafana.ini
    │   └── prometheus.yml # Конфигурация Prometheus
    ├── .env # Общие переменные окружения для docker-compose
    ├── .env.example # Пример файла .env
    ├── .gitignore # Файлы и папки, игнорируемые Git
    ├── docker-compose.yml # Конфигурация Docker Compose для локального запуска
    └── README.md # Этот файл
#   D L P - A n a l y t i c s - S y s t e m  
 #   D L P - A n a l y t i c s - S y s t e m  
 