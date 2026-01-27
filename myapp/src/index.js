import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);
