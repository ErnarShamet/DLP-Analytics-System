// backend/services/mlService.js
const axios = require('axios');

const mlEngineBaseUrl = process.env.ML_ENGINE_URL || 'http://ml-engine:5002'; // From .env or docker-compose

const mlApiClient = axios.create({
    baseURL: mlEngineBaseUrl,
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json'
        // Add any auth tokens if your ML engine requires them
        // 'X-API-Key': process.env.ML_ENGINE_API_KEY
    }
});

/**
 * Analyzes text content for sensitivity or classification.
 * @param {string} text The text to analyze.
 * @param {object} metadata Optional metadata about the text (e.g., filename, source).
 * @returns {Promise<object>} The prediction result from the ML engine.
 */
const analyzeTextContent = async (text, metadata = {}) => {
    try {
        const response = await mlApiClient.post('/predict/document_sensitivity', {
            text_content: text,
            metadata: metadata
        });
        return response.data; // e.g., { sensitivity_score: 0.8, classification: 'Confidential', keywords_found: ['ssn'] }
    } catch (error) {
        console.error('Error calling ML engine for text analysis:', error.message);
        // Handle different types of errors (network, ML engine error response)
        if (error.response) {
            console.error('ML Engine Response Error:', error.response.status, error.response.data);
            throw new Error(`ML Engine error: ${error.response.data.error || error.response.status}`);
        } else if (error.request) {
            console.error('ML Engine No Response:', error.request);
            throw new Error('No response from ML Engine service.');
        } else {
            throw new Error(`Failed to analyze text content: ${error.message}`);
        }
    }
};

/**
 * Analyzes user activity for anomalies.
 * @param {object} activityData Features describing user activity.
 * @returns {Promise<object>} The prediction result from the ML engine.
 */
const analyzeUserBehavior = async (activityData) => {
    try {
        const response = await mlApiClient.post('/predict/user_anomaly', {
            activity_features: activityData
            // e.g., activityData: { login_frequency: 5, data_accessed_volume: 1024, unusual_time: true }
        });
        return response.data; // e.g., { anomaly_score: 0.95, is_anomalous: true, contributing_factors: ['unusual_time'] }
    } catch (error) {
        console.error('Error calling ML engine for user behavior analysis:', error.message);
        if (error.response) {
            console.error('ML Engine Response Error:', error.response.status, error.response.data);
            throw new Error(`ML Engine error: ${error.response.data.error || error.response.status}`);
        } else if (error.request) {
            console.error('ML Engine No Response:', error.request);
            throw new Error('No response from ML Engine service.');
        } else {
            throw new Error(`Failed to analyze user behavior: ${error.message}`);
        }
    }
};

// Add more functions to interact with other ML endpoints as needed
// e.g., image analysis, data exfiltration detection, etc.

module.exports = {
    analyzeTextContent,
    analyzeUserBehavior
};