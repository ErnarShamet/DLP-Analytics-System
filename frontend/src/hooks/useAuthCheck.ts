// frontend/src/hooks/useAuthCheck.ts

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCurrentUser, selectIsAuthenticated, selectAuthToken } from '../store/slices/authSlice';

interface UseAuthCheckOptions {
    fetchIfNoUser?: boolean; // Пытаться ли загрузить пользователя, если его нет в сторе, но есть токен
}

/**
 * Хук для проверки состояния аутентификации и возможной загрузки данных пользователя.
 * @param options - Опции для хука.
 */
const useAuthCheck = (options?: UseAuthCheckOptions) => {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const token = useAppSelector(selectAuthToken); // Или直接 localStorage.getItem('authToken')

    useEffect(() => {
        // Если есть токен, но пользователь не аутентифицирован (например, после перезагрузки страницы)
        // и опция fetchIfNoUser установлена
        if (options?.fetchIfNoUser && token && !isAuthenticated) {
            console.log('useAuthCheck: Token found, user not authenticated. Fetching current user...');
            dispatch(fetchCurrentUser());
        }
        // Здесь можно добавить другую логику, например, проверку срока действия токена,
        // если она не обрабатывается полностью в apiService интерцепторе.

    }, [dispatch, isAuthenticated, token, options?.fetchIfNoUser]); // Зависимости

    return { isAuthenticated, token }; // Возвращаем текущее состояние для удобства
};

export default useAuthCheck;
