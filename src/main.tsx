import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { applyThemeToDOM, getActiveThemeId } from './services/genrePresetService';

// Initialize and apply visual theme & typography to DOM
try {
  applyThemeToDOM(getActiveThemeId());
} catch (e) {}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
