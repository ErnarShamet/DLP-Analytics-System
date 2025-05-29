# ml-engine/scripts/predict_utils.py
import numpy as np
# from scripts.preprocess import preprocess_text # Если предобработка нужна перед predict

def make_prediction_text_classification(model, texts_to_predict: list[str]):
    """
    Делает предсказание с использованием загруженной модели классификации текста.
    Предполагается, что `model` - это обученный пайплайн scikit-learn.

    Args:
        model: Обученная модель/пайплайн.
        texts_to_predict: Список строк для классификации.

    Returns:
        tuple: (predictions, probabilities)
               predictions - список предсказанных меток.
               probabilities - список максимальных вероятностей для каждой предсказанной метки.
    """
    if not hasattr(model, 'predict') or not hasattr(model, 'predict_proba'):
        raise ValueError("Model does not have 'predict' or 'predict_proba' methods.")

    # Если ваша модель ожидает предобработанный текст и это не часть пайплайна:
    # processed_texts = [preprocess_text(text) for text in texts_to_predict]
    # predictions = model.predict(processed_texts)
    # probabilities_all_classes = model.predict_proba(processed_texts)

    # Если модель (пайплайн) обрабатывает сырой текст:
    predictions = model.predict(texts_to_predict)
    probabilities_all_classes = model.predict_proba(texts_to_predict)

    # Получаем максимальную вероятность для каждого предсказания
    # (соответствует вероятности предсказанного класса)
    max_probabilities = np.max(probabilities_all_classes, axis=1)

    return predictions, max_probabilities


# Пример для UEBA (потребует адаптации, когда модель будет готова)
def make_prediction_ueba(model, feature_dataframe):
    """
    Делает предсказание аномалии с использованием модели UEBA.
    """
    if not hasattr(model, 'predict'):
        raise ValueError("UEBA Model does not have a 'predict' method.")

    predictions = model.predict(feature_dataframe) # Например, 0 - норма, 1 - аномалия

    anomaly_scores = None
    if hasattr(model, 'decision_function'): # Для моделей типа IsolationForest, OneClassSVM
        anomaly_scores = model.decision_function(feature_dataframe)
    elif hasattr(model, 'predict_proba'): # Если это классификатор, дающий вероятности
        # Для бинарной классификации, score может быть вероятностью класса "аномалия"
        proba = model.predict_proba(feature_dataframe)
        if proba.shape[1] == 2: # Бинарная классификация
            anomaly_scores = proba[:, 1] # Вероятность класса "аномалия"
        else: # Многоклассовая (редко для чистого обнаружения аномалий)
            anomaly_scores = np.max(proba, axis=1)


    return predictions, anomaly_scores

if __name__ == '__main__':
    # Этот блок не будет выполняться при импорте, но полезен для тестирования функций здесь
    # Загрузите модель, чтобы протестировать make_prediction_text_classification
    import joblib
    import os
    MODEL_DIR_TEST = os.path.join(os.path.dirname(__file__), '..', 'models')
    MODEL_PATH_TEST = os.path.join(MODEL_DIR_TEST, 'sample_text_classifier.joblib')
    if os.path.exists(MODEL_PATH_TEST):
        test_model = joblib.load(MODEL_PATH_TEST)
        sample_texts = ["This is confidential company data.", "A public statement for everyone."]
        preds, probs = make_prediction_text_classification(test_model, sample_texts)
        for text, pred, prob in zip(sample_texts, preds, probs):
            print(f"Text: '{text}' -> Predicted: {pred}, Probability: {prob:.4f}")
    else:
        print(f"Test model not found at {MODEL_PATH_TEST}. Run train_model.py first.")