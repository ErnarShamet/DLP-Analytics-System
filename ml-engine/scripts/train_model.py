# ml-engine/scripts/train_model.py
import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer # Или CountVectorizer
from sklearn.naive_bayes import MultinomialNB # Простой классификатор для примера
from sklearn.linear_model import LogisticRegression # Другой вариант
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import joblib

from preprocess import preprocess_text # Импортируем нашу функцию предобработки

# --- Конфигурация ---
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
MODEL_NAME = 'sample_text_classifier.joblib'
MODEL_PATH = os.path.join(MODEL_DIR, MODEL_NAME)

# Создаем директорию для моделей, если ее нет
os.makedirs(MODEL_DIR, exist_ok=True)

def train_text_classification_model():
    """
    Обучает простую модель классификации текста и сохраняет ее.
    """
    print("Starting model training...")

    # 1. Загрузка и подготовка данных (пример)
    # В реальном проекте данные будут поступать из файлов, базы данных и т.д.
    data = {
        'text': [
            "This document contains highly confidential financial information.",
            "Project proposal for internal review only.",
            "Public announcement about our new product launch.",
            "Employee handbook and company policies.",
            "Strictly confidential merger and acquisition details.",
            "Customer support chat log regarding a billing issue.",
            "Marketing material for the upcoming campaign.",
            "Personal email about weekend plans.",
            "Source code for a critical system module.",
            "Internal memo about office relocation.",
            "Draft press release for immediate publication.",
            "Recipe for a chocolate cake.",
            "Meeting minutes - sensitive discussion on strategy.",
            "User credentials and access keys for server.",
            "General news article about technology trends.",
        ],
        'label': [ # Примерные метки чувствительности
            'Confidential', 'Internal', 'Public', 'Internal', 'Confidential',
            'Internal', 'Public', 'Public', 'Confidential', 'Internal',
            'Public', 'Public', 'Confidential', 'Confidential', 'Public'
        ]
    }
    df = pd.DataFrame(data)
    print(f"\nLoaded data with {len(df)} samples.")
    print("Label distribution:\n", df['label'].value_counts())

    # 2. Предварительная обработка текста
    # Если ваша модель (например, TfidfVectorizer) не делает это сама,
    # или если вы хотите применить пользовательскую предобработку.
    # В данном случае, TfidfVectorizer уже выполняет токенизацию и приведение к нижнему регистру.
    # Мы можем добавить нашу кастомную функцию preprocess_text в пайплайн, если она нужна
    # перед векторизацией, но для TF-IDF с его встроенными опциями это может быть избыточно
    # для базовых операций. Однако, для более сложной очистки (URL, email) она полезна.
    # df['processed_text'] = df['text'].apply(preprocess_text)
    # X = df['processed_text']

    # Для пайплайна с TfidfVectorizer, он может напрямую работать с 'text'
    X = df['text']
    y = df['label']

    # 3. Разделение данных на обучающую и тестовую выборки
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
    print(f"\nTraining set size: {len(X_train)}")
    print(f"Test set size: {len(X_test)}")

    # 4. Создание пайплайна модели
    # Пайплайн включает векторизацию текста и классификатор.
    # TfidfVectorizer преобразует текст в числовые признаки.
    # MultinomialNB - простой и эффективный классификатор для текста.
    model_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(stop_words='english', ngram_range=(1,2), max_df=0.95, min_df=1)), # Добавлены параметры
        # Можно добавить сюда собственный трансформер с preprocess_text, если нужно
        # ('preprocessor', FunctionTransformer(lambda texts: [preprocess_text(text) for text in texts])),
        ('classifier', MultinomialNB(alpha=0.1)) # Попробуйте LogisticRegression(solver='liblinear', random_state=42)
    ])
    print("\nModel pipeline created.")

    # 5. Обучение модели
    print("Training the model...")
    model_pipeline.fit(X_train, y_train)
    print("Model training completed.")

    # 6. Оценка модели
    print("\nEvaluating the model...")
    y_pred = model_pipeline.predict(X_test)
    print("Classification Report on Test Set:")
    print(classification_report(y_test, y_pred, zero_division=0))

    # (Опционально) Оценка на обучающей выборке для проверки переобучения
    # y_train_pred = model_pipeline.predict(X_train)
    # print("\nClassification Report on Training Set:")
    # print(classification_report(y_train, y_train_pred, zero_division=0))


    # 7. Сохранение обученной модели
    print(f"\nSaving the model to {MODEL_PATH}...")
    try:
        joblib.dump(model_pipeline, MODEL_PATH)
        print("Model saved successfully.")
    except Exception as e:
        print(f"Error saving model: {e}")

    # 8. (Опционально) Сохранение классов модели для использования в предсказании
    # model_classes = model_pipeline.classes_
    # joblib.dump(model_classes, os.path.join(MODEL_DIR, 'model_classes.joblib'))
    # print(f"Model classes saved: {model_classes}")


if __name__ == '__main__':
    train_text_classification_model()
    # Проверка загрузки сохраненной модели
    if os.path.exists(MODEL_PATH):
        print(f"\nVerifying saved model from {MODEL_PATH}...")
        loaded_model_pipeline = joblib.load(MODEL_PATH)
        print("Model loaded successfully for verification.")
        sample_texts_for_verification = [
            "This is a secret project plan.",
            "Hello world, this is a public blog post."
        ]
        predictions = loaded_model_pipeline.predict(sample_texts_for_verification)
        probabilities = loaded_model_pipeline.predict_proba(sample_texts_for_verification)
        print(f"Sample predictions: {predictions}")
        for i, text in enumerate(sample_texts_for_verification):
            print(f"Text: '{text}' -> Predicted: {predictions[i]}")
            # Показать вероятности для предсказанного класса
            class_index = list(loaded_model_pipeline.classes_).index(predictions[i])
            print(f"  Probability for {predictions[i]}: {probabilities[i, class_index]:.4f}")