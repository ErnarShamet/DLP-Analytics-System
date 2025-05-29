// frontend/src/utils/helpers.ts

/**
 * Генерирует простой уникальный идентификатор.
 * @param length Длина ID.
 * @returns Строка ID.
 */
export const generateShortId = (length: number = 8): string => {
    return Math.random().toString(36).substring(2, 2 + length);
};

/**
 * Форматирует объект ApiError в читаемую строку.
 * @param error Объект ошибки ApiError или любая ошибка.
 * @returns Строка с сообщением об ошибке.
 */
interface GenericApiError {
    message?: string;
    error?: string; // Часто бэкенд возвращает 'error'
    errors?: Record<string, string[]>; // Для ошибок валидации
    // ... другие возможные поля
}

export const formatApiErrorMessage = (error: any): string => {
    if (typeof error === 'string') {
        return error;
    }

    const apiError = error as GenericApiError;

    if (apiError?.message) {
        return apiError.message;
    }
    if (apiError?.error && typeof apiError.error === 'string') {
        return apiError.error;
    }
    if (apiError?.errors) {
        // Берем первое сообщение из первой ошибки валидации для простоты
        const fieldErrors = Object.values(apiError.errors);
        if (fieldErrors.length > 0 && fieldErrors[0].length > 0) {
            return fieldErrors[0][0];
        }
    }
    return 'An unexpected error occurred. Please try again.';
};


/**
 * Функция для проверки, является ли объект пустым.
 * @param obj Объект для проверки.
 * @returns true, если объект пуст, иначе false.
 */
export const isEmptyObject = (obj: object | null | undefined): boolean => {
    if (obj === null || obj === undefined) {
        return true;
    }
    return Object.keys(obj).length === 0 && obj.constructor === Object;
};

// Пример функции для обрезки текста до определенной длины
export const truncateText = (text: string | undefined | null, maxLength: number): string => {
    if (!text) return '';
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
};
