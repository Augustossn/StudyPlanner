import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './utils/themeContext'; // <--- Importe

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider> {/* <--- Envolva o App */}
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)