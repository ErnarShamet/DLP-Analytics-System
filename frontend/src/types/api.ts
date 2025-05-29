// frontend/src/types/api.ts
// Типы для ошибок API
export interface ApiError {
    message: string; // Основное сообщение об ошибке
    errors?: Record<string, string[]>; // Для ошибок валидации полей
    statusCode?: number; // HTTP статус код
    success?: boolean; // Обычно false для ошибок
    // Можно добавить другие поля, которые возвращает ваш бэкенд
    error?: string; // Иногда бэкенд возвращает поле 'error' вместо 'message'
}

// Общий тип для ответа API с пагинацией
export interface PaginatedResponse<T> {
    data: T[];
    count: number; // Общее количество записей
    // Могут быть и другие поля, такие как:
    // page: number;
    // limit: number;
    // totalPages: number;
    success: boolean;
}

// Общий тип для одиночного ответа API
export interface SingleResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}