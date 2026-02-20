import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NovaSessao from './pages/NovaSessao';
import NovaMeta from './pages/NovaMeta';
import NovaMateria from './pages/NovaMateria';
import Calendario from './pages/Calendario';
import RecuperarSenha from './pages/RecuperarSenha';
import Pomodoro from './pages/Pomodoro';
import Configuracoes from './pages/Configuracoes';
import Rotina from './pages/Rotina';

import { isAuthenticated } from './utils/auth';

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/" />;
};

const PublicRoute = ({ children }) => {
  return isAuthenticated() ? <Navigate to="/dashboard" /> : children;
};

function App() {
  useEffect(() => {
    const savedApp = localStorage.getItem('app_settings');
    if (!savedApp) return;

    try {
      const { fontSize } = JSON.parse(savedApp);
      if (fontSize) {
        document.documentElement.setAttribute('data-font-size', fontSize);
      }
    } catch (error) {
      console.error('Erro ao carregar configuracoes visuais', error);
    }
  }, []);

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
            fontSize: '14px'
          },
          success: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff'
            }
          }
        }}
      />

      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/nova-sessao"
          element={
            <PrivateRoute>
              <NovaSessao />
            </PrivateRoute>
          }
        />

        <Route
          path="/nova-meta"
          element={
            <PrivateRoute>
              <NovaMeta />
            </PrivateRoute>
          }
        />

        <Route
          path="/nova-materia"
          element={
            <PrivateRoute>
              <NovaMateria />
            </PrivateRoute>
          }
        />

        <Route
          path="/recuperar-senha"
          element={
            <PublicRoute>
              <RecuperarSenha />
            </PublicRoute>
          }
        />

        <Route
          path="/calendario"
          element={
            <PrivateRoute>
              <Calendario />
            </PrivateRoute>
          }
        />

        <Route
          path="/pomodoro"
          element={
            <PrivateRoute>
              <Pomodoro />
            </PrivateRoute>
          }
        />

        <Route
          path="/rotina"
          element={
            <PrivateRoute>
              <Rotina />
            </PrivateRoute>
          }
        />

        <Route
          path="/configuracoes"
          element={
            <PrivateRoute>
              <Configuracoes />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
