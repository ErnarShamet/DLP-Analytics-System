// frontend/src/index.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css'; // Tailwind CSS is loaded via CDN in index.html
import App from './App';
import reportWebVitals from './reportWebVitals';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

reportWebVitals();
