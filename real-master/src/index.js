import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Root from './Root';  // Імпортуємо Root, де налаштовуємо маршрутизацію
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Root />  {/* Рендеримо Root замість App для маршрутизації */}
  </React.StrictMode>
);

// Якщо хочете вимірювати продуктивність в додатку, передайте функцію для логування результатів
// (наприклад: reportWebVitals(console.log)) або надішліть на аналітичний кінцевий точку.
reportWebVitals();
