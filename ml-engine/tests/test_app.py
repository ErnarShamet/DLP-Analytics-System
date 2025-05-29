# ml-engine/tests/test_app.py
import pytest
import requests # Для HTTP-запросов к вашему Flask-приложению
import json
import os
from dotenv import load_dotenv

# Загрузка переменных окружения для тестов
# Предполагается, что .env файл находится в корневой директории ml-engine
# или что переменные окружения установлены в среде CI/CD
# Этот путь может потребовать корректировки в зависимости от того, откуда запускаются тесты
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env.test') # Можно создать отдельный .env.test
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else: # Фоллбэк на основной .env, если .env.test не найден
    dotenv_path_fallback = os.path.join(os.path.dirname(__file__), '..', '.env')
    if os.path.exists(dotenv_path_fallback):
        load_dotenv(dotenv_path_fallback)


# Базовый URL вашего ML-сервиса. Убедитесь, что он запущен перед тестами.
# Для интеграционных тестов он должен быть доступен.
# Для unit-тестов Flask-приложения используется test_client.
# Здесь мы предполагаем интеграционный тест с запущенным сервисом.
ML_ENGINE_BASE_URL = os.getenv("TEST_ML_ENGINE_URL", "http://localhost:5002") # Используйте переменную окружения

# Фикстура для проверки, доступен ли сервис (простой ping)
@pytest.fixture(scope="session", autouse=True) # autouse=True выполнит это перед всеми тестами
def service_is_running():
    try:
        response = requests.get(f"{ML_ENGINE_BASE_URL}/health", timeout=5)
        response.raise_for_status() # Вызовет исключение для кодов 4xx/5xx
        if response.json().get("status") != "UP":
            pytest.fail("ML Engine health check reports not UP.")
    except requests.exceptions.ConnectionError:
        pytest.fail(f"ML Engine is not running or not accessible at {ML_ENGINE_BASE_URL}. Start the service before running tests.")
    except requests.exceptions.RequestException as e:
        pytest.fail(f"Health check failed: {e}")


def test_health_check():
    """Тестирует эндпоинт /health."""
    response = requests.get(f"{ML_ENGINE_BASE_URL}/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"
    assert data["service"] == "ML Engine"

def test_predict_document_sensitivity_valid_input():
    """Тестирует эндпоинт /predict/document_sensitivity с валидными данными."""
    payload = {
        "text_content": "This is a highly confidential internal document about financial results.",
        "metadata": {"filename": "confidential.docx"}
    }
    headers = {'Content-Type': 'application/json'}
    response = requests.post(f"{ML_ENGINE_BASE_URL}/predict/document_sensitivity", data=json.dumps(payload), headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert "prediction_label" in data
    assert "probability" in data
    assert isinstance(data["probability"], float)
    # Можно добавить более конкретные проверки, если вы знаете ожидаемые метки
    # Например: assert data["prediction_label"] in ["Confidential", "Internal", "Public"]

def test_predict_document_sensitivity_missing_content():
    """Тестирует эндпоинт /predict/document_sensitivity с отсутствующим text_content."""
    payload = {
        "metadata": {"filename": "some_doc.txt"}
    }
    headers = {'Content-Type': 'application/json'}
    response = requests.post(f"{ML_ENGINE_BASE_URL}/predict/document_sensitivity", data=json.dumps(payload), headers=headers)

    assert response.status_code == 400 # Bad Request
    data = response.json()
    assert "error" in data
    assert "Missing 'text_content'" in data["error"]

def test_predict_document_sensitivity_empty_content():
    """Тестирует эндпоинт /predict/document_sensitivity с пустым text_content."""
    payload = {
        "text_content": "",
    }
    headers = {'Content-Type': 'application/json'}
    response = requests.post(f"{ML_ENGINE_BASE_URL}/predict/document_sensitivity", data=json.dumps(payload), headers=headers)

    assert response.status_code == 200 # Модель должна обработать пустой текст
    data = response.json()
    assert "prediction_label" in data
    # Ожидаемое поведение для пустого текста зависит от вашей модели (например, "Public")

# Добавьте тесты для /predict/user_anomaly, когда он будет реализован

# Чтобы запустить тесты:
# 1. Убедитесь, что ML-сервис запущен (например, `docker-compose up ml-engine` или `python app.py`)
# 2. В терминале, в директории `ml-engine`: `pytest` или `python -m pytest`