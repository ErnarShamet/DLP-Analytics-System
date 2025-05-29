# ml-engine/scripts/preprocess.py
import re
import string
# import nltk
# from nltk.corpus import stopwords
# from nltk.stem import PorterStemmer, WordNetLemmatizer
# nltk.download('stopwords', quiet=True)
# nltk.download('wordnet', quiet=True)
# nltk.download('omw-1.4', quiet=True) # Для WordNetLemmatizer

# stop_words = set(stopwords.words('english'))
# stemmer = PorterStemmer()
# lemmatizer = WordNetLemmatizer()

def preprocess_text(text: str) -> str:
    """
    Базовая функция предварительной обработки текста.
    - Приведение к нижнему регистру
    - Удаление пунктуации
    - Удаление чисел (опционально)
    - Удаление лишних пробелов
    - (Опционально) Удаление стоп-слов
    - (Опционально) Стемминг или лемматизация
    """
    if not isinstance(text, str):
        return ""

    # 1. Приведение к нижнему регистру
    text = text.lower()

    # 2. Удаление URL-адресов
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)

    # 3. Удаление email-адресов
    text = re.sub(r'\S*@\S*\s?', '', text)

    # 4. Удаление пунктуации
    text = text.translate(str.maketrans('', '', string.punctuation))

    # 5. Удаление чисел (если нужно)
    # text = re.sub(r'\d+', '', text)

    # 6. Токенизация (простое разделение по пробелам для примера)
    words = text.split()

    # 7. Удаление стоп-слов (опционально)
    # words = [word for word in words if word not in stop_words]

    # 8. Стемминг или лемматизация (выберите одно, если нужно)
    # words = [stemmer.stem(word) for word in words]
    # words = [lemmatizer.lemmatize(word) for word in words]

    # 9. Объединение обратно в строку и удаление лишних пробелов
    processed_text = " ".join(words).strip()
    processed_text = re.sub(r'\s+', ' ', processed_text) # Удаление множественных пробелов

    return processed_text

if __name__ == '__main__':
    sample = "This is a Sample Text with Punctuation! And numbers 123. Visit http://example.com or email test@example.org."
    print(f"Original: {sample}")
    print(f"Processed: {preprocess_text(sample)}")

    sample_ru = "Это Пример текста на русском с пунктуацией! И цифрами 12345."
    print(f"Original RU: {sample_ru}")
    print(f"Processed RU: {preprocess_text(sample_ru)}") # Простая обработка также сработает