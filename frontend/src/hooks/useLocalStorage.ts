// frontend/src/hooks/useLocalStorage.ts

import { useState, useEffect } from 'react';

type SetValue<T> = (value: T | ((val: T) => T)) => void;

function useLocalStorage<T,>(key: string, initialValue: T): [T, SetValue<T>] {
    // Получаем начальное значение из localStorage или используем initialValue
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key “${key}”:`, error);
            return initialValue;
        }
    });

    // useEffect для обновления localStorage при изменении storedValue
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                if (storedValue === undefined) { // Не хранить undefined
                    window.localStorage.removeItem(key);
                } else {
                    window.localStorage.setItem(key, JSON.stringify(storedValue));
                }
            } catch (error) {
                console.error(`Error setting localStorage key “${key}”:`, error);
            }
        }
    }, [key, storedValue]);

    // Обработчик для изменения значения, который также обновляет localStorage
    const setValue: SetValue<T> = (value) => {
        try {
            // Позволяем передавать функцию для обновления, как в useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
        } catch (error) {
            console.error(`Error setting value for localStorage key “${key}”:`, error);
        }
    };

    return [storedValue, setValue];
}

export default useLocalStorage;
