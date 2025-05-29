// frontend/src/react-app-env.d.ts
/// <reference types="react-scripts" />

// Можно добавить пользовательские типы переменных окружения здесь
// Например, если у вас есть REACT_APP_CUSTOM_VAR в .env
declare global {
    namespace NodeJS {
        interface ProcessEnv {
        REACT_APP_API_URL: string;
        REACT_APP_NAME: string;
        // Добавьте другие пользовательские переменные окружения здесь
        }
    }
}
// Убедитесь, что что-то экспортируется, чтобы сделать это модулем
export {};