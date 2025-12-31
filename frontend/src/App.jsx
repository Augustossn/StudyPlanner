import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NovaSessao from './pages/NovaSessao';
import NovaMeta from './pages/NovaMeta';
import NovaMateria from './pages/NovaMateria';
import { isAuthenticated } from './utils/auth'; // Certifique-se de ter criado este arquivo
import RecuperarSenha from './pages/RecuperarSenha';

// --- COMPONENTES DE PROTEÇÃO DE ROTA ---

// 1. Rota Privada: Só entra se estiver logado. Se não, vai pro Login.
const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/" />;
};

// 2. Rota Pública: Só entra se NÃO estiver logado. Se já estiver, vai pro Dashboard.
// (É isso que faz o usuário "pular" o login se marcou "Permanecer conectado")
const PublicRoute = ({ children }) => {
  return isAuthenticated() ? <Navigate to="/dashboard" /> : children;
};

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
        
        {/* Rota de Login (Protegida contra quem já está logado) */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />

        {/* Rotas do Sistema (Protegidas contra quem NÃO está logado) */}
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
        
        {/* Rota Coringa: Redireciona qualquer URL inválida para a raiz */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </Router>
  );
}

export default App;