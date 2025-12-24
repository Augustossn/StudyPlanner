import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NovaSessao from './pages/NovaSessao';
import NovaMeta from './pages/NovaMeta';
import NovaMateria from './pages/NovaMateria';

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #333',
            padding: '16px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#3b82f6', 
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444', 
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/nova-sessao" element={<NovaSessao />} />
        <Route path="/nova-meta" element={<NovaMeta />} />
        <Route path="/nova-materia" element={<NovaMateria />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;