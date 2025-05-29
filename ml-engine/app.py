# ml-engine/app.py
import os
from flask import Flask, request, jsonify
import joblib
import pandas as pd
from dotenv import load_dotenv

# --- Начало кода для Prometheus метрик ---
from prometheus_flask_exporter import PrometheusMetrics # Убедитесь, что вы сделали pip install prometheus_flask_exporter
# --- Конец кода для Prometheus метрик ---


load_dotenv()

from scripts.preprocess import preprocess_text
from scripts.predict_utils import make_prediction_text_classification

app = Flask(__name__)

# --- Инициализация метрик Prometheus ---
# Это автоматически добавит эндпоинт /metrics
# и будет собирать стандартные метрики Flask (запросы, задержки и т.д.)
metrics = PrometheusMetrics(app)
# Статические метрики (например, информация о приложении)
metrics.info('ml_engine_app_info', 'ML Engine application information', version='1.0.0', service_name='DLP ML Engine')
# --- Конец инициализации метрик ---


MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

try:
    text_classifier_model_path = os.path.join(MODEL_DIR, 'sample_text_classifier.joblib')
    if os.path.exists(text_classifier_model_path):
        text_classifier_model = joblib.load(text_classifier_model_path)
        print(f"Text classification model loaded successfully from {text_classifier_model_path}")
    else:
        text_classifier_model = None
        print(f"Warning: Text classification model not found at {text_classifier_model_path}. Endpoint /predict/document_sensitivity will not work.")
except Exception as e:
    print(f"Error loading ML model(s): {e}")
    text_classifier_model = None

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "UP", "service": "ML Engine"}), 200

@app.route('/predict/document_sensitivity', methods=['POST'])
# @metrics.gauge('ml_engine_active_predictions', 'Number of active predictions') # Пример кастомной метрики (gauge)
# @metrics.counter('ml_engine_predictions_total', 'Total number of predictions made', labels={'type': 'doc_sensitivity'}) # Пример кастомной метрики (counter)
def predict_document_sensitivity():
    if not text_classifier_model:
        return jsonify({"error": "Text classification model is not loaded."}), 503
    try:
        data = request.get_json()
        if not data or 'text_content' not in data:
            return jsonify({"error": "Missing 'text_content' in request body"}), 400
        text_content = data['text_content']
        prediction, probability = make_prediction_text_classification(text_classifier_model, [text_content])
        # metrics.counter('ml_engine_predictions_total', 'Total number of predictions made', labels={'type': 'doc_sensitivity'}).inc() # Инкремент счетчика
        return jsonify({
            "prediction_label": prediction[0],
            "probability": float(probability[0]),
            "model_version": "1.0.0"
        }), 200
    except Exception as e:
        app.logger.error(f"Error in /predict/document_sensitivity: {e}")
        # metrics.counter('ml_engine_prediction_errors_total', 'Total prediction errors', labels={'type': 'doc_sensitivity'}).inc()
        return jsonify({"error": "An error occurred during prediction.", "details": str(e)}), 500

@app.route('/predict/user_anomaly', methods=['POST'])
def predict_user_anomaly():
    return jsonify({
        "message": "UEBA model endpoint placeholder. Model not yet implemented.",
        "received_data": request.get_json()
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get("ML_ENGINE_PORT", 5002))
    app.run(host='0.0.0.0', port=port, debug=True) # debug=True для разработки