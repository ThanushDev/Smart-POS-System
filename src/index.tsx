import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css'; // දැන් මෙය src ඇතුළේ ඇති නිසා ./ ලෙස තිබීම නිවැරදියි

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
